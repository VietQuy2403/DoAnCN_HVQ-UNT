import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Set active meal plan for user
export const setActiveMealPlan = mutation({
    args: {
        userId: v.id("users"),
        mealPlanId: v.id("mealPlans"),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        // Check if user already has a settings record
        const existingSettings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existingSettings) {
            // Update existing settings
            await ctx.db.patch(existingSettings._id, {
                activeMealPlanId: args.mealPlanId,
                updatedAt: Date.now(),
            });
            return existingSettings._id;
        } else {
            // Create new settings record
            const settingsId = await ctx.db.insert("userSettings", {
                userId: args.userId,
                activeMealPlanId: args.mealPlanId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            return settingsId;
        }
    },
});

// Get active meal plan ID for user
export const getActiveMealPlanId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        if (!args.userId) {
            return null;
        }

        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        return settings?.activeMealPlanId || null;
    },
});
