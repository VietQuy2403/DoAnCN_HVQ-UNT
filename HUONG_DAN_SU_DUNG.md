# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DINH DƯỠNG THÔNG MINH

## 📱 GIỚI THIỆU

Ứng dụng Dinh Dưỡng Thông Minh là một ứng dụng mobile giúp bạn quản lý chế độ ăn uống, theo dõi tiến độ và đạt được mục tiêu sức khỏe của mình.

---

## 🚀 CÀI ĐẶT VÀ CHẠY DỰ ÁN

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- npm hoặc yarn
- Expo CLI
- Điện thoại có cài Expo Go (iOS/Android) hoặc emulator

### Bước 1: Cài đặt dependencies
```bash
# Cài đặt dependencies cho frontend
npm install

# Cài đặt dependencies cho backend
cd backend
npm install
cd ..
```

### Bước 2: Cấu hình Convex
```bash
# Đăng nhập Convex (lần đầu)
npx convex login

# Khởi tạo Convex project
npx convex dev
```

### Bước 3: Chạy ứng dụng
Mở 3 terminal riêng biệt:

**Terminal 1 - Backend API:**
```bash
cd backend
node server.js
```

**Terminal 2 - Convex:**
```bash
npx convex dev
```

**Terminal 3 - Expo:**
```bash
npx expo start --clear
```

### Bước 4: Mở ứng dụng
- Quét QR code bằng Expo Go (điện thoại)
- Hoặc nhấn `a` (Android) / `i` (iOS) để mở emulator

---

## 📖 HƯỚNG DẪN SỬ DỤNG CHO NGƯỜI DÙNG

### 1️⃣ ĐĂNG KY & ĐĂNG NHẬP

#### Đăng ký tài khoản mới
1. Mở ứng dụng lần đầu
2. Nhấn **"Đăng ký"**
3. Nhập:
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Tên của bạn
4. Nhấn **"Đăng ký"**

#### Đăng nhập
1. Nhập email và mật khẩu
2. Nhấn **"Đăng nhập"**

---

### 2️⃣ THIẾT LẬP HỒ SƠ (ProfileScreen)

Sau khi đăng nhập, bạn cần thiết lập hồ sơ cá nhân:

#### Thông tin cá nhân
- **Tên**: Tên hiển thị của bạn
- **Tuổi**: Tuổi của bạn (dùng để tính BMR)
- **Giới tính**: Nam / Nữ / Khác

#### Chỉ số cơ thể
- **Cân nặng hiện tại** (kg): VD: 70
- **Chiều cao** (cm): VD: 170
- **Cân nặng mục tiêu** (kg): VD: 65

#### Mức độ hoạt động
Chọn mức độ phù hợp với bạn:
- **Ít vận động**: Ngồi nhiều, ít di chuyển
- **Vận động nhẹ**: Đi bộ, hoạt động nhẹ 1-3 ngày/tuần
- **Vận động vừa**: Tập luyện 3-5 ngày/tuần
- **Vận động nhiều**: Tập luyện 6-7 ngày/tuần
- **Rất năng động**: Vận động viên, tập 2 lần/ngày

#### Mục tiêu
- 🔥 **Giảm cân**: Giảm mỡ và cân nặng
- 💪 **Tăng cơ**: Tăng khối lượng cơ bắp
- ⚖️ **Duy trì**: Duy trì cân nặng hiện tại

#### Lưu hồ sơ
- Nhấn **"💾 Lưu hồ sơ"** ở cuối trang
- Hệ thống sẽ tự động tính **TDEE** (nhu cầu calories hàng ngày)

---

### 3️⃣ TẠO KẾ HOẠCH ĂN UỐNG (MealPlanGenerator)

#### Cách tạo kế hoạch mới
1. Từ **HomeScreen**, nhấn **"Tạo kế hoạch mới"**
2. Chọn **số ngày** (3-14 ngày)
3. Chọn **mục tiêu**:
   - Giảm cân
   - Tăng cơ
   - Duy trì cân nặng
