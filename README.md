# 🎓 Hệ thống Quản trị & Kho dữ liệu Gia sư (TutorSystem)

Chào mừng các bạn đến với bản hoàn thiện chuyên nghiệp của Project BTL HQTCSDL. Đây là phiên bản đã được chuẩn hóa về kiến trúc công nghệ, bảo mật và thẩm mỹ.

## 🏗️ Kiến trúc Hệ thống
1. **Dữ liệu (Database)**: Microsoft SQL Server (SSMS).
2. **Backend**: Node.js + Express.js (Cổng 5000).
3. **Frontend**: React + Vite (Cổng 5173/5174).
4. **Làm sạch**: Python Pandas (ETL Process).

---

## 🚀 Hướng dẫn Chạy Project

### 1. Chuẩn bị Database (SSMS)
* Mở SSMS, tạo một database mới tên là **`TutorSystem`**.
* Chạy file SQL tại: `database/ver2/sql/01_create_tables.sql` để tạo cấu trúc bảng.
* (Tùy chọn) Chạy ETL bằng Python để nạp 58k dòng dữ liệu hoặc dùng dữ liệu mẫu.

### 2. Cấu hình & Chạy Backend (Dành cho Minh)
```bash
cd backend
npm install
npm start
```
* **Lưu ý**: Đảm bảo tìa khoản `sa` trong SQL Server đã được bật với mật khẩu `123456` (hoặc sửa đổi trong `server.js`).

### 3. Cấu hình & Chạy Frontend (Dành cho Tấn)
```bash
cd frontend
npm install
npm run dev
```
* Truy cập địa chỉ `http://localhost:5173` (hoặc 5174).
* **Tài khoản Đăng nhập**: `admin` / **Mật khẩu**: `123`.

---

## 🌟 Các tính năng chính
* **Dashboard Tổng quan**: Theo dõi các chỉ số quan trọng ngay trang chủ.
* **Quản trị Gia sư/Học sinh**: Danh sách đầy đủ với bộ lọc (Search/Filter) theo tên và khu vực.
* **Thống kê chuyên sâu**: 4 loại biểu đồ (Top Area, School, Subject, Rating) lấy dữ liệu thật trực tiếp bằng `GROUP BY` trong SQL.
* **Bảo mật (Auth Guard)**: Chỉ người dùng đã đăng nhập mới có thể truy cập kho dữ liệu.

---

## 👥 Đội ngũ Thực hiện
* **Bùi Văn Long**: Leader / Data Analyst
* **Đỗ Quốc Tấn**: Frontend Developer
* **Đào Bình Minh**: Backend Developer
* **Nguyễn Ngọc Phúc**: Data Designer & Analyst
* **Nguyễn Quang Trung**: Database Administrator (DBA)

---
*Phiên bản được đóng gói bởi Antigravity AI Assistant.*
