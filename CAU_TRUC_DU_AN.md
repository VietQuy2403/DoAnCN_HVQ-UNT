# CẤU TRÚC DỰ ÁN & GIẢI THÍCH CÁC FILE

## 📁 TỔNG QUAN CẤU TRÚC

```
DACN2Ban2/
├── src/                    # Mã nguồn frontend (React Native)
├── convex/                 # Backend & Database (Convex)
├── backend/                # API Server (Node.js/Express)
├── assets/                 # Hình ảnh, fonts, resources
├── node_modules/           # Dependencies
├── .expo/                  # Expo cache
└── Config files            # package.json, app.json, etc.
```

---

## 🎨 FRONTEND (src/)

### 📂 src/screens/ - Các màn hình

#### `HomeScreen.js` - Màn hình chính
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Hiển thị Quick Stats (Calories, Cân nặng, Mục tiêu)
- Vòng tròn tiến độ mục tiêu với tính toán thông minh
- Danh sách bữa ăn hôm nay với checkbox
- Nút tạo kế hoạch mới

**Công nghệ**:
- React Hooks (useState, useEffect)
- Convex queries (useQuery)
- Convex mutations (useMutation)
- React Navigation

**Dữ liệu sử dụng**:
- `userProfiles` - Thông tin người dùng
- `mealPlans` - Kế hoạch ăn uống
- `dailyTracking` - Theo dõi hàng ngày

---

#### `ProfileScreen.js` - Quản lý hồ sơ
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Form nhập thông tin cá nhân
- Tính toán BMR (Basal Metabolic Rate)
- Tính toán TDEE (Total Daily Energy Expenditure)
- Nút cài đặt tài khoản (⚙️)

**Công thức tính**:
```javascript
// BMR (Mifflin-St Jeor)
Nam: BMR = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi + 5
Nữ: BMR = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi - 161

// TDEE
TDEE = BMR × Activity Multiplier
```

**Activity Multipliers**:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

---

#### `MealPlanGeneratorScreen.js` - Tạo kế hoạch AI
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Form nhập số ngày, mục tiêu, sở thích
- Gọi API Backend để tạo kế hoạch
- Hiển thị kế hoạch từ AI
- Lưu kế hoạch vào Convex

**Luồng hoạt động**:
```
1. User nhập thông tin
2. Gửi request đến Backend API (localhost:3000)
3. Backend gọi Google Gemini AI
4. AI trả về JSON kế hoạch
5. Parse JSON và hiển thị
6. User xác nhận → Lưu vào Convex
```

**Format JSON từ AI**:
```json
{
  "title": "Kế hoạch 7 ngày",
  "targetCalories": 1800,
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "type": "Bữa sáng",
          "foods": [...],
          "totalCalories": 450
        }
      ]
    }
  ]
}
```

---

#### `ProgressTrackingScreen.js` - Theo dõi tiến độ
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Biểu đồ vòng tròn tiến độ mục tiêu
- Line chart cân nặng theo thời gian
- Line chart calories tiêu thụ (7 ngày)
- Pie chart phân bổ dinh dưỡng

**Thư viện**:
- `react-native-chart-kit` - Vẽ biểu đồ
- `react-native-svg` - Render SVG

**Tính toán**:
```javascript
// Calories từ macros
Protein: 4 cal/gram
Carbs: 4 cal/gram
Fat: 9 cal/gram

// % Macro
Protein % = (protein_grams × 4 / total_calories) × 100
```

---

#### `WeightLogScreen.js` - Nhập cân nặng
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Form nhập cân nặng và ghi chú
- Lưu vào `weightTracking` table
- Hiển thị lịch sử cân nặng

**Dữ liệu lưu**:
```javascript
{
  userId: "user_id",
  weight: 70.5,
  date: timestamp,
  note: "Sau khi tập gym"
}
```

---

#### `FoodDatabaseScreen.js` - Tra cứu món ăn
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Tìm kiếm món ăn (với lịch sử)
- Lọc theo category
- Hiển thị chi tiết món ăn (modal)
- Lưu lịch sử tìm kiếm (AsyncStorage)

**AsyncStorage**:
```javascript
Key: '@food_search_history'
Value: ["phở", "cơm", "bún", ...]
Max: 5 items
```

**Categories**:
- all, main, side, snack, fruit, drink

---

#### `AccountSettingsScreen.js` - Cài đặt tài khoản
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Sửa tên hiển thị
- Đổi mật khẩu
- Đổi email
- Đăng xuất
- Xóa tài khoản

**UI Components**:
- LinearGradient cho nút đăng xuất
- Expandable cards
- Validation forms

---

#### `CalendarScreen.js` - Lịch ăn
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Hiển thị lịch theo tháng
- Xem kế hoạch theo ngày
- Đánh dấu ngày đã hoàn thành

---

