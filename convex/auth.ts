import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sign up - Tạo user mới
export const signUp = mutation({
    args: {
        email: v.string(),
        passwordHash: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            return { success: false, error: "Email đã được sử dụng" };
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.passwordHash,
            name: args.name,
            createdAt: Date.now(),
        });

        return { success: true, userId };
    },
});

// Sign in - Verify credentials
export const signIn = query({
    args: {
        email: v.string(),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return { success: false, error: "Email hoặc mật khẩu không đúng" };
        }

        if (user.passwordHash !== args.passwordHash) {
            return { success: false, error: "Email hoặc mật khẩu không đúng" };
        }

        return {
            success: true,
            userId: user._id,
            email: user.email,
            name: user.name,
        };
    },
});

// Get user by ID
export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
        };
    },
});
