# 🎓 Hệ thống Quản trị, Phân tích & Ghép đôi Gia sư (Tutor Matching System)

Chào mừng các bạn đến với bản hoàn thiện chuyên nghiệp của Project Bài Tập Lớn môn Hệ Quản trị Cơ sở dữ liệu. Đây là phiên bản đã được chuẩn hóa về kiến trúc công nghệ, tối ưu hóa truy vấn SQL, bảo mật và trải nghiệm người dùng (UI/UX).

---

## 🏗️ Kiến trúc Hệ thống
Hệ thống được thiết kế theo mô hình 3 lớp (3-Tier Architecture):
1. **Dữ liệu (Database)**: Microsoft SQL Server (SSMS). Nơi chứa logic nghiệp vụ cốt lõi (Stored Procedures, Triggers, Views) để giảm tải cho Backend.
2. **Backend**: Node.js + Express.js. Xử lý API, điều hướng dữ liệu, chống SQL Injection bằng Parameterized Queries và phân trang bằng Window Functions.
3. **Frontend**: React + Vite + Chart.js. Hiển thị giao diện người dùng, cung cấp Dashboard thống kê trực quan.
4. **ETL (Trích xuất & Làm sạch)**: Python Pandas. Được sử dụng để chuẩn hóa hơn 58,000 dòng dữ liệu thô.

---

## 📁 Sơ đồ Thư mục & Chức năng

```text
btlhqtcsdl/
├── database/               # Thư mục chứa toàn bộ logic CSDL (SSMS)
│   ├── ver1/               # Cấu trúc CSDL phiên bản cũ (Lưu trữ)
│   └── ver2/               # Cấu trúc CSDL phiên bản mới nhất (Sử dụng chính)
│       └── sql/
│           ├── 01_create_tables.sql       # Script tạo Bảng, Data Types, Constraints và Indexes
│           ├── 02_dashboard_queries.sql   # Script nháp các câu truy vấn thống kê
│           └── 03_views_sp_triggers.sql   # Script tạo Views (hiển thị), Stored Procedures (xử lý ghép đôi), Triggers (Audit log)
│
├── backend/                # Server Node.js cung cấp RESTful API
│   ├── server.js           # File khởi chạy server, thiết lập Connection Pool tới SQL Server
│   └── package.json        # Danh sách thư viện Backend (mssql, express, cors...)
│
├── frontend/               # Giao diện người dùng Web (React)
│   ├── src/
│   │   ├── pages/          # Các trang giao diện chính (Dashboard, Auth, StatsTutor, StatsStudent, Matching)
│   │   ├── services/       # File gọi API (api.js) kết nối từ React xuống Backend
│   │   ├── context/        # Quản lý trạng thái đăng nhập (AuthContext)
│   │   └── index.css       # File CSS định dạng giao diện
│   └── package.json        # Danh sách thư viện Frontend (react, chart.js, lucide-react...)
│
├── bao_cao_phieu_cham.md   # File Word báo cáo nháp, chứa đánh giá thành viên và chữ ký
└── README.md               # Tài liệu hướng dẫn sử dụng và mô tả hệ thống (chính là file này)
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Khởi tạo Database (SSMS)
1. Mở SSMS, tạo một database mới tên là **`TutorSystem`**.
2. Chạy lần lượt các file SQL theo thứ tự:
   - `database/ver2/sql/01_create_tables.sql`
   - Nhập dữ liệu mẫu (hoặc Import file CSV)
   - `database/ver2/sql/03_views_sp_triggers.sql`

### Bước 2: Cấu hình & Chạy Backend
```bash
cd backend
npm install
npm start
```
> **Lưu ý**: Đảm bảo tài khoản SQL Server (`sa` / `123456`) trong `server.js` khớp với cấu hình máy tính của bạn. Server sẽ chạy ở cổng 5000.

### Bước 3: Cấu hình & Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
> Mở trình duyệt tại địa chỉ `http://localhost:5173`. 
> **Tài khoản Đăng nhập Quản trị**: `admin` / **Mật khẩu**: `123`

---

## 🧪 Quy trình Kiểm nghiệm Chức năng (Test Scenarios)

Dưới đây là các kịch bản (Scenarios) dùng để chạy demo hoặc kiểm thử bảo vệ trước hội đồng:

### Kịch bản 1: Kiểm thử Tính toàn vẹn Dữ liệu (Constraints & Datatypes)
- **Hành động**: Dùng lệnh `INSERT` thêm một học sinh có trạng thái lạ (Ví dụ: `trang_thai_nhu_cau = 'dang_ngu'`).
- **Kết quả mong đợi**: SQL Server báo lỗi do vi phạm `CHECK CONSTRAINT` (chỉ cho phép `dang_tim_gia_su`, `da_ghep`, `tam_dung`).
- **Ý nghĩa**: Chứng minh Database tự động chặn rác ở tầng lõi mà không cần Backend phải viết code kiểm tra.

### Kịch bản 2: Kiểm thử Cập nhật Thời gian thực (Real-time DB Sync)
- **Hành động**: Vào SSMS, dùng chức năng Design thêm một cột mới vào bảng `thong_tin_gia_su` (Ví dụ cột `so_thich`). Nhấn F5 lại sơ đồ Database Diagram.
- **Kết quả mong đợi**: Cột mới xuất hiện trên Diagram SSMS ngay lập tức. Trang Web F5 lại vẫn hoạt động bình thường, không bị sập.
- **Ý nghĩa**: Chứng minh tính độc lập (Loose coupling), Backend gọi đích danh các cột (`SELECT col1, col2`) chứ không dùng `SELECT *`, nên cấu trúc DB mở rộng thoải mái.