#### `SavedMealPlansScreen.js` - Kế hoạch đã lưu
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Danh sách tất cả kế hoạch
- Xem chi tiết kế hoạch
- Áp dụng kế hoạch cũ

---

#### `MealPlanDetailScreen.js` - Chi tiết kế hoạch
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Hiển thị chi tiết từng ngày
- Xem thông tin dinh dưỡng
- Áp dụng kế hoạch

---

#### `LoginScreen.js` - Đăng nhập
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Form đăng nhập
- Validation email/password
- Gọi Convex auth

---

#### `SplashScreen.js` - Màn hình chào
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Logo và animation
- Chuyển sang Onboarding hoặc Login

---

#### `OnboardingScreen.js` - Giới thiệu
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Slides giới thiệu app
- Swiper navigation

---

#### `UserSetupScreen.js` - Thiết lập ban đầu
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Wizard setup cho user mới
- Thu thập thông tin cơ bản

---

### 📂 src/components/ - Components tái sử dụng

#### `ProgressCircle.js`
**Ngôn ngữ**: JavaScript (React Native)

**Chức năng**:
- Vẽ vòng tròn tiến độ
- Nhận props: percentage, size, color
- Sử dụng SVG

---

### 📂 src/contexts/ - React Context

#### `AuthContext.js`
**Ngôn ngữ**: JavaScript (React)

**Chức năng**:
- Quản lý authentication state
- Cung cấp: user, signIn, signUp, signOut
- Lưu session vào AsyncStorage

**Methods**:
```javascript
signUp(email, password, name)
signIn(email, password)
signOut()
checkSession()
```

---

### 📂 src/navigation/

#### `AppNavigator.js`
**Ngôn ngữ**: JavaScript (React Navigation)

**Chức năng**:
- Stack Navigator cho screens
- Bottom Tab Navigator cho main screens
- Routing logic

**Navigators**:
- Stack: Splash → Onboarding → Login → Main
- Tabs: Home, Calendar, Progress, FoodDatabase, Profile

---

### 📂 src/constants/

#### `index.js`
**Ngôn ngữ**: JavaScript

**Chức năng**:
- Export COLORS, SIZES, ACTIVITY_LEVELS
- Centralized styling constants

**Constants**:
```javascript
COLORS: {
  primary, secondary, accent,
  background, white, text, ...
}

SIZES: {
  h1, h2, h3, h4, body, small,
  padding, margin, borderRadius
}

ACTIVITY_LEVELS: {
  sedentary, light, moderate, ...
}
```

---

### 📂 src/services/

#### `auth.js`
**Ngôn ngữ**: JavaScript

**Chức năng**:
- Hash password (SHA-256)
- Save/get/clear session (AsyncStorage)

**Functions**:
```javascript
hashPassword(password)
saveSession(userId)
getSession()
clearSession()
```

---

## 🗄️ BACKEND (convex/)

### Ngôn ngữ: TypeScript

### `schema.ts` - Database Schema
**Chức năng**: Định nghĩa cấu trúc database

**Tables**:

#### `users`
```typescript
{
  email: string,
  passwordHash: string,
  name: string,
  createdAt: number
}
```

#### `userProfiles`
```typescript
{
  userId: Id<"users">,
  name: string,
  age?: number,
  gender?: "male" | "female" | "other",
  weight?: number,  // kg
  height?: number,  // cm
  targetWeight?: number,
  activityLevel?: string,
  goal?: "weight_loss" | "muscle_gain" | "maintenance",
  createdAt: number,
  updatedAt: number
}
```

#### `mealPlans`
```typescript
{
  userId: Id<"users">,
  title: string,
  goal: string,
  targetCalories: number,
  plan: object,  // JSON kế hoạch
  createdAt: number
}
```

#### `dailyTracking`
```typescript
{
  userId: Id<"users">,
  date: string,  // YYYY-MM-DD
  mealsConsumed: array,
  totalCalories: number,
  waterIntake?: number
}
```

#### `weightTracking`
```typescript
{
  userId: Id<"users">,
  weight: number,
  date: number,
  note?: string
}
```

#### `foodDatabase`
```typescript
{
  name: string,
  category: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  portion: string,
  description?: string,
  ingredients?: array,
  recipe?: array
}
```

---

### `auth.ts` - Authentication
**Chức năng**: Đăng ký, đăng nhập

**Mutations**:
- `signUp(email, passwordHash, name)`
- Không có signIn mutation (dùng query)

**Queries**:
- `signIn(email, passwordHash)` - Trả về user data

---

### `userProfiles.ts` - User Profiles
**Chức năng**: CRUD user profiles

**Mutations**:
- `upsertProfile(...)` - Tạo/cập nhật profile

**Queries**:
- `getProfile(userId)` - Lấy profile

---

### `mealPlans.ts` - Meal Plans
**Chức năng**: Quản lý kế hoạch ăn

