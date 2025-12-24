import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get today's tracking data
export const getTodayTracking = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const tracking = await ctx.db
            .query("dailyTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", today)
            )
            .first();

        return tracking;
    },
});

// Toggle meal consumed status
export const toggleMealConsumed = mutation({
    args: {
        userId: v.id("users"),
        mealIndex: v.number(),
    },
    handler: async (ctx, args) => {
        const today = new Date().toISOString().split('T')[0];

        const tracking = await ctx.db
            .query("dailyTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", today)
            )
            .first();

        if (!tracking) {
            throw new Error("No tracking data found for today");
        }

        // Toggle the meal consumed status
        const updatedMeals = [...tracking.mealsConsumed];
        if (updatedMeals[args.mealIndex]) {
            updatedMeals[args.mealIndex] = {
                ...updatedMeals[args.mealIndex],
                isConsumed: !updatedMeals[args.mealIndex].isConsumed,
            };
        }

        // Recalculate total calories
        const totalCalories = updatedMeals
            .filter(meal => meal.isConsumed)
            .reduce((sum, meal) => sum + meal.calories, 0);

        await ctx.db.patch(tracking._id, {
            mealsConsumed: updatedMeals,
            totalCalories,
        });

        return { success: true, totalCalories };
    },
});

// Initialize today's tracking from meal plan
export const initializeTodayTracking = mutation({
    args: {
        userId: v.id("users"),
        meals: v.array(v.object({
            mealType: v.string(),
            foodName: v.string(),
            calories: v.number(),
            protein: v.optional(v.number()),
            carbs: v.optional(v.number()),
            fat: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const today = new Date().toISOString().split('T')[0];

        // Check if tracking already exists
        const existing = await ctx.db
            .query("dailyTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", today)
            )
            .first();

        if (existing) {
            return existing;
        }

        // Create new tracking with all meals unchecked
        const mealsConsumed = args.meals.map(meal => ({
            ...meal,
            isConsumed: false,
        }));

        const trackingId = await ctx.db.insert("dailyTracking", {
            userId: args.userId,
            date: today,
            mealsConsumed,
            totalCalories: 0,
            waterIntake: 0,
            createdAt: Date.now(),
        });

        return await ctx.db.get(trackingId);
    },
});

// Update today's tracking with new meals (when active meal plan changes)
export const updateTodayTracking = mutation({
    args: {
        userId: v.id("users"),
        meals: v.array(v.object({
            mealType: v.string(),
            foodName: v.string(),
            calories: v.number(),
            protein: v.optional(v.number()),
            carbs: v.optional(v.number()),
            fat: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const today = new Date().toISOString().split('T')[0];

        // Find existing tracking
        const existing = await ctx.db
            .query("dailyTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", today)
            )
            .first();

        if (!existing) {
            // Create new if not exists
            const mealsConsumed = args.meals.map(meal => ({
                ...meal,
                isConsumed: false,
            }));

            const trackingId = await ctx.db.insert("dailyTracking", {
                userId: args.userId,
                date: today,
                mealsConsumed,
                totalCalories: 0,
                waterIntake: 0,
                createdAt: Date.now(),
            });

            return await ctx.db.get(trackingId);
        }

        // Update existing tracking with new meals
        const mealsConsumed = args.meals.map(meal => ({
            ...meal,
            isConsumed: false, // Reset all to unchecked
        }));

        await ctx.db.patch(existing._id, {
            mealsConsumed,
            totalCalories: 0, // Reset calories
        });

        return await ctx.db.get(existing._id);
    },
});

// Get tracking history for charts
export const getTrackingHistory = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 7;

        const trackingHistory = await ctx.db
            .query("dailyTracking")
            .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);

        return trackingHistory.reverse(); // Return in chronological order
    },
});