### Kịch bản 3: Kiểm thử Khóa tương tranh (Concurrency / Race Condition)
- **Hành động**: Giả lập 2 gia sư khác nhau cùng gọi API nhận 1 nhu cầu học của học sinh tại cùng 1 phần nghìn giây.
- **Kết quả mong đợi**: Stored Procedure `sp_ghep_doi` chạy. Lệnh `UPDATE` đầu tiên sẽ dùng khóa `U-Lock` chặn dòng dữ liệu lại. Lệnh thứ hai sẽ thất bại do kiểm tra `@@ROWCOUNT = 0` và tự động kích hoạt `ROLLBACK TRANSACTION`. Chỉ có duy nhất 1 gia sư nhận được lớp.

### Kịch bản 4: Kiểm thử Trigger Lưu vết (Audit Log)
- **Hành động**: Thay đổi trạng thái một nhu cầu học từ `dang_tim_gia_su` sang `da_ghep`.
- **Kết quả mong đợi**: Bảng `log_ghep_doi` tự động sinh ra một dòng dữ liệu ghi lại ID nhu cầu, trạng thái cũ, trạng thái mới và thời gian thay đổi nhờ vào Trigger `AFTER UPDATE`.
- **Ý nghĩa**: Giúp quản trị viên truy vết lịch sử kể cả khi ai đó vào thẳng SSMS sửa trộm dữ liệu.

---

## 🌟 Các tính năng chính của Ứng dụng
* **Dashboard Tổng quan**: Theo dõi các chỉ số KPI trực quan.
* **Quản trị Hồ sơ**: Phân trang siêu tốc bằng hàm cửa sổ `Window Function (COUNT(*) OVER)` giúp lấy dữ liệu và tổng số dòng chỉ trong 1 lần quét DB.
* **Thống kê chuyên sâu**: Biểu đồ phân tích khu vực, môn học, rating... lấy dữ liệu thật qua truy vấn có `GROUP BY`.
* **Thuật toán Matching**: Đánh giá trọng số tự động `sp_tim_gia_su_phu_hop` xử lý trực tiếp trên SQL Server.
* **Bảo mật**: Chống SQL Injection (Parameterized Query) và bảo mật Giao diện (Auth Guard).

---

## 👥 Đội ngũ Thực hiện
* **Bùi Văn Long**: Leader / Data Analyst
* **Đỗ Quốc Tấn**: Frontend Developer
* **Đào Bình Minh**: Backend Developer
* **Nguyễn Ngọc Phúc**: Data Designer & Analyst
* **Nguyễn Quang Trung**: Database Administrator (DBA)

---

## 📊 Trạng thái Triển khai Hiện tại

| Thành phần | Mô tả | Trạng thái |
|---|---|---|
| `database/ver1/` | Schema DW đầy đủ kèm dữ liệu mẫu | ✅ Hoàn chỉnh |
| `database/ver2/sql/01_create_tables.sql` | Schema + Constraints + Indexes | ✅ Hoàn chỉnh |
| `database/ver2/sql/02_dashboard_queries.sql` | Truy vấn dashboard 4 chiều | ✅ Hoàn chỉnh |
| `database/ver2/sql/03_views_sp_triggers.sql` | Views, Stored Procedures, Triggers | ⏳ Chưa có |
| `database/ver2/*.csv/.sql/.json/.txt` | Dữ liệu ETL đa nguồn (~58,000 bản ghi) | ✅ Hoàn chỉnh |
| `backend/server.js` | Node.js + Express kết nối SQL Server | ⏳ Chưa có |
| `frontend/src/App.jsx` | Router + Sidebar + Auth guard | ✅ Hoàn chỉnh |
| `frontend/src/pages/` | Home, Auth, TutorManage, StatsTutor... | ✅ Hoàn chỉnh |
| `frontend/src/services/api.js` | Gọi API backend + mock json-server | ✅ Hoàn chỉnh |
| `frontend/src/context/AuthContext.jsx` | Quản lý đăng nhập (localStorage) | ✅ Hoàn chỉnh |
| `frontend/db.json` | Dữ liệu mock cho 4 dashboard queries | ✅ Hoàn chỉnh |

---

## 🚀 Chạy nhanh trên Local (Chế độ Demo — không cần SQL Server)

Dùng `json-server` để giả lập API, frontend vẫn hiển thị đầy đủ giao diện.

### Terminal 1 — Khởi động Mock API
```bash
cd frontend
npm install            # Chỉ cần lần đầu
npm run server         # json-server chạy tại http://localhost:3001
```

### Terminal 2 — Khởi động Frontend
```bash
cd frontend
npm run dev            # Vite chạy tại http://localhost:5173
```

> Mở trình duyệt tại `http://localhost:5173`
> **Đăng nhập demo:** `admin` / `123`

> **Lưu ý:** Ở chế độ demo, trang Tổng quan và Statistics hiển thị dữ liệu từ `db.json` (đã tổng hợp sẵn từ kết quả truy vấn SQL). Các trang Quản lý Gia sư, Ghép đôi cần backend Node.js thật để hoạt động đầy đủ.

---
*Phiên bản được đóng gói bởi Antigravity AI Assistant.*
