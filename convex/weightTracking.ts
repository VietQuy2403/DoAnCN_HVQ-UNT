import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log weight for a specific date
export const logWeight = mutation({
    args: {
        userId: v.id("users"),
        weight: v.number(),
        date: v.string(), // YYYY-MM-DD
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if entry exists for this date
        const existing = await ctx.db
            .query("weightTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", args.date)
            )
            .first();

        if (existing) {
            // Update existing entry
            await ctx.db.patch(existing._id, {
                weight: args.weight,
                note: args.note,
            });
            return existing._id;
        } else {
            // Create new entry
            const weightId = await ctx.db.insert("weightTracking", {
                userId: args.userId,
                weight: args.weight,
                date: args.date,
                note: args.note,
                createdAt: Date.now(),
            });
            return weightId;
        }
    },
});

// Get weight history for a user
export const getWeightHistory = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 100; // Increase default limit

        const weights = await ctx.db
            .query("weightTracking")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        // Sort by createdAt descending to get newest first
        const sortedWeights = weights.sort((a, b) => b.createdAt - a.createdAt);

        return sortedWeights.slice(0, limit);
    },
});

// Get latest weight
export const getLatestWeight = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const latest = await ctx.db
            .query("weightTracking")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .first();

        return latest;
    },
});

// Get weight for specific date
export const getWeightByDate = query({
    args: {
        userId: v.id("users"),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const weight = await ctx.db
            .query("weightTracking")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", args.userId).eq("date", args.date)
            )
            .first();

        return weight;
    },
});
