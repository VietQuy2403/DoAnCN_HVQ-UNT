import { API_URL } from '../constants';

/**
 * Gọi API backend để tạo kế hoạch ăn uống
 */
export const generateMealPlan = async ({ goal, budget = 'medium', userNotes = '', days = 7 }) => {
    try {
        const response = await fetch(`${API_URL}/api/generate-meal-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                goal,
                budget,
                userNotes,
                days,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Lỗi khi tạo kế hoạch');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * Kiểm tra kết nối backend
 */
export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        return data.status === 'OK';
    } catch (error) {
        console.error('Backend không khả dụng:', error);
        return false;
    }
};
