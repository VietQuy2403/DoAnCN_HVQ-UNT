# 🥗 App Ăn Kiêng AI

Ứng dụng lập kế hoạch dinh dưỡng cá nhân hóa sử dụng AI (Google Gemini) và Convex.

## 🚀 Tính năng

- ✨ Tạo kế hoạch ăn uống 7 ngày với AI
- 🎯 Tùy chỉnh theo mục tiêu: Giảm cân, Tăng cơ, Duy trì
- 📊 Tính toán calories và dinh dưỡng chi tiết
- 🥬 Hỗ trợ các chế độ ăn đặc biệt (chay, keto, v.v.)
- 💾 Lưu và quản lý kế hoạch
- 👤 Hồ sơ cá nhân với tính BMR/TDEE
- 🔐 Xác thực người dùng an toàn với Convex Auth

## 📋 Yêu cầu

- Node.js 16+
- npm hoặc yarn
- Gemini API key (miễn phí tại https://makersuite.google.com/app/apikey)

## 🛠️ Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd DACN2Ban2
npm install
```

### 2. Khởi động Convex (đã chạy)

```bash
npx convex dev
```

Convex đã được deploy và đang chạy! ✅

### 3. Khởi động Backend Server (Gemini AI)

Mở terminal mới:

```bash
cd backend
node server.js
```

Server sẽ chạy tại: http://localhost:3001

### 4. Khởi động Expo App

Mở terminal thứ 3:

```bash
npm start
```

Sau đó chọn:
- `w` - Chạy trên web browser
- `a` - Chạy trên Android emulator
- `i` - Chạy trên iOS simulator (chỉ trên Mac)

## 📱 Sử dụng

### Đăng ký/Đăng nhập
1. Mở app
2. Nhập email và mật khẩu
3. Chọn "Đăng ký" nếu chưa có tài khoản

### Tạo kế hoạch ăn uống
1. Từ trang chủ, chọn "Tạo kế hoạch mới"
2. Chọn mục tiêu (Giảm cân/Tăng cơ/Duy trì)
3. Nhập số calories mục tiêu (1200-4000 kcal)
4. Chọn hạn chế ăn uống nếu có
5. Nhấn "Tạo kế hoạch với AI"
6. Đợi AI tạo kế hoạch (~10-30 giây)
7. Xem trước và nhấn "Lưu kế hoạch"

### Xem kế hoạch đã lưu
1. Từ trang chủ, chọn "Kế hoạch đã lưu"
2. Nhấn vào kế hoạch để xem chi tiết
3. Xem từng ngày, bữa ăn, và dinh dưỡng

### Cập nhật hồ sơ
1. Từ trang chủ, chọn "Hồ sơ của tôi"
2. Nhập thông tin: tuổi, giới tính, cân nặng, chiều cao
3. Chọn mức độ hoạt động
4. Xem nhu cầu calories ước tính (TDEE)
5. Nhấn "Lưu hồ sơ"

## 🏗️ Cấu trúc Project

```
DACN2Ban2/
├── backend/                 # Node.js server cho Gemini AI
│   ├── server.js           # Express server
│   ├── mealPlanPrompt.js   # Prompt template
│   └── .env                # API keys
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Authentication
│   ├── mealPlans.ts        # Meal plan functions
│   └── userProfiles.ts     # User profile functions
├── src/
│   ├── screens/            # Màn hình chính
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── MealPlanGeneratorScreen.js
│   │   ├── SavedMealPlansScreen.js
│   │   ├── MealPlanDetailScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/         # React Navigation
│   ├── components/         # Reusable components
│   ├── services/           # API services
│   └── constants/          # Colors, sizes, configs
└── App.js                  # Entry point
```

## 🔧 Cấu hình

### Backend API URL

Nếu test trên thiết bị thật, cập nhật `src/constants/index.js`:

```javascript
export const API_URL = 'http://192.168.1.XXX:3001'; // Thay bằng IP máy của bạn
```

### Gemini API Key

API key đã được cấu hình trong `backend/.env`:
```
GEMINI_API_KEY=AIzaSyCDo-YLOuMp2i5w10kzcvRKb1xucj0NXqE
```

## 🐛 Troubleshooting

### Backend không kết nối được
- Kiểm tra backend server đang chạy: `http://localhost:3001/health`
- Nếu test trên điện thoại, đảm bảo cùng mạng WiFi
- Cập nhật `API_URL` trong `src/constants/index.js`

### Convex lỗi
- Chạy lại: `npx convex dev`
- Kiểm tra `.env.local` có `EXPO_PUBLIC_CONVEX_URL`

### AI không tạo được kế hoạch
- Kiểm tra Gemini API key còn hạn
- Xem logs trong terminal backend
- Thử giảm số ngày hoặc calories

## 📝 Lưu ý

- Backend server cần chạy để tạo kế hoạch với AI
- Convex dev cần chạy để sync database
- Dữ liệu được lưu real-time với Convex
- Meal plans được tạo bằng tiếng Việt với món ăn Việt Nam

## 🎯 Roadmap

- [ ] Thêm tracking ăn uống hàng ngày
- [ ] Thống kê và biểu đồ tiến độ
- [ ] Chia sẻ kế hoạch
- [ ] Thông báo nhắc nhở
- [ ] Tích hợp barcode scanner

## 📄 License

MIT

## 👨‍💻 Tác giả

Được xây dựng với ❤️ sử dụng React Native, Expo, Convex, và Google Gemini AI