4. (Tùy chọn) Nhập **sở thích ăn uống**
5. Nhấn **"Tạo kế hoạch"**
6. Đợi AI tạo kế hoạch (10-30 giây)
7. Xem kế hoạch và nhấn **"Lưu kế hoạch"**

#### Kế hoạch bao gồm
- Bữa sáng, trưa, tối, snack
- Thông tin dinh dưỡng: Calories, Protein, Carbs, Fat
- Món ăn Việt Nam
- Phù hợp với mục tiêu calories của bạn

---

### 4️⃣ THEO DÕI HÀNG NGÀY (HomeScreen)

#### Quick Stats
Xem nhanh:
- **Calories hôm nay**: Tổng calories đã tiêu thụ
- **Cân nặng**: Cân nặng hiện tại
- **Mục tiêu**: Cân nặng mục tiêu

#### Tiến độ mục tiêu
- Vòng tròn hiển thị % hoàn thành
- Màu sắc:
  - 🟢 Xanh lá (≥75%): Gần đạt mục tiêu
  - 🔵 Xanh dương (≥50%): Đang tiến bộ tốt
  - 🟠 Cam (<50%): Cần cố gắng thêm
- Hiển thị: Cân nặng hiện tại, mục tiêu, còn lại

#### Bữa ăn hôm nay
- Danh sách bữa ăn từ kế hoạch
- **Check ✓** khi đã ăn → Calories tự động cộng
- Xem calories từng bữa ăn

---

### 5️⃣ XEM TIẾN ĐỘ (ProgressTrackingScreen)

#### Biểu đồ Tiến độ Mục tiêu
- Vòng tròn % hoàn thành
- Tính toán dựa trên mục tiêu của bạn

#### Biểu đồ Cân nặng
- Line chart theo tuần
- Hiển thị xu hướng tăng/giảm
- Dữ liệu từ lịch sử nhập cân nặng

#### Biểu đồ Calories
- Line chart theo 7 ngày gần nhất
- **Dữ liệu thật** từ những bữa ăn bạn đã check
- Hiển thị trung bình calories

#### Phân bổ Dinh dưỡng
- Pie chart hiển thị tỷ lệ:
  - Protein (màu xanh)
  - Carbs (màu cam)
  - Fat (màu đỏ)
- **Dữ liệu thật** từ bữa ăn đã tiêu thụ

---

### 6️⃣ NHẬP CÂN NẶNG (WeightLogScreen)

#### Cách nhập cân nặng
1. Từ **ProgressTrackingScreen**, nhấn **"Nhập cân nặng"**
2. Nhập cân nặng (kg)
3. (Tùy chọn) Thêm ghi chú
4. Nhấn **"Lưu"**

#### Lợi ích
- Theo dõi xu hướng cân nặng
- Dữ liệu cho biểu đồ tiến độ
- Tính toán % hoàn thành mục tiêu chính xác

---

### 7️⃣ TRA CỨU MÓN ĂN (FoodDatabaseScreen)

#### Tìm kiếm món ăn
1. Gõ tên món ăn vào ô tìm kiếm
2. Kết quả tự động lọc
3. **Lịch sử tìm kiếm**:
   - Tap vào ô tìm kiếm → Xem lịch sử
   - Chọn từ lịch sử để tìm nhanh
   - Nhấn "Xóa tất cả" để xóa lịch sử

#### Lọc theo danh mục
- Tất cả
- Món chính (🍜)
- Món phụ (🥗)
- Snack (🍪)
- Trái cây (🍎)
- Đồ uống (🥤)

#### Xem chi tiết món ăn
- Tap vào món ăn
- Xem:
  - Thông tin dinh dưỡng (Calories, Protein, Carbs, Fat)
  - Nguyên liệu
  - Cách nấu

---

### 8️⃣ CÀI ĐẶT TÀI KHOẢN (AccountSettingsScreen)

#### Truy cập
- Từ **ProfileScreen**, nhấn nút **⚙️** góc trên phải

#### Chức năng

