import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Schema cho app ăn kiêng với Custom Auth
export default defineSchema({
  // Custom users table for authentication
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Bảng lưu thông tin profile người dùng
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    weight: v.optional(v.number()), // kg
    height: v.optional(v.number()), // cm
    targetWeight: v.optional(v.number()), // kg - cân nặng mục tiêu
    activityLevel: v.optional(v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("very_active")
    )),
    goal: v.optional(v.union(
      v.literal("weight_loss"),
      v.literal("muscle_gain"),
      v.literal("maintenance")
    )),
    dietaryRestrictions: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Bảng lưu kế hoạch ăn uống
  mealPlans: defineTable({
    userId: v.id("users"),
    title: v.string(),
    goal: v.union(
      v.literal("weight_loss"),
      v.literal("muscle_gain"),
      v.literal("maintenance")
    ),
    targetCalories: v.number(),
    plan: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isFavorite: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  // Bảng lưu lịch sử theo dõi
  dailyTracking: defineTable({
    userId: v.id("users"),
    date: v.string(),
    mealsConsumed: v.array(v.object({
      mealType: v.string(),
      foodName: v.string(),
      calories: v.number(),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      isConsumed: v.optional(v.boolean()),
    })),
    totalCalories: v.number(),
    waterIntake: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_and_date", ["userId", "date"]),

  // Bảng theo dõi cân nặng hàng ngày
  weightTracking: defineTable({
    userId: v.id("users"),
    weight: v.number(), // kg
    date: v.string(), // YYYY-MM-DD format
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  // Bảng database món ăn
  foodDatabase: defineTable({
    name: v.string(),
    category: v.string(), // "main", "side", "snack", "drink", "fruit"
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    portion: v.string(), // "1 tô", "100g", "1 quả"
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())), // Danh sách nguyên liệu
    recipe: v.optional(v.array(v.string())), // Các bước nấu
  })
    .index("by_category", ["category"])
    .index("by_name", ["name"]),

  // Bảng cài đặt người dùng
  userSettings: defineTable({
    userId: v.id("users"),
    activeMealPlanId: v.optional(v.id("mealPlans")), // Meal plan đang được chọn
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Bảng lịch sử chat với AI
  chatHistory: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "timestamp"]),
});