**Mutations**:
- `createMealPlan(userId, title, goal, targetCalories, plan)`

**Queries**:
- `getMealPlans(userId)` - Lấy tất cả kế hoạch
- `getActiveMealPlan(userId)` - Lấy kế hoạch đang dùng

---

### `dailyTracking.ts` - Daily Tracking
**Chức năng**: Theo dõi hàng ngày

**Mutations**:
- `initializeTodayTracking(userId, mealPlanId)` - Khởi tạo ngày mới
- `toggleMealConsumed(trackingId, mealIndex)` - Toggle checkbox

**Queries**:
- `getTodayTracking(userId, date)` - Lấy tracking hôm nay
- `getTrackingHistory(userId)` - Lấy 7 ngày gần nhất

---

### `weightTracking.ts` - Weight Tracking
**Chức năng**: Quản lý cân nặng

**Mutations**:
- `addWeightEntry(userId, weight, note)`

**Queries**:
- `getWeightHistory(userId)` - Lấy lịch sử

---

### `foodDatabase.ts` - Food Database
**Chức năng**: Cơ sở dữ liệu món ăn

**Mutations**:
- `seedFoodDatabase()` - Seed dữ liệu mẫu

**Queries**:
- `getAllFoods()` - Lấy tất cả món ăn
- `searchFoods(query)` - Tìm kiếm

---

## 🌐 API SERVER (backend/)

### `server.js`
**Ngôn ngữ**: JavaScript (Node.js + Express)

**Chức năng**:
- API endpoint cho Gemini AI
- CORS middleware
- JSON parsing

**Endpoint**:
```
POST /api/generate-meal-plan
Body: {
  userInfo: {...},
  days: 7,
  goal: "weight_loss",
  preferences: "..."
}
Response: {
  success: true,
  plan: {...}
}
```

**Dependencies**:
- `express` - Web framework
- `cors` - CORS middleware
- `@google/generative-ai` - Gemini AI SDK

**Gemini Prompt**:
```javascript
`Bạn là chuyên gia dinh dưỡng...
Tạo kế hoạch ${days} ngày...
Format JSON: {...}`
```

---

## 📦 CONFIG FILES

### `package.json`
**Ngôn ngữ**: JSON

**Chức năng**: Dependencies và scripts

**Main Dependencies**:
- `react-native` - Framework
- `expo` - Development platform
- `react-navigation` - Navigation
- `convex` - Backend
- `react-native-chart-kit` - Charts

---

### `app.json`
**Ngôn ngữ**: JSON

**Chức năng**: Expo configuration

**Config**:
- App name, slug, version
- Platforms (iOS, Android, Web)
- Icons, splash screen
- Permissions

---

### `babel.config.js`
**Ngôn ngữ**: JavaScript

**Chức năng**: Babel transpiler config

---

### `metro.config.js`
**Ngôn ngữ**: JavaScript

**Chức năng**: Metro bundler config

---

### `tsconfig.json`
**Ngôn ngữ**: JSON

**Chức năng**: TypeScript config cho Convex

---

## 🔄 LUỒNG DỮ LIỆU

```
User Input (React Native)
    ↓
React State (useState)
    ↓
Convex Mutation/Query
    ↓
Convex Backend (TypeScript)
    ↓
Database (Convex Tables)
    ↓
Real-time Sync
    ↓
React Component Update
```

---

## 🎯 TECH STACK SUMMARY

| Layer | Technology | Language |
|-------|-----------|----------|
| Frontend | React Native + Expo | JavaScript |
| Navigation | React Navigation | JavaScript |
| State | React Hooks | JavaScript |
| Backend | Convex | TypeScript |
| Database | Convex DB | - |
| API | Node.js + Express | JavaScript |
| AI | Google Gemini | - |
| Charts | react-native-chart-kit | JavaScript |
| Storage | AsyncStorage | - |

---

## 📊 DATA FLOW EXAMPLES

### Tạo kế hoạch ăn
```
1. User nhập form (MealPlanGeneratorScreen.js)
2. Call API: fetch('http://localhost:3000/api/generate-meal-plan')
3. Backend (server.js) gọi Gemini AI
4. AI trả về JSON
5. Frontend parse JSON
6. Call Convex mutation: createMealPlan()
7. Lưu vào mealPlans table
8. Navigate về HomeScreen
```

### Check bữa ăn
```
1. User tap checkbox (HomeScreen.js)
2. Call mutation: toggleMealConsumed(trackingId, mealIndex)
3. Convex update dailyTracking table
4. Real-time sync
5. UI update (calories tăng)
```

### Xem biểu đồ
```
1. User mở ProgressTrackingScreen
2. Query: getTrackingHistory(userId)
3. Query: getWeightHistory(userId)
4. Calculate data for charts
5. Render LineChart, PieChart
```

---

**File này giải thích chi tiết về cấu trúc và vai trò của từng file trong dự án.**
