import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all foods
export const getAllFoods = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("foodDatabase").collect();
    },
});

// Get foods by category
export const getFoodsByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("foodDatabase")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
    },
});

// Search foods by name
export const searchFoods = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        const allFoods = await ctx.db.query("foodDatabase").collect();
        const searchLower = args.searchTerm.toLowerCase();
        return allFoods.filter(food =>
            food.name.toLowerCase().includes(searchLower)
        );
    },
});

// Clear all food database
export const clearFoodDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        const allFoods = await ctx.db.query("foodDatabase").collect();
        for (const food of allFoods) {
            await ctx.db.delete(food._id);
        }
        return { success: true, deleted: allFoods.length };
    },
});

// Seed food database with Vietnamese dishes (all with ingredients and recipes)
export const seedFoodDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing data first
        const existing = await ctx.db.query("foodDatabase").collect();
        for (const food of existing) {
            await ctx.db.delete(food._id);
        }

        const foods = [
            // Món chính (Main Dishes)
            {
                name: "Phở bò",
                category: "main",
                calories: 350,
                protein: 20,
                carbs: 50,
                fat: 8,
                portion: "1 tô (500ml)",
                description: "Món ăn truyền thống Việt Nam",
                ingredients: ["200g bánh phở", "150g thịt bò", "500ml nước dùng", "Hành tây, gừng", "Gia vị: hồi, quế", "Rau thơm"],
                recipe: ["Ninh xương bò 3-4 giờ", "Thêm gia vị vào nước dùng", "Trụng bánh phở", "Chần thịt bò", "Xếp bánh phở và thịt", "Chan nước dùng nóng"]
            },
            {
                name: "Phở gà",
                category: "main",
                calories: 320,
                protein: 18,
                carbs: 48,
                fat: 6,
                portion: "1 tô (500ml)",
                description: "Phở với thịt gà",
                ingredients: ["200g bánh phở", "150g thịt gà", "500ml nước dùng gà", "Hành tây, gừng", "Rau thơm"],
                recipe: ["Luộc gà với gừng", "Ninh xương gà làm nước dùng", "Trụng bánh phở", "Xé thịt gà", "Xếp bánh phở và gà", "Chan nước dùng"]
            },
            {
                name: "Cơm tấm",
                category: "main",
                calories: 550,
                protein: 25,
                carbs: 70,
                fat: 15,
                portion: "1 đĩa",
                description: "Cơm tấm sườn bì chả",
                ingredients: ["200g cơm tấm", "100g sườn non", "50g bì", "1 quả trứng", "Nước mắm pha", "Dưa leo"],
                recipe: ["Ướp sườn với nước mắm, đường", "Nướng sườn trên than", "Luộc bì, thái sợi", "Chiên trứng", "Xếp cơm, sườn, bì, trứng", "Ăn kèm nước mắm"]
            },
            {
                name: "Cơm gà",
                category: "main",
                calories: 480,
                protein: 30,
                carbs: 60,
                fat: 12,
                portion: "1 đĩa",
                description: "Cơm gà xối mỡ",
                ingredients: ["200g cơm", "150g thịt gà", "Hành tây, tỏi", "Gừng", "Nước mắm"],
                recipe: ["Luộc gà với gừng", "Xé thịt gà", "Phi hành tỏi", "Xối mỡ gà lên cơm", "Xếp thịt gà", "Ăn kèm nước mắm gừng"]
            },
            {
                name: "Bún bò Huế",
                category: "main",
                calories: 420,
                protein: 22,
                carbs: 55,
                fat: 12,
                portion: "1 tô",
                description: "Món bún cay đặc trưng Huế",
                ingredients: ["200g bún bò", "100g thịt bò", "50g chả lụa", "Sả, mắm ruốc", "Ớt, tiêu", "Rau sống"],
                recipe: ["Ninh xương bò với sả", "Thêm mắm ruốc, ớt", "Luộc bún", "Thái thịt bò, chả", "Cho bún vào tô", "Chan nước dùng cay"]
            },
            {
                name: "Bún chả",
                category: "main",
                calories: 450,
                protein: 24,
                carbs: 52,
                fat: 16,
                portion: "1 phần",
                description: "Bún với chả nướng",
                ingredients: ["200g bún", "150g thịt nạc vai", "Nước mắm, đường", "Tỏi, ớt", "Rau sống"],
                recipe: ["Ướp thịt với nước mắm, đường", "Nặn thịt thành viên", "Nướng chả trên than", "Pha nước mắm chua ngọt", "Cho chả vào bát nước mắm", "Ăn kèm bún và rau"]
            },
            {
                name: "Bánh mì thịt",
                category: "main",
                calories: 380,
                protein: 18,
                carbs: 42,
                fat: 14,
                portion: "1 ổ",
                description: "Bánh mì kẹp thịt",
                ingredients: ["1 ổ bánh mì", "100g thịt nguội", "Pate", "Dưa leo, cà chua", "Rau thơm", "Tương ớt"],
                recipe: ["Nướng bánh mì giòn", "Phết pate", "Kẹp thịt nguội", "Thêm rau, dưa leo", "Rưới tương ớt"]
            },
            {
                name: "Cơm chiên",
                category: "main",
                calories: 520,
                protein: 15,
                carbs: 68,
                fat: 18,
                portion: "1 đĩa",
                description: "Cơm chiên trứng",
                ingredients: ["200g cơm nguội", "2 quả trứng", "Hành tây, tỏi", "Xì dầu", "Rau củ"],
                recipe: ["Đánh trứng", "Phi hành tỏi thơm", "Cho cơm vào xào", "Thêm trứng", "Nêm xì dầu", "Xào đều"]
            },
            {
                name: "Mì xào",
                category: "main",
                calories: 480,
                protein: 16,
                carbs: 62,
                fat: 16,
                portion: "1 đĩa",
                description: "Mì xào thập cẩm",
                ingredients: ["200g mì", "100g thịt/tôm", "Rau củ", "Hành tây, tỏi", "Xì dầu"],
                recipe: ["Luộc mì", "Phi hành tỏi", "Xào thịt/tôm", "Cho mì vào xào", "Thêm rau củ", "Nêm xì dầu"]
            },
            {
                name: "Hủ tiếu",
                category: "main",
                calories: 340,
                protein: 16,
                carbs: 50,
                fat: 8,
                portion: "1 tô",
                description: "Hủ tiếu Nam Vang",
                ingredients: ["200g hủ tiếu", "100g thịt/tôm", "Nước dùng xương", "Rau thơm", "Tỏi phi"],
                recipe: ["Ninh xương làm nước dùng", "Trụng hủ tiếu", "Luộc thịt/tôm", "Cho hủ tiếu vào tô", "Chan nước dùng", "Thêm rau thơm"]
            },

            // Món phụ (Side Dishes)
            {
                name: "Rau xào",
                category: "side",
                calories: 80,
                protein: 3,
                carbs: 10,
                fat: 3,
                portion: "1 đĩa",
                description: "Rau củ xào",
                ingredients: ["200g rau củ", "Tỏi", "Dầu ăn", "Muối"],
                recipe: ["Rửa rau sạch", "Phi tỏi thơm", "Cho rau vào xào nhanh", "Nêm muối vừa ăn"]
            },
            {
                name: "Canh chua",
                category: "side",
                calories: 120,
                protein: 12,
                carbs: 8,
                fat: 4,
                portion: "1 tô",
                description: "Canh chua cá",
                ingredients: ["150g cá", "Cà chua, dứa", "Rau thơm", "Me, đường", "Nước mắm"],
                recipe: ["Nấu nước sôi", "Cho cà chua, dứa vào", "Thêm cá", "Nêm me, đường, nước mắm", "Thêm rau thơm"]
            },
            {
                name: "Gỏi cuốn",
                category: "side",
                calories: 150,
                protein: 8,
                carbs: 20,
                fat: 4,
                portion: "2 cuốn",
                description: "Gỏi cuốn tôm thịt",
                ingredients: ["Bánh tráng", "Tôm, thịt luộc", "Bún tươi", "Rau sống", "Nước chấm"],
                recipe: ["Luộc tôm, thịt", "Trụng bánh tráng", "Xếp rau, bún, tôm, thịt", "Cuốn chặt", "Ăn kèm nước chấm"]
            },
            {
                name: "Nem rán",
                category: "side",
                calories: 200,
                protein: 10,
                carbs: 18,
                fat: 10,
                portion: "3 cái",
                description: "Chả giò",
                ingredients: ["Bánh đa nem", "Thịt băm", "Miến", "Rau củ", "Trứng"],
                recipe: ["Trộn nhân thịt, miến, rau", "Gói nem", "Chiên vàng giòn", "Ăn kèm nước mắm"]
            },
            {
                name: "Đậu hũ chiên",
                category: "side",
                calories: 180,
                protein: 12,
                carbs: 8,
                fat: 12,
                portion: "100g",
                description: "Đậu phụ chiên giòn",
                ingredients: ["200g đậu hũ", "Dầu ăn", "Muối", "Nước mắm"],
                recipe: ["Cắt đậu hũ miếng vừa", "Chiên vàng giòn", "Ăn kèm nước mắm"]
            },
            {
                name: "Canh rau",
                category: "side",
                calories: 60,
                protein: 2,
                carbs: 8,
                fat: 2,
                portion: "1 tô",
                description: "Canh rau củ",
                ingredients: ["Rau củ", "Nước", "Muối", "Hành"],
                recipe: ["Nấu nước sôi", "Cho rau củ vào", "Nêm muối", "Thêm hành"]
            },
            {
                name: "Salad",
                category: "side",
                calories: 100,
                protein: 4,
                carbs: 12,
                fat: 4,
                portion: "1 đĩa",
                description: "Salad rau trộn",
                ingredients: ["Rau xà lách", "Cà chua", "Dưa leo", "Sốt salad"],
                recipe: ["Rửa rau sạch", "Thái rau", "Trộn đều", "Rưới sốt"]
            },
            {
                name: "Trứng luộc",
                category: "side",
                calories: 140,
                protein: 12,
                carbs: 2,
                fat: 10,
                portion: "2 quả",
                description: "Trứng gà luộc",
                ingredients: ["2 quả trứng gà", "Nước", "Muối"],
                recipe: ["Đun nước sôi", "Cho trứng vào", "Luộc 8-10 phút", "Ngâm nước lạnh"]
            },
            {
                name: "Thịt kho",
                category: "side",
                calories: 250,
                protein: 20,
                carbs: 8,
                fat: 16,
                portion: "100g",
                description: "Thịt kho tàu",
                ingredients: ["200g thịt ba chỉ", "Trứng", "Nước dừa", "Nước mắm, đường"],
                recipe: ["Luộc thịt sơ", "Kho với nước dừa", "Thêm trứng", "Nêm nước mắm, đường", "Kho đến thịt mềm"]
            },
            {
                name: "Cá kho",
                category: "side",
                calories: 220,
                protein: 22,
                carbs: 6,
                fat: 12,
                portion: "100g",
                description: "Cá kho tộ",
                ingredients: ["200g cá", "Nước mắm, đường", "Tỏi, ớt", "Nước dừa"],
                recipe: ["Ướp cá với gia vị", "Kho với nước dừa", "Nêm vừa ăn", "Kho đến cá thấm gia vị"]
            },

            // Snacks
            {
                name: "Bánh bao",
                category: "snack",
                calories: 220,
                protein: 8,
                carbs: 32,
                fat: 6,
                portion: "1 cái",
                description: "Bánh bao nhân thịt",
                ingredients: ["Bột mì", "Thịt băm", "Trứng", "Men", "Đường"],
                recipe: ["Nhào bột", "Ủ bột nở", "Làm nhân thịt", "Gói bánh", "Hấp chín"]
            },
            {
                name: "Chè",
                category: "snack",
                calories: 180,
                protein: 4,
                carbs: 35,
                fat: 3,
                portion: "1 chén",
                description: "Chè đậu xanh",
                ingredients: ["Đậu xanh", "Đường", "Nước cốt dừa"],
                recipe: ["Nấu đậu xanh mềm", "Thêm đường", "Cho nước cốt dừa", "Khuấy đều"]
            },
            {
                name: "Sữa chua",
                category: "snack",
                calories: 120,
                protein: 6,
                carbs: 18,
                fat: 3,
                portion: "1 hộp",
                description: "Sữa chua không đường",
                ingredients: ["Sữa tươi", "Men sữa chua"],
                recipe: ["Đun sữa ấm", "Cho men vào", "Ủ 6-8 giờ", "Bảo quản lạnh"]
            },
            {
                name: "Hạnh nhân",
                category: "snack",
                calories: 160,
                protein: 6,
                carbs: 6,
                fat: 14,
                portion: "30g",
                description: "Hạnh nhân rang",
                ingredients: ["Hạnh nhân sống", "Muối"],
                recipe: ["Rang hạnh nhân", "Rắc muối nhẹ"]
            },
            {
                name: "Bánh quy",
                category: "snack",
                calories: 140,
                protein: 2,
                carbs: 20,
                fat: 6,
                portion: "4 cái",
                description: "Bánh quy giòn",
                ingredients: ["Bột mì", "Bơ", "Đường", "Trứng"],
                recipe: ["Trộn bột, bơ, đường", "Cán mỏng", "Cắt hình", "Nướng vàng"]
            },
            {
                name: "Khoai lang luộc",
                category: "snack",
                calories: 110,
                protein: 2,
                carbs: 26,
                fat: 0,
                portion: "100g",
                description: "Khoai lang hấp",
                ingredients: ["Khoai lang", "Nước"],
                recipe: ["Rửa khoai sạch", "Hấp chín", "Bóc vỏ ăn"]
            },
            {
                name: "Ngô luộc",
                category: "snack",
                calories: 130,
                protein: 4,
                carbs: 28,
                fat: 2,
                portion: "1 bắp",
                description: "Ngô bao tử luộc",
                ingredients: ["Ngô tươi", "Nước", "Muối"],
                recipe: ["Bóc lá ngô", "Luộc trong nước muối", "Luộc 15-20 phút"]
            },
            {
                name: "Bánh flan",
                category: "snack",
                calories: 150,
                protein: 5,
                carbs: 22,
                fat: 5,
                portion: "1 cái",
                description: "Bánh flan caramel",
                ingredients: ["Trứng", "Sữa", "Đường", "Vani"],
                recipe: ["Làm caramel", "Trộn trứng, sữa, đường", "Đổ vào khuôn", "Hấp chín"]
            },
            {
                name: "Bánh mì nướng",
                category: "snack",
                calories: 180,
                protein: 6,
                carbs: 30,
                fat: 4,
                portion: "2 lát",
                description: "Bánh mì nướng bơ",
                ingredients: ["Bánh mì", "Bơ"],
                recipe: ["Cắt bánh mì lát", "Phết bơ", "Nướng vàng"]
            },
            {
                name: "Sữa đậu nành",
                category: "snack",
                calories: 100,
                protein: 7,
                carbs: 12,
                fat: 3,
                portion: "1 ly (250ml)",
                description: "Sữa đậu nành không đường",
                ingredients: ["Đậu nành", "Nước"],
                recipe: ["Ngâm đậu nành", "Xay nhuyễn", "Lọc lấy nước", "Đun sôi"]
            },

            // Fruits
            {
                name: "Chuối",
                category: "fruit",
                calories: 105,
                protein: 1,
                carbs: 27,
                fat: 0,
                portion: "1 quả",
                description: "Chuối tiêu",
                ingredients: ["Chuối tươi"],
                recipe: ["Bóc vỏ", "Ăn trực tiếp"]
            },
            {
                name: "Táo",
                category: "fruit",
                calories: 95,
                protein: 0,
                carbs: 25,
                fat: 0,
                portion: "1 quả",
                description: "Táo ta",
                ingredients: ["Táo tươi"],
                recipe: ["Rửa sạch", "Ăn cả vỏ hoặc gọt vỏ"]
            },
            {
                name: "Cam",
                category: "fruit",
                calories: 62,
                protein: 1,
                carbs: 15,
                fat: 0,
                portion: "1 quả",
                description: "Cam sành",
                ingredients: ["Cam tươi"],
                recipe: ["Bóc vỏ", "Ăn múi"]
            },
            {
                name: "Xoài",
                category: "fruit",
                calories: 135,
                protein: 1,
                carbs: 35,
                fat: 0,
                portion: "1 quả",
                description: "Xoài cát",
                ingredients: ["Xoài chín"],
                recipe: ["Gọt vỏ", "Thái múi"]
            },
            {
                name: "Đu đủ",
                category: "fruit",
                calories: 60,
                protein: 1,
                carbs: 15,
                fat: 0,
                portion: "1 chén",
                description: "Đu đủ chín",
                ingredients: ["Đu đủ chín"],
                recipe: ["Gọt vỏ", "Bỏ hạt", "Thái miếng"]
            },
            {
                name: "Nho",
                category: "fruit",
                calories: 104,
                protein: 1,
                carbs: 27,
                fat: 0,
                portion: "1 chùm (150g)",
                description: "Nho xanh",
                ingredients: ["Nho tươi"],
                recipe: ["Rửa sạch", "Ăn từng quả"]
            },
            {
                name: "Dưa hấu",
                category: "fruit",
                calories: 46,
                protein: 1,
                carbs: 12,
                fat: 0,
                portion: "1 lát (150g)",
                description: "Dưa hấu đỏ",
                ingredients: ["Dưa hấu tươi"],
                recipe: ["Cắt lát", "Bỏ hạt", "Ăn thịt dưa"]
            },
            {
                name: "Dứa",
                category: "fruit",
                calories: 82,
                protein: 1,
                carbs: 22,
                fat: 0,
                portion: "1 lát (165g)",
                description: "Dứa tươi",
                ingredients: ["Dứa tươi"],
                recipe: ["Gọt vỏ", "Bỏ mắt", "Thái lát"]
            },
            {
                name: "Bưởi",
                category: "fruit",
                calories: 76,
                protein: 2,
                carbs: 19,
                fat: 0,
                portion: "1/2 quả",
                description: "Bưởi da xanh",
                ingredients: ["Bưởi tươi"],
                recipe: ["Bóc vỏ", "Tách múi", "Bóc màng"]
            },
            {
                name: "Dâu tây",
                category: "fruit",
                calories: 49,
                protein: 1,
                carbs: 12,
                fat: 0,
                portion: "1 chén (150g)",
                description: "Dâu tây tươi",
                ingredients: ["Dâu tây tươi"],
                recipe: ["Rửa sạch", "Bỏ cuống", "Ăn trực tiếp"]
            },

            // Drinks
            {
                name: "Nước ép cam",
                category: "drink",
                calories: 112,
                protein: 2,
                carbs: 26,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Nước cam vắt",
                ingredients: ["3 quả cam", "Đường (tùy chọn)"],
                recipe: ["Vắt cam lấy nước", "Lọc bỏ xác", "Thêm đường nếu cần"]
            },
            {
                name: "Trà sữa",
                category: "drink",
                calories: 280,
                protein: 4,
                carbs: 48,
                fat: 8,
                portion: "1 ly (500ml)",
                description: "Trà sữa trân châu",
                ingredients: ["Trà đen", "Sữa", "Đường", "Trân châu"],
                recipe: ["Pha trà đen", "Thêm sữa, đường", "Cho trân châu", "Khuấy đều"]
            },
            {
                name: "Cà phê sữa",
                category: "drink",
                calories: 150,
                protein: 3,
                carbs: 24,
                fat: 4,
                portion: "1 ly (250ml)",
                description: "Cà phê sữa đá",
                ingredients: ["Cà phê phin", "Sữa đặc", "Đá"],
                recipe: ["Pha cà phê phin", "Cho sữa đặc vào ly", "Đổ cà phê", "Thêm đá"]
            },
            {
                name: "Nước dừa",
                category: "drink",
                calories: 46,
                protein: 2,
                carbs: 9,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Nước dừa tươi",
                ingredients: ["1 trái dừa tươi"],
                recipe: ["Chọn dừa tươi", "Chặt lấy nước", "Uống trực tiếp"]
            },
            {
                name: "Sinh tố bơ",
                category: "drink",
                calories: 220,
                protein: 4,
                carbs: 28,
                fat: 12,
                portion: "1 ly (300ml)",
                description: "Sinh tố bơ sữa",
                ingredients: ["1 quả bơ", "Sữa tươi", "Đường", "Đá"],
                recipe: ["Bóc vỏ bơ", "Cho vào máy xay", "Thêm sữa, đường, đá", "Xay nhuyễn"]
            },
            {
                name: "Nước chanh",
                category: "drink",
                calories: 60,
                protein: 0,
                carbs: 16,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Nước chanh đường",
                ingredients: ["2 quả chanh", "Đường", "Nước"],
                recipe: ["Vắt chanh lấy nước", "Pha với nước", "Thêm đường", "Khuấy đều"]
            },
            {
                name: "Trà xanh",
                category: "drink",
                calories: 2,
                protein: 0,
                carbs: 0,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Trà xanh không đường",
                ingredients: ["Lá trà xanh", "Nước nóng"],
                recipe: ["Đun nước sôi", "Ủ trà 3-5 phút", "Lọc lấy nước"]
            },
            {
                name: "Nước ép dưa hấu",
                category: "drink",
                calories: 72,
                protein: 1,
                carbs: 18,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Nước dưa hấu vắt",
                ingredients: ["Dưa hấu tươi", "Đường (tùy chọn)"],
                recipe: ["Cắt dưa hấu", "Xay nhuyễn", "Lọc lấy nước", "Thêm đường nếu cần"]
            },
            {
                name: "Sữa tươi",
                category: "drink",
                calories: 150,
                protein: 8,
                carbs: 12,
                fat: 8,
                portion: "1 ly (250ml)",
                description: "Sữa tươi nguyên kem",
                ingredients: ["Sữa tươi"],
                recipe: ["Rót sữa vào ly", "Uống trực tiếp hoặc làm lạnh"]
            },
            {
                name: "Nước mía",
                category: "drink",
                calories: 180,
                protein: 0,
                carbs: 45,
                fat: 0,
                portion: "1 ly (250ml)",
                description: "Nước mía vắt",
                ingredients: ["Mía tươi"],
                recipe: ["Gọt vỏ mía", "Ép lấy nước", "Lọc bỏ xác", "Thêm đá"]
            },
        ];

        // Insert all foods
        for (const food of foods) {
            await ctx.db.insert("foodDatabase", food);
        }

        return { success: true, count: foods.length };
    },
});
