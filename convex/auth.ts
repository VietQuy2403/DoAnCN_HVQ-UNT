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
            throw new Error("Email đã được sử dụng");
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.passwordHash,
            name: args.name,
            createdAt: Date.now(),
        });

        return userId;
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
            throw new Error("Email hoặc mật khẩu không đúng");
        }

        if (user.passwordHash !== args.passwordHash) {
            throw new Error("Email hoặc mật khẩu không đúng");
        }

        return {
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
