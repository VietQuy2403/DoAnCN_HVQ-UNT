import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Tạo hoặc cập nhật profile
export const upsertProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        age: v.optional(v.number()),
        gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
        weight: v.optional(v.number()),
        height: v.optional(v.number()),
        targetWeight: v.optional(v.number()),
        dietaryRestrictions: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        // Sync name to users table
        await ctx.db.patch(args.userId, {
            name: args.name,
        });

        // Kiểm tra xem đã có profile chưa
        const existingProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existingProfile) {
            // Cập nhật profile hiện tại
            await ctx.db.patch(existingProfile._id, {
                name: args.name,
                age: args.age,
                gender: args.gender,
                weight: args.weight,
                height: args.height,
                targetWeight: args.targetWeight,
                dietaryRestrictions: args.dietaryRestrictions,
                updatedAt: Date.now(),
            });
            return existingProfile._id;
        } else {
            // Tạo profile mới
            const profileId = await ctx.db.insert("userProfiles", {
                userId: args.userId,
                name: args.name,
                age: args.age,
                gender: args.gender,
                weight: args.weight,
                height: args.height,
                targetWeight: args.targetWeight,
                dietaryRestrictions: args.dietaryRestrictions,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            return profileId;
        }
    },
});

// Lấy profile của user
export const getProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        if (!args.userId) {
            return null;
        }

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        return profile;
    },
});