**Thông tin tài khoản:**
- ✏️ **Sửa tên hiển thị**
  - Tap để mở
  - Nhập tên mới
  - Nhấn "Lưu thay đổi"

- 🔒 **Đổi mật khẩu**
  - Nhập mật khẩu hiện tại
  - Nhập mật khẩu mới (≥6 ký tự)
  - Xác nhận mật khẩu mới
  - Nhấn "Đổi mật khẩu"

- 📧 **Đổi email**
  - Nhập email mới
  - Nhập mật khẩu xác nhận
  - Nhấn "Đổi email"

**Vùng nguy hiểm:**
- 🚪 **Đăng xuất**: Thoát khỏi tài khoản
- 🗑️ **Xóa tài khoản**: Xóa vĩnh viễn tất cả dữ liệu

---

## 🎯 LUỒNG SỬ DỤNG HÀNG NGÀY

### Buổi sáng
1. Mở app → Xem bữa sáng hôm nay
2. Ăn theo kế hoạch
3. Check ✓ bữa sáng

### Buổi trưa
1. Check ✓ bữa trưa sau khi ăn
2. Xem tổng calories đã tiêu thụ

### Buổi tối
1. Check ✓ bữa tối
2. Xem tiến độ mục tiêu
3. (Tùy chọn) Nhập cân nặng

### Cuối tuần
1. Xem biểu đồ tiến độ
2. Đánh giá kết quả
3. Tạo kế hoạch mới cho tuần sau (nếu cần)

---

## 💡 MẸO SỬ DỤNG

### Để đạt kết quả tốt nhất
✅ **Check bữa ăn đúng giờ** - Giúp dữ liệu chính xác  
✅ **Nhập cân nặng đều đặn** - Ít nhất 1 lần/tuần  
✅ **Tuân thủ kế hoạch** - Ăn đúng calories khuyến nghị  
✅ **Cập nhật hồ sơ** - Khi cân nặng thay đổi nhiều  

### Tối ưu hóa kế hoạch
- Tạo kế hoạch 7 ngày để dễ theo dõi
- Ghi chú sở thích để AI tạo kế hoạch phù hợp hơn
- Thay đổi mục tiêu khi cần thiết

### Sử dụng lịch sử tìm kiếm
- Tìm nhanh món ăn yêu thích
- Xem thông tin dinh dưỡng trước khi ăn
- Lên kế hoạch bữa ăn riêng

---

## ❓ GIẢI ĐÁP THẮC MẮC

### Tại sao TDEE của tôi cao/thấp?
TDEE được tính dựa trên:
- BMR (Basal Metabolic Rate)
- Mức độ hoạt động
- Tuổi, giới tính, cân nặng, chiều cao

### Làm sao để thay đổi mục tiêu?
1. Vào **ProfileScreen**
2. Chọn mục tiêu mới (Giảm cân/Tăng cơ/Duy trì)
3. Nhấn "Lưu hồ sơ"
4. Tạo kế hoạch mới

### Tôi quên check bữa ăn, làm sao?
- Không thể check bữa ăn ngày hôm trước
- Hãy check đúng giờ từ hôm nay

### Biểu đồ không hiển thị dữ liệu?
- Cần ít nhất 2-3 ngày dữ liệu
- Đảm bảo đã check bữa ăn
- Đảm bảo đã nhập cân nặng

---

## 🔧 XỬ LÝ LỖI

### App không khởi động
```bash
# Xóa cache và chạy lại
npx expo start --clear
```

### Lỗi kết nối Convex
```bash
# Chạy lại Convex
npx convex dev
```

### Lỗi Backend API
```bash
# Kiểm tra backend đang chạy
cd backend
node server.js
```

### Reset app hoàn toàn
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. Kiểm tra phần "Xử lý lỗi" ở trên
2. Reload app (shake điện thoại → Reload)
3. Xem console log để biết lỗi cụ thể

---

**Chúc bạn sử dụng app hiệu quả và đạt được mục tiêu sức khỏe! 💪🥗**
