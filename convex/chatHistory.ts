import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lưu tin nhắn chat vào lịch sử
 */
export const saveChat = mutation({
    args: {
        userId: v.id("users"),
        message: v.string(),
        response: v.string(),
    },
    handler: async (ctx, args) => {
        const chatId = await ctx.db.insert("chatHistory", {
            userId: args.userId,
            message: args.message,
            response: args.response,
            timestamp: Date.now(),
        });
        return chatId;
    },
});

/**
 * Lấy lịch sử chat của user (50 tin nhắn gần nhất)
 */
export const getChatHistory = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const chats = await ctx.db
            .query("chatHistory")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(50);

        // Reverse để hiển thị từ cũ đến mới
        return chats.reverse();
    },
});

/**
 * Xóa toàn bộ lịch sử chat của user
 */
export const clearHistory = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const chats = await ctx.db
            .query("chatHistory")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        for (const chat of chats) {
            await ctx.db.delete(chat._id);
        }

        return { deleted: chats.length };
    },
});

/**
 * Đếm số tin nhắn của user hôm nay (để giới hạn)
 */
export const getTodayMessageCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const chats = await ctx.db
            .query("chatHistory")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.gte(q.field("timestamp"), todayTimestamp))
            .collect();

        return chats.length;
    },
});
