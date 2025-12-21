import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Lưu meal plan mới
export const saveMealPlan = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        goal: v.union(v.literal("weight_loss"), v.literal("muscle_gain"), v.literal("maintenance")),
        targetCalories: v.number(),
        plan: v.any(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập để lưu kế hoạch");
        }

        const mealPlanId = await ctx.db.insert("mealPlans", {
            userId: args.userId,
            title: args.title,
            goal: args.goal,
            targetCalories: args.targetCalories,
            plan: args.plan,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isFavorite: false,
        });

        return mealPlanId;
    },
});

// Lấy tất cả meal plans của user
export const getMealPlans = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        if (!args.userId) {
            return [];
        }

        const mealPlans = await ctx.db
            .query("mealPlans")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return mealPlans;
    },
});

// Lấy một meal plan cụ thể
export const getMealPlan = query({
    args: {
        id: v.id("mealPlans"),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        const mealPlan = await ctx.db.get(args.id);

        if (mealPlan && mealPlan.userId !== args.userId) {
            throw new Error("Bạn không có quyền truy cập kế hoạch này");
        }

        return mealPlan;
    },
});

// Xóa meal plan
export const deleteMealPlan = mutation({
    args: {
        id: v.id("mealPlans"),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        const mealPlan = await ctx.db.get(args.id);

        if (mealPlan && mealPlan.userId !== args.userId) {
            throw new Error("Bạn không có quyền xóa kế hoạch này");
        }

        await ctx.db.delete(args.id);
    },
});

// Toggle favorite
export const toggleFavorite = mutation({
    args: {
        id: v.id("mealPlans"),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        const mealPlan = await ctx.db.get(args.id);

        if (mealPlan && mealPlan.userId !== args.userId) {
            throw new Error("Bạn không có quyền cập nhật kế hoạch này");
        }

        await ctx.db.patch(args.id, {
            isFavorite: !(mealPlan?.isFavorite || false),
        });
    },
});
