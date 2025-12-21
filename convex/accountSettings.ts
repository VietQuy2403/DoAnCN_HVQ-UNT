import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Update user's display name
export const updateUserName = mutation({
    args: {
        userId: v.id("users"),
        newName: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        if (!args.newName || args.newName.trim().length === 0) {
            throw new Error("Tên không được để trống");
        }

        // Update name in users table
        await ctx.db.patch(args.userId, {
            name: args.newName.trim(),
        });

        // Update name in userProfiles table
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, {
                name: args.newName.trim(),
                updatedAt: Date.now(),
            });
        }

        return { success: true };
    },
});

// Update user's password
export const updateUserPassword = mutation({
    args: {
        userId: v.id("users"),
        currentPasswordHash: v.string(),
        newPasswordHash: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        // Get user from database
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        // Verify current password
        if (user.passwordHash !== args.currentPasswordHash) {
            throw new Error("Mật khẩu hiện tại không đúng");
        }

        // Update password
        await ctx.db.patch(args.userId, {
            passwordHash: args.newPasswordHash,
        });

        return { success: true };
    },
});

// Update user's email
export const updateUserEmail = mutation({
    args: {
        userId: v.id("users"),
        newEmail: v.string(),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Bạn cần đăng nhập");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.newEmail)) {
            throw new Error("Email không hợp lệ");
        }

        // Get user from database
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        // Verify password
        if (user.passwordHash !== args.passwordHash) {
            throw new Error("Mật khẩu không đúng");
        }

        // Check if new email is already in use
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.newEmail))
            .first();

        if (existingUser && existingUser._id !== args.userId) {
            throw new Error("Email này đã được sử dụng");
        }

        // Update email
        await ctx.db.patch(args.userId, {
            email: args.newEmail.toLowerCase().trim(),
        });

        return { success: true };
    },
});
