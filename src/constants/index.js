// Backend API URL - sử dụng IP máy tính trong mạng local
export const API_URL = 'http://192.168.1.9:3001';

// Màu sắc chủ đạo
export const COLORS = {
  primary: '#002331',      // Đen than chủ đạo
  secondary: '#FF6B6B',    // Đỏ cam
  accent: '#4ECDC4',       // Xanh ngọc
  success: '#51CF66',      // Xanh lá
  background: '#F8F9FA',   // Xám nhạt
  white: '#FFFFFF',
  black: '#000000',
  text: '#2C3E50',         // Xám đậm cho text
  textLight: '#95A5A6',    // Xám nhạt cho text phụ
  border: '#E0E0E0',       // Viền
  error: '#E74C3C',        // Đỏ lỗi
  warning: '#F39C12',      // Vàng cảnh báo
  info: '#3498DB',         // Xanh dương thông tin

  // Gradient
  gradientStart: '#002331',
  gradientEnd: '#003d52',
};

// Kích thước
export const SIZES = {
  padding: 16,
  margin: 16,
  borderRadius: 12,
  iconSize: 24,

  // Font sizes
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,
};

// Mục tiêu ăn kiêng
export const GOALS = {
  weight_loss: {
    value: 'weight_loss',
    label: 'Giảm cân',
    icon: '📉',
    color: '#FF9800',
    description: 'Giảm cân an toàn và hiệu quả'
  },
  muscle_gain: {
    value: 'muscle_gain',
    label: 'Tăng cơ',
    icon: '💪',
    color: '#2196F3',
    description: 'Xây dựng cơ bắp và sức mạnh'
  },
  maintenance: {
    value: 'maintenance',
    label: 'Duy trì',
    icon: '⚖️',
    color: '#4CAF50',
    description: 'Duy trì cân nặng hiện tại'
  }
};

// Mức độ hoạt động
export const ACTIVITY_LEVELS = {
  sedentary: {
    value: 'sedentary',
    label: 'Ít vận động',
    multiplier: 1.2,
    description: 'Ngồi nhiều, ít hoạt động'
  },
  light: {
    value: 'light',
    label: 'Nhẹ nhàng',
    multiplier: 1.375,
    description: 'Vận động nhẹ 1-3 ngày/tuần'
  },
  moderate: {
    value: 'moderate',
    label: 'Trung bình',
    multiplier: 1.55,
    description: 'Vận động 3-5 ngày/tuần'
  },
  active: {
    value: 'active',
    label: 'Năng động',
    multiplier: 1.725,
    description: 'Vận động 6-7 ngày/tuần'
  },
  very_active: {
    value: 'very_active',
    label: 'Rất năng động',
    multiplier: 1.9,
    description: 'Vận động cường độ cao hàng ngày'
  }
};

// Hạn chế ăn uống
export const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Ăn chay', icon: '🥬' },
  { value: 'vegan', label: 'Thuần chay', icon: '🌱' },
  { value: 'gluten-free', label: 'Không gluten', icon: '🌾' },
  { value: 'dairy-free', label: 'Không sữa', icon: '🥛' },
  { value: 'low-carb', label: 'Ít tinh bột', icon: '🍞' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
];
