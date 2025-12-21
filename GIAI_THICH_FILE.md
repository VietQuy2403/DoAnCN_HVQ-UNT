# GIẢI THÍCH CHI TIẾT TỪNG FILE

## 📁 BACKEND (backend/)

### `server.js` - API Server
**Ngôn ngữ**: JavaScript (Node.js + Express)

**Mục đích**: Cung cấp API endpoint để gọi Google Gemini AI tạo kế hoạch ăn uống

**Code chính**:
```javascript
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint tạo kế hoạch
app.post('/api/generate-meal-plan', async (req, res) => {
  const { userInfo, days, goal, preferences } = req.body;
  
  // Tạo prompt cho AI
  const prompt = `Tạo kế hoạch ăn ${days} ngày...`;
  
  // Gọi Gemini AI
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  
  // Parse JSON và trả về
  const plan = JSON.parse(result.response.text());
  res.json({ success: true, plan });
});

app.listen(3000);
```

**Biến môi trường**: `GEMINI_API_KEY` trong file `.env`

---

## 📁 CONVEX (convex/)

### `schema.ts` - Database Schema
**Ngôn ngữ**: TypeScript

**Mục đích**: Định nghĩa cấu trúc 6 bảng database

**Tables**:
1. `users` - Tài khoản người dùng
2. `userProfiles` - Thông tin cá nhân (tuổi, cân nặng, mục tiêu...)
3. `mealPlans` - Kế hoạch ăn uống
4. `dailyTracking` - Theo dõi hàng ngày
5. `weightTracking` - Lịch sử cân nặng
6. `foodDatabase` - Cơ sở dữ liệu món ăn

---

### `auth.ts` - Authentication
**Mutations**:
- `signUp(email, passwordHash, name)` - Đăng ký tài khoản mới

**Queries**:
- `signIn(email, passwordHash)` - Đăng nhập, trả về user data

---

### `userProfiles.ts` - User Profiles
**Mutations**:
- `upsertProfile(userId, name, age, gender, weight, height, targetWeight, activityLevel, goal)` - Tạo/cập nhật hồ sơ

**Queries**:
- `getProfile(userId)` - Lấy thông tin hồ sơ

---

### `mealPlans.ts` - Meal Plans
**Mutations**:
- `createMealPlan(userId, title, goal, targetCalories, plan)` - Lưu kế hoạch mới

**Queries**:
- `getMealPlans(userId)` - Lấy tất cả kế hoạch
- `getActiveMealPlan(userId)` - Lấy kế hoạch đang sử dụng

---

### `dailyTracking.ts` - Daily Tracking
**Mutations**:
- `initializeTodayTracking(userId, mealPlanId)` - Khởi tạo tracking cho ngày mới
- `toggleMealConsumed(trackingId, mealIndex)` - Đánh dấu bữa ăn đã/chưa ăn

**Queries**:
- `getTodayTracking(userId, date)` - Lấy tracking hôm nay
- `getTrackingHistory(userId)` - Lấy 7 ngày gần nhất (cho biểu đồ)

---

### `weightTracking.ts` - Weight Tracking
**Mutations**:
- `addWeightEntry(userId, weight, note)` - Thêm bản ghi cân nặng

**Queries**:
- `getWeightHistory(userId)` - Lấy lịch sử cân nặng

---

### `foodDatabase.ts` - Food Database
**Mutations**:
- `seedFoodDatabase()` - Tạo dữ liệu mẫu món ăn Việt Nam

**Queries**:
- `getAllFoods()` - Lấy tất cả món ăn
- `searchFoods(query)` - Tìm kiếm món ăn

---

## 📁 FRONTEND (src/)

### 📂 src/screens/

#### `HomeScreen.js`
**Chức năng chính**:
- Hiển thị Quick Stats (Calories, Cân nặng, Mục tiêu)
- Vòng tròn tiến độ (tính % hoàn thành mục tiêu)
- Danh sách bữa ăn hôm nay với checkbox
- Nút "Tạo kế hoạch mới"

**Hooks sử dụng**:
```javascript
const profile = useQuery(api.userProfiles.getProfile, { userId });
const activePlan = useQuery(api.mealPlans.getActiveMealPlan, { userId });
const todayTracking = useQuery(api.dailyTracking.getTodayTracking, { userId, date });
const toggleMeal = useMutation(api.dailyTracking.toggleMealConsumed);
```

---

#### `ProfileScreen.js`
**Chức năng chính**:
- Form nhập thông tin (tên, tuổi, giới tính, cân nặng, chiều cao)
- Chọn mức độ hoạt động
- Chọn mục tiêu (giảm cân/tăng cơ/duy trì)
- Tính và hiển thị TDEE
- Nút cài đặt (⚙️) → AccountSettingsScreen

**Công thức BMR**:
```javascript
const calculateTDEE = () => {
  // Mifflin-St Jeor
  let bmr = gender === 'male' 
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  
  return Math.round(bmr * activityMultiplier);
};
```

---

#### `MealPlanGeneratorScreen.js`
**Chức năng chính**:
- Form nhập: số ngày (3-14), mục tiêu, sở thích
- Gọi API backend → Gemini AI
- Hiển thị kế hoạch từ AI
- Lưu kế hoạch vào Convex

