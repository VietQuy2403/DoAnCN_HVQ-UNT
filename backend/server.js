const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createMealPlanPrompt } = require('./mealPlanPrompt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server đang chạy' });
});

// API tạo kế hoạch ăn uống
app.post('/api/generate-meal-plan', async (req, res) => {
    try {
        const { goal, budget, userNotes, days } = req.body;

        // Validate input
        if (!goal) {
            return res.status(400).json({
                error: 'Thiếu thông tin bắt buộc (goal)'
            });
        }

        // Validate budget
        const validBudgets = ['low', 'medium', 'high'];
        const selectedBudget = budget || 'medium';
        if (!validBudgets.includes(selectedBudget)) {
            return res.status(400).json({
                error: 'Budget phải là: low, medium, hoặc high'
            });
        }

        console.log('📝 Đang tạo kế hoạch ăn uống...', { goal, budget: selectedBudget, userNotes: userNotes?.substring(0, 50) });

        // Tạo prompt
        const prompt = createMealPlanPrompt({
            goal,
            budget: selectedBudget,
            userNotes: userNotes || '',
            days: days || 7
        });

        // Gọi Gemini API
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('🤖 Gemini response length:', text.length);

        // Xử lý response - loại bỏ markdown nếu có
        text = text.trim();

        // Loại bỏ ```json và ``` nếu có
        if (text.startsWith('```json')) {
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse JSON
        let mealPlan;
        try {
            mealPlan = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ Lỗi parse JSON:', parseError);
            console.error('Raw text:', text.substring(0, 500));

            return res.status(500).json({
                error: 'AI trả về dữ liệu không đúng định dạng',
                details: parseError.message,
                rawText: text.substring(0, 200)
            });
        }

        // Validate structure
        if (!mealPlan.days || !Array.isArray(mealPlan.days)) {
            return res.status(500).json({
                error: 'Cấu trúc kế hoạch không hợp lệ'
            });
        }

        console.log('✅ Tạo kế hoạch thành công!');

        res.json({
            success: true,
            mealPlan,
            metadata: {
                goal,
                budget: selectedBudget,
                userNotes,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Lỗi server:', error);
        res.status(500).json({
            error: 'Lỗi khi tạo kế hoạch ăn uống',
            details: error.message
        });
    }
});

// API Chat với AI
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Thiếu tin nhắn' });
        }

        console.log('💬 Chat request:', message.substring(0, 50));

        // Tạo prompt
        const prompt = `Bạn là chuyên gia dinh dưỡng AI của ứng dụng "Dinh Dưỡng Thông Minh".

THÔNG TIN NGƯỜI DÙNG:
${userContext?.weight ? `- Cân nặng: ${userContext.weight} kg` : ''}
${userContext?.height ? `- Chiều cao: ${userContext.height} cm` : ''}
${userContext?.goal ? `- Mục tiêu: ${userContext.goal === 'weight_loss' ? 'Giảm cân' : userContext.goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì'}` : ''}
${userContext?.tdee ? `- TDEE: ${userContext.tdee} kcal/ngày` : ''}

CÂU HỎI: ${message}

Hãy trả lời ngắn gọn (2-3 đoạn), thân thiện, bằng tiếng Việt. Ưu tiên món ăn Việt Nam.`;

        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 500,
            }
        });

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();

        console.log('✅ Chat response generated');

        res.json({ success: true, response: text });

    } catch (error) {
        console.error('❌ Lỗi chat:', error);
        res.status(500).json({ error: 'Lỗi khi xử lý tin nhắn' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✓ Đã cấu hình' : '✗ Chưa cấu hình'}`);
});