**API Call**:
```javascript
const response = await fetch('http://localhost:3000/api/generate-meal-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userInfo, days, goal, preferences })
});
const { plan } = await response.json();
```

---

#### `ProgressTrackingScreen.js`
**Chức năng chính**:
- Vòng tròn tiến độ mục tiêu
- Line chart cân nặng (7 ngày)
- Line chart calories (7 ngày)
- Pie chart phân bổ macro (Protein/Carbs/Fat)

**Thư viện**: `react-native-chart-kit`, `react-native-svg`

---

#### `WeightLogScreen.js`
**Chức năng chính**:
- Form nhập cân nặng + ghi chú
- Lưu vào `weightTracking` table

---

#### `FoodDatabaseScreen.js`
**Chức năng chính**:
- Tìm kiếm món ăn (có lịch sử tìm kiếm)
- Lọc theo category (món chính, món phụ, snack...)
- Modal hiển thị chi tiết món ăn
- Lưu lịch sử vào AsyncStorage

**AsyncStorage**:
```javascript
const SEARCH_HISTORY_KEY = '@food_search_history';
const MAX_HISTORY_ITEMS = 5;
```

---

#### `AccountSettingsScreen.js`
**Chức năng chính**:
- Sửa tên hiển thị
- Đổi mật khẩu
- Đổi email
- Đăng xuất (có xác nhận)
- Xóa tài khoản (có cảnh báo)

**UI**: LinearGradient cho nút đăng xuất, expandable cards

---

#### `CalendarScreen.js`
**Chức năng**: Hiển thị lịch ăn theo tháng

#### `SavedMealPlansScreen.js`
**Chức năng**: Danh sách kế hoạch đã lưu

#### `MealPlanDetailScreen.js`
**Chức năng**: Chi tiết kế hoạch ăn

#### `LoginScreen.js`
**Chức năng**: Form đăng nhập

#### `SplashScreen.js`
**Chức năng**: Màn hình chào

#### `OnboardingScreen.js`
**Chức năng**: Giới thiệu app

#### `UserSetupScreen.js`
**Chức năng**: Setup ban đầu

---

### 📂 src/contexts/

#### `AuthContext.js`
**Mục đích**: Quản lý authentication state toàn app

**Provides**:
```javascript
{
  user: { userId, email, name },
  signIn: (email, password) => {...},
  signUp: (email, password, name) => {...},
  signOut: () => {...},
  loading: boolean
}
```

**Storage**: Lưu session vào AsyncStorage

---

### 📂 src/navigation/

#### `AppNavigator.js`
**Mục đích**: Cấu hình navigation cho toàn app

**Navigators**:
1. **Stack Navigator**: Splash → Onboarding → Login → Main
2. **Tab Navigator**: Home, Calendar, Progress, FoodDatabase, Profile

**Screens**:
- Modal screens: MealPlanGenerator, SavedMealPlans, MealPlanDetail, WeightLog, AccountSettings

---

### 📂 src/constants/

#### `index.js`
**Mục đích**: Centralized constants

**Exports**:
```javascript
export const COLORS = {
  primary: '#00796B',
  secondary: '#004D40',
  accent: '#26A69A',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336'
};

export const SIZES = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 16,
  body: 14,
  small: 12,
  padding: 16,
  margin: 16,
  borderRadius: 8
};

export const ACTIVITY_LEVELS = {
  sedentary: { value: 'sedentary', label: 'Ít vận động', ... },
  light: { value: 'light', label: 'Vận động nhẹ', ... },
  // ...
};
```

---

### 📂 src/services/

#### `auth.js`
**Mục đích**: Authentication utilities

**Functions**:
```javascript
// Hash password bằng SHA-256
export const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Lưu session
export const saveSession = async (userId) => {
  await AsyncStorage.setItem('@user_session', userId);
};

// Lấy session
export const getSession = async () => {
  return await AsyncStorage.getItem('@user_session');
};

// Xóa session
export const clearSession = async () => {
  await AsyncStorage.removeItem('@user_session');
};
```

---

### 📂 src/components/

#### `ProgressCircle.js`
**Mục đích**: Component vẽ vòng tròn tiến độ

**Props**:
```javascript
{
  percentage: number,  // 0-100
  size: number,        // Kích thước
  color: string        // Màu sắc
}
```

**Sử dụng**: SVG để vẽ vòng tròn với animation

---

## 🔄 LUỒNG DỮ LIỆU TỔNG QUAN

```
User → React Native UI
  ↓
useState/useEffect
  ↓
Convex useQuery/useMutation
  ↓
Convex Backend (TypeScript)
  ↓
Convex Database
  ↓
Real-time Sync
  ↓
UI Update
```

**Đặc biệt**: Gemini AI
```
MealPlanGeneratorScreen
  ↓
fetch('localhost:3000/api/generate-meal-plan')
  ↓
backend/server.js
  ↓
Google Gemini AI
  ↓
JSON Response
  ↓
Parse & Display
  ↓
Save to Convex
```

---

**File này giải thích chi tiết code và chức năng của từng file trong dự án.**
