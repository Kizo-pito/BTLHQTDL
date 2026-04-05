-- =========================================================
-- DATA WAREHOUSE DON GIAN CHO WEB KET NOI GIA SU - HOC SINH
-- He quan tri tham chieu: SQL Server
--
-- Giai thich cach dat ten bang:
--   1. bang "danh_muc_..." = bang chua thong tin tham chieu de loc va thong ke
--   2. bang "thong_tin_..." = bang chua thong tin tong hop cua doi tuong
--   3. bang "du_lieu_..." = bang chua du lieu phan tich chinh
--
-- Muc tieu:
--   1. Lay du lieu tu Excel va SQL
--   2. Lam sach va dua ve kho du lieu chung
--   3. Tra loi duoc cac cau hoi:
--      - Khu vuc nao co nhieu gia su nhat
--      - Truong nao co nhieu gia su nhat
--      - Lop/mon/khu vuc nao co nhieu hoc sinh can day nhat
--      - Gia su nao co xep hang cao nhat
-- =========================================================

-- =========================================================
-- 0. XOA CAC BANG THUOC MO HINH NAY TRONG DATABASE TEST
-- Khong xoa cac bang khac ngoai scope cua kho du lieu nay
-- =========================================================

IF OBJECT_ID(N'du_lieu_xep_hang_gia_su', N'U') IS NOT NULL
    DROP TABLE du_lieu_xep_hang_gia_su;

IF OBJECT_ID(N'du_lieu_nhu_cau_hoc', N'U') IS NOT NULL
    DROP TABLE du_lieu_nhu_cau_hoc;

IF OBJECT_ID(N'du_lieu_gia_su_day_mon', N'U') IS NOT NULL
    DROP TABLE du_lieu_gia_su_day_mon;

IF OBJECT_ID(N'thong_tin_hoc_sinh', N'U') IS NOT NULL
    DROP TABLE thong_tin_hoc_sinh;

IF OBJECT_ID(N'thong_tin_gia_su', N'U') IS NOT NULL
    DROP TABLE thong_tin_gia_su;

IF OBJECT_ID(N'danh_muc_mon_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_mon_hoc;

IF OBJECT_ID(N'danh_muc_lop_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_lop_hoc;

IF OBJECT_ID(N'danh_muc_truong_hoc', N'U') IS NOT NULL
    DROP TABLE danh_muc_truong_hoc;

IF OBJECT_ID(N'danh_muc_khu_vuc', N'U') IS NOT NULL
    DROP TABLE danh_muc_khu_vuc;

-- =========================================================
-- 1. CAC BANG DANH MUC
-- Dung de loc, nhom va thong ke
-- =========================================================

CREATE TABLE danh_muc_khu_vuc (
    khu_vuc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_khu_vuc NVARCHAR(50) NULL,
    ten_khu_vuc NVARCHAR(100) NOT NULL,
    quan_huyen NVARCHAR(100) NULL,
    tinh_thanh NVARCHAR(100) NOT NULL,
    CONSTRAINT UQ_danh_muc_khu_vuc UNIQUE (ten_khu_vuc, quan_huyen, tinh_thanh)
);

CREATE TABLE danh_muc_truong_hoc (
    truong_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_truong_hoc NVARCHAR(50) NULL,
    ten_truong_hoc NVARCHAR(200) NOT NULL,
    loai_truong NVARCHAR(50) NOT NULL,
    khu_vuc_id INT NULL,
    CONSTRAINT FK_danh_muc_truong_hoc_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT CK_danh_muc_truong_hoc_loai CHECK (
        loai_truong IN (N'dai_hoc', N'thpt', N'thcs', N'tieu_hoc', N'trung_tam', N'khac')
    )
);

CREATE TABLE danh_muc_lop_hoc (
    lop_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_lop_hoc NVARCHAR(50) NULL,
    ten_lop_hoc NVARCHAR(50) NOT NULL,
    cap_hoc NVARCHAR(50) NOT NULL,
    CONSTRAINT UQ_danh_muc_lop_hoc UNIQUE (ten_lop_hoc, cap_hoc),
    CONSTRAINT CK_danh_muc_lop_hoc_cap_hoc CHECK (
        cap_hoc IN (N'tieu_hoc', N'thcs', N'thpt', N'dai_hoc', N'khac')
    )
);

CREATE TABLE danh_muc_mon_hoc (
    mon_hoc_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_mon_hoc NVARCHAR(50) NULL,
    ten_mon_hoc NVARCHAR(100) NOT NULL,
    nhom_mon_hoc NVARCHAR(100) NULL,
    CONSTRAINT UQ_danh_muc_mon_hoc UNIQUE (ten_mon_hoc)
);

-- =========================================================
-- 2. CAC BANG THONG TIN DOI TUONG
-- Chua thong tin tong hop ve gia su va hoc sinh sau khi lam sach
-- =========================================================

-- =========================================================
-- HUONG DAN NAP DU LIEU CHO DATA LAKE / ETL
--
-- 1. Hoc sinh can tach thanh 2 nhom du lieu:
--    - thong_tin_hoc_sinh: thong tin dinh danh / ho so co ban
--    - du_lieu_nhu_cau_hoc: nhu cau hoc tap thuc te de phan tich
--
-- 2. Gia su can tach thanh 3 nhom du lieu:
--    - thong_tin_gia_su: thong tin ho so co ban
--    - du_lieu_gia_su_day_mon: danh sach mon/lop co the day
--    - du_lieu_xep_hang_gia_su: diem danh gia neu co
--
-- Quy uoc struct dau vao:
--    - HocSinh = ho so hoc sinh + nhu cau hoc di kem
--    - GiaSu = ho so gia su + mon co the day + danh gia di kem
--
-- 3. Cac truong tham chieu can duoc map hoac lookup truoc khi insert:
--    - truong_hoc_id   -> danh_muc_truong_hoc
--    - khu_vuc_id      -> danh_muc_khu_vuc
--    - lop_hoc_id      -> danh_muc_lop_hoc
--    - mon_hoc_id      -> danh_muc_mon_hoc
--
-- 4. Neu du lieu nguon khong co ID tham chieu, ETL nen dung cac field business key:
--    - khu_vuc: ma_khu_vuc hoac (ten_khu_vuc, quan_huyen, tinh_thanh)
--    - truong_hoc: ma_truong_hoc hoac (ten_truong_hoc, loai_truong)
--    - lop_hoc: ma_lop_hoc hoac (ten_lop_hoc, cap_hoc)
--    - mon_hoc: ma_mon_hoc hoac ten_mon_hoc
--
-- 5. Struct goi y de extract:
--
-- struct HocSinh {
--     string ma_hoc_sinh;             // bat buoc, duy nhat
--     string ho_ten;                  // co the null
--     string truong_hoc_ma;           // uu tien dung ma de lookup truong_hoc_id
--     string truong_hoc_ten;          // fallback neu khong co ma
--     string loai_truong;             // field ho tro lookup truong_hoc: dai_hoc | thpt | thcs | tieu_hoc | trung_tam | khac
--     string lop_hoc_ma;              // uu tien dung ma de lookup lop_hoc_id
--     string lop_hoc_ten;             // vi du: Lop 6, Lop 7, Lop 10, Lop 11, Lop 12
--     string cap_hoc;                 // tieu_hoc | thcs | thpt | dai_hoc | khac
--     string khu_vuc_ma;              // uu tien dung ma de lookup khu_vuc_id
--     string ten_khu_vuc;             // fallback neu khong co ma
--     string quan_huyen;              // phuc vu map danh_muc_khu_vuc
--     string tinh_thanh;              // phuc vu map danh_muc_khu_vuc
--     string hoc_luc;                 // yeu | trung_binh | kha | gioi | xuat_sac
--     string nguon_du_lieu;           // excel | sql | api | ...
--     string trang_thai;              // hoat_dong | tam_an | an
--     datetime ngay_cap_nhat;         // neu null thi de DB tu sinh
--
--     // Nhu cau hoc tap cua hoc sinh: insert vao du_lieu_nhu_cau_hoc
--     string mon_hoc_ma;              // uu tien dung ma de lookup mon_hoc_id
--     string ten_mon_hoc;             // fallback neu khong co ma
--     string nhom_mon_hoc;            // tu nhien | xa hoi | ngoai ngu | ...
--     string hinh_thuc_hoc;           // online | truc_tiep | ca_hai
--     string muc_tieu_hoc_tap;        // chuoi mo ta muc tieu
--     decimal ngan_sach_toi_da_gio;   // >= 0
--     int so_buoi_moi_tuan;           // > 0
--     string trang_thai_nhu_cau;      // dang_tim_gia_su | da_ghep | tam_dung
--     date ngay_dang;                 // neu null thi de DB tu sinh
-- }
--
-- struct GiaSu {
--     string ma_gia_su;               // bat buoc, duy nhat
--     string ho_ten;                  // bat buoc
--     string gioi_tinh;               // nam | nu | khac
--     short nam_sinh;                 // 1900..2100
--     string hoc_vi;                  // Cu nhan, Ky su, Thac si, ...
--     string chuyen_nganh;            // CNTT, Toan, Vat ly, ...
--     string truong_hoc_ma;           // uu tien dung ma de lookup truong_hoc_id
--     string truong_hoc_ten;          // fallback neu khong co ma
--     string loai_truong;             // field ho tro lookup truong_hoc: dai_hoc | thpt | thcs | tieu_hoc | trung_tam | khac
--     string khu_vuc_ma;              // uu tien dung ma de lookup khu_vuc_id
--     string ten_khu_vuc;             // fallback neu khong co ma
--     string quan_huyen;              // phuc vu map danh_muc_khu_vuc
--     string tinh_thanh;              // phuc vu map danh_muc_khu_vuc
--     byte nam_kinh_nghiem;           // 0..60
--     string hinh_thuc_day;           // online | truc_tiep | ca_hai
--     decimal hoc_phi_trung_binh_gio; // >= 0
--     string nguon_du_lieu;           // excel | sql | api | ...
--     string trang_thai;              // hoat_dong | tam_an | an
--     datetime ngay_cap_nhat;         // neu null thi de DB tu sinh
--
--     // Nang luc day hoc cua gia su: insert vao du_lieu_gia_su_day_mon
--     string mon_hoc_ma;              // uu tien dung ma de lookup mon_hoc_id
--     string ten_mon_hoc;             // fallback neu khong co ma
--     string nhom_mon_hoc;            // phuc vu map danh_muc_mon_hoc
--     string lop_hoc_ma;              // uu tien dung ma de lookup lop_hoc_id
--     string lop_hoc_ten;             // lop gia su co the day
--     string cap_hoc;                 // tieu_hoc | thcs | thpt | dai_hoc | khac
--     decimal hoc_phi_trung_binh_gio_day_mon; // map vao du_lieu_gia_su_day_mon.hoc_phi_trung_binh_gio, >= 0
--
--     // Danh gia gia su: insert vao du_lieu_xep_hang_gia_su neu co
--     string ma_hoc_sinh_danh_gia;    // map sang hoc_sinh_id, co the null
--     decimal diem_xep_hang;          // 0..5
--     date ngay_danh_gia;             // neu null thi de DB tu sinh
-- }
--
-- 6. Thu tu ETL de tranh loi khoa ngoai:
--    - Nap danh_muc_khu_vuc
--    - Nap danh_muc_truong_hoc
--    - Nap danh_muc_lop_hoc
--    - Nap danh_muc_mon_hoc
--    - Nap thong_tin_hoc_sinh / thong_tin_gia_su
--    - Nap du_lieu_nhu_cau_hoc / du_lieu_gia_su_day_mon / du_lieu_xep_hang_gia_su
-- =========================================================

CREATE TABLE thong_tin_gia_su (
    gia_su_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_gia_su NVARCHAR(50) NOT NULL,
    ho_ten NVARCHAR(150) NOT NULL,
    gioi_tinh NVARCHAR(20) NULL,
    nam_sinh SMALLINT NULL,
    hoc_vi NVARCHAR(100) NULL,
    chuyen_nganh NVARCHAR(150) NULL,
    truong_hoc_id INT NULL,
    khu_vuc_id INT NULL,
    nam_kinh_nghiem TINYINT NULL,
    hinh_thuc_day NVARCHAR(50) NULL,
    hoc_phi_trung_binh_gio DECIMAL(12,2) NULL,
    nguon_du_lieu NVARCHAR(50) NULL,
    trang_thai NVARCHAR(30) NOT NULL DEFAULT N'hoat_dong',
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_thong_tin_gia_su_truong_hoc FOREIGN KEY (truong_hoc_id) REFERENCES danh_muc_truong_hoc(truong_hoc_id),
    CONSTRAINT FK_thong_tin_gia_su_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT UQ_thong_tin_gia_su UNIQUE (ma_gia_su),
    CONSTRAINT CK_thong_tin_gia_su_gioi_tinh CHECK (
        gioi_tinh IS NULL OR gioi_tinh IN (N'nam', N'nu', N'khac')
    ),
    CONSTRAINT CK_thong_tin_gia_su_nam_sinh CHECK (
        nam_sinh IS NULL OR nam_sinh BETWEEN 1900 AND 2100
    ),
    CONSTRAINT CK_thong_tin_gia_su_kinh_nghiem CHECK (
        nam_kinh_nghiem IS NULL OR nam_kinh_nghiem BETWEEN 0 AND 60
    ),
    CONSTRAINT CK_thong_tin_gia_su_hinh_thuc CHECK (
        hinh_thuc_day IS NULL OR hinh_thuc_day IN (N'online', N'truc_tiep', N'ca_hai')
    ),
    CONSTRAINT CK_thong_tin_gia_su_hoc_phi CHECK (
        hoc_phi_trung_binh_gio IS NULL OR hoc_phi_trung_binh_gio >= 0
    ),
    CONSTRAINT CK_thong_tin_gia_su_trang_thai CHECK (
        trang_thai IN (N'hoat_dong', N'tam_an', N'an')
    )
);

CREATE TABLE thong_tin_hoc_sinh (
    hoc_sinh_id INT IDENTITY(1,1) PRIMARY KEY,
    ma_hoc_sinh NVARCHAR(50) NOT NULL,
    ho_ten NVARCHAR(150) NULL,
    truong_hoc_id INT NULL,
    lop_hoc_id INT NULL,
    khu_vuc_id INT NULL,
    hoc_luc NVARCHAR(50) NULL,
    nguon_du_lieu NVARCHAR(50) NULL,
    trang_thai NVARCHAR(30) NOT NULL DEFAULT N'hoat_dong',
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_thong_tin_hoc_sinh_truong_hoc FOREIGN KEY (truong_hoc_id) REFERENCES danh_muc_truong_hoc(truong_hoc_id),
    CONSTRAINT FK_thong_tin_hoc_sinh_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT FK_thong_tin_hoc_sinh_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT UQ_thong_tin_hoc_sinh UNIQUE (ma_hoc_sinh),
    CONSTRAINT CK_thong_tin_hoc_sinh_hoc_luc CHECK (
        hoc_luc IS NULL OR hoc_luc IN (N'yeu', N'trung_binh', N'kha', N'gioi', N'xuat_sac')
    ),
    CONSTRAINT CK_thong_tin_hoc_sinh_trang_thai CHECK (
        trang_thai IN (N'hoat_dong', N'tam_an', N'an')
    )
);

-- =========================================================
-- 3. CAC BANG DU LIEU PHAN TICH
-- Day la cac bang chinh de len dashboard
-- =========================================================

CREATE TABLE du_lieu_gia_su_day_mon (
    du_lieu_gia_su_day_mon_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gia_su_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    lop_hoc_id INT NULL,
    hoc_phi_trung_binh_gio DECIMAL(12,2) NULL,
    ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_gia_su FOREIGN KEY (gia_su_id) REFERENCES thong_tin_gia_su(gia_su_id),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_mon_hoc FOREIGN KEY (mon_hoc_id) REFERENCES danh_muc_mon_hoc(mon_hoc_id),
    CONSTRAINT FK_du_lieu_gia_su_day_mon_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT UQ_du_lieu_gia_su_day_mon UNIQUE (gia_su_id, mon_hoc_id, lop_hoc_id),
    CONSTRAINT CK_du_lieu_gia_su_day_mon_hoc_phi CHECK (
        hoc_phi_trung_binh_gio IS NULL OR hoc_phi_trung_binh_gio >= 0
    )
);

CREATE TABLE du_lieu_nhu_cau_hoc (
    du_lieu_nhu_cau_hoc_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    hoc_sinh_id INT NULL,
    mon_hoc_id INT NOT NULL,
    lop_hoc_id INT NOT NULL,
    khu_vuc_id INT NOT NULL,
    hinh_thuc_hoc NVARCHAR(50) NULL,
    muc_tieu_hoc_tap NVARCHAR(255) NULL,
    ngan_sach_toi_da_gio DECIMAL(12,2) NULL,
    so_buoi_moi_tuan TINYINT NULL,
    trang_thai_nhu_cau NVARCHAR(30) NOT NULL DEFAULT N'dang_tim_gia_su',
    ngay_dang DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    nguon_du_lieu NVARCHAR(50) NULL,
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_hoc_sinh FOREIGN KEY (hoc_sinh_id) REFERENCES thong_tin_hoc_sinh(hoc_sinh_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_mon_hoc FOREIGN KEY (mon_hoc_id) REFERENCES danh_muc_mon_hoc(mon_hoc_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES danh_muc_lop_hoc(lop_hoc_id),
    CONSTRAINT FK_du_lieu_nhu_cau_hoc_khu_vuc FOREIGN KEY (khu_vuc_id) REFERENCES danh_muc_khu_vuc(khu_vuc_id),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_hinh_thuc CHECK (
        hinh_thuc_hoc IS NULL OR hinh_thuc_hoc IN (N'online', N'truc_tiep', N'ca_hai')
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_ngan_sach CHECK (
        ngan_sach_toi_da_gio IS NULL OR ngan_sach_toi_da_gio >= 0
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_so_buoi CHECK (
        so_buoi_moi_tuan IS NULL OR so_buoi_moi_tuan > 0
    ),
    CONSTRAINT CK_du_lieu_nhu_cau_hoc_trang_thai CHECK (
        trang_thai_nhu_cau IN (N'dang_tim_gia_su', N'da_ghep', N'tam_dung')
    )
);

CREATE TABLE du_lieu_xep_hang_gia_su (
    du_lieu_xep_hang_gia_su_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gia_su_id INT NOT NULL,
    hoc_sinh_id INT NULL,
    diem_xep_hang DECIMAL(3,2) NOT NULL,
    ngay_danh_gia DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    nguon_du_lieu NVARCHAR(50) NULL,
    CONSTRAINT FK_du_lieu_xep_hang_gia_su_gia_su FOREIGN KEY (gia_su_id) REFERENCES thong_tin_gia_su(gia_su_id),
    CONSTRAINT FK_du_lieu_xep_hang_gia_su_hoc_sinh FOREIGN KEY (hoc_sinh_id) REFERENCES thong_tin_hoc_sinh(hoc_sinh_id),
    CONSTRAINT CK_du_lieu_xep_hang_gia_su_diem CHECK (
        diem_xep_hang BETWEEN 0 AND 5
    )
);

-- =========================================================
-- 4. CHI MUC PHUC VU DASHBOARD
-- =========================================================

CREATE INDEX IX_thong_tin_gia_su_khu_vuc_truong
ON thong_tin_gia_su(khu_vuc_id, truong_hoc_id, trang_thai);

CREATE INDEX IX_du_lieu_gia_su_day_mon
ON du_lieu_gia_su_day_mon(mon_hoc_id, lop_hoc_id);

CREATE INDEX IX_du_lieu_nhu_cau_hoc_top
ON du_lieu_nhu_cau_hoc(mon_hoc_id, lop_hoc_id, khu_vuc_id, trang_thai_nhu_cau);

CREATE INDEX IX_du_lieu_xep_hang_gia_su_top
ON du_lieu_xep_hang_gia_su(gia_su_id, diem_xep_hang);

CREATE UNIQUE INDEX UX_danh_muc_khu_vuc_ma
ON danh_muc_khu_vuc(ma_khu_vuc)
WHERE ma_khu_vuc IS NOT NULL;

CREATE UNIQUE INDEX UX_danh_muc_truong_hoc_ma
ON danh_muc_truong_hoc(ma_truong_hoc)
WHERE ma_truong_hoc IS NOT NULL;

CREATE UNIQUE INDEX UX_danh_muc_lop_hoc_ma
ON danh_muc_lop_hoc(ma_lop_hoc)
WHERE ma_lop_hoc IS NOT NULL;

CREATE UNIQUE INDEX UX_danh_muc_mon_hoc_ma
ON danh_muc_mon_hoc(ma_mon_hoc)
WHERE ma_mon_hoc IS NOT NULL;

-- =========================================================
-- 5. DU LIEU MAU DE TEST DASHBOARD
-- Giu nguyen phan CREATE TABLE, chi chen them du lieu mau
-- =========================================================

INSERT INTO danh_muc_khu_vuc (ma_khu_vuc, ten_khu_vuc, quan_huyen, tinh_thanh)
VALUES
    (N'KV_HN_CG', N'Cau Giay', N'Cau Giay', N'Ha Noi'),
    (N'KV_HN_DD', N'Dong Da', N'Dong Da', N'Ha Noi'),
    (N'KV_HCM_TD', N'Thu Duc', N'Thu Duc', N'Ho Chi Minh'),
    (N'KV_DN_HC', N'Hai Chau', N'Hai Chau', N'Da Nang');

INSERT INTO danh_muc_truong_hoc (ma_truong_hoc, ten_truong_hoc, loai_truong, khu_vuc_id)
VALUES
    (N'DH_BK_HN', N'Dai hoc Bach Khoa Ha Noi', N'dai_hoc', 2),
    (N'DH_QGHN', N'Dai hoc Quoc gia Ha Noi', N'dai_hoc', 1),
    (N'DH_SP_HN', N'Dai hoc Su pham Ha Noi', N'dai_hoc', 1),
    (N'DH_BK_HCM', N'Dai hoc Bach Khoa TP HCM', N'dai_hoc', 3),
    (N'THPT_CG', N'THPT Cau Giay', N'thpt', 1),
    (N'THPT_DD', N'THPT Dong Da', N'thpt', 2),
    (N'THPT_TD', N'THPT Thu Duc', N'thpt', 3);

INSERT INTO danh_muc_lop_hoc (ma_lop_hoc, ten_lop_hoc, cap_hoc)
VALUES
    (N'LOP_06', N'Lop 6', N'thcs'),
    (N'LOP_07', N'Lop 7', N'thcs'),
    (N'LOP_10', N'Lop 10', N'thpt'),
    (N'LOP_11', N'Lop 11', N'thpt'),
    (N'LOP_12', N'Lop 12', N'thpt');

INSERT INTO danh_muc_mon_hoc (ma_mon_hoc, ten_mon_hoc, nhom_mon_hoc)
VALUES
    (N'MON_TOAN', N'Toan', N'tu_nhien'),
    (N'MON_VAN', N'Ngu van', N'xa_hoi'),
    (N'MON_ANH', N'Tieng Anh', N'ngoai_ngu'),
    (N'MON_LY', N'Vat ly', N'tu_nhien'),
    (N'MON_HOA', N'Hoa hoc', N'tu_nhien');

INSERT INTO thong_tin_gia_su (
    ma_gia_su, ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
    truong_hoc_id, khu_vuc_id, nam_kinh_nghiem, hinh_thuc_day,
    hoc_phi_trung_binh_gio, nguon_du_lieu, trang_thai
)
SELECT
    src.ma_gia_su,
    src.ho_ten,
    src.gioi_tinh,
    src.nam_sinh,
    src.hoc_vi,
    src.chuyen_nganh,
    th.truong_hoc_id,
    kv.khu_vuc_id,
    src.nam_kinh_nghiem,
    src.hinh_thuc_day,
    src.hoc_phi_trung_binh_gio,
    src.nguon_du_lieu,
    src.trang_thai
FROM (
    VALUES
        (N'GS001', N'Nguyen Minh Anh', N'nu', 2000, N'Cu nhan', N'Su pham Toan', N'DH_SP_HN', N'KV_HN_CG', 3, N'ca_hai', 180000, N'excel', N'hoat_dong'),
        (N'GS002', N'Tran Quang Huy', N'nam', 1999, N'Ky su', N'Cong nghe thong tin', N'DH_BK_HN', N'KV_HN_DD', 4, N'truc_tiep', 220000, N'sql', N'hoat_dong'),
        (N'GS003', N'Le Thu Trang', N'nu', 2001, N'Cu nhan', N'Ngon ngu Anh', N'DH_QGHN', N'KV_HN_CG', 2, N'online', 170000, N'excel', N'hoat_dong'),
        (N'GS004', N'Pham Duc Long', N'nam', 1998, N'Thac si', N'Vat ly ky thuat', N'DH_BK_HN', N'KV_HN_DD', 5, N'ca_hai', 250000, N'api', N'hoat_dong'),
        (N'GS005', N'Vo Gia Han', N'nu', 2000, N'Cu nhan', N'Hoa hoc', N'DH_BK_HCM', N'KV_HCM_TD', 3, N'truc_tiep', 190000, N'excel', N'hoat_dong'),
        (N'GS006', N'Dang Tien Dat', N'nam', 1997, N'Thac si', N'Toan ung dung', N'DH_QGHN', N'KV_HN_CG', 6, N'ca_hai', 260000, N'sql', N'hoat_dong')
) AS src (
    ma_gia_su, ho_ten, gioi_tinh, nam_sinh, hoc_vi, chuyen_nganh,
    ma_truong_hoc, ma_khu_vuc, nam_kinh_nghiem, hinh_thuc_day,
    hoc_phi_trung_binh_gio, nguon_du_lieu, trang_thai
)
INNER JOIN danh_muc_truong_hoc AS th
    ON th.ma_truong_hoc = src.ma_truong_hoc
INNER JOIN danh_muc_khu_vuc AS kv
    ON kv.ma_khu_vuc = src.ma_khu_vuc;

INSERT INTO thong_tin_hoc_sinh (
    ma_hoc_sinh, ho_ten, truong_hoc_id, lop_hoc_id, khu_vuc_id,
    hoc_luc, nguon_du_lieu, trang_thai
)
SELECT
    src.ma_hoc_sinh,
    src.ho_ten,
    th.truong_hoc_id,
    lh.lop_hoc_id,
    kv.khu_vuc_id,
    src.hoc_luc,
    src.nguon_du_lieu,
    src.trang_thai
FROM (
    VALUES
        (N'HS001', N'Nguyen Hoang Nam', N'THPT_CG', N'LOP_12', N'KV_HN_CG', N'kha', N'excel', N'hoat_dong'),
        (N'HS002', N'Tran Ha Linh', N'THPT_CG', N'LOP_12', N'KV_HN_CG', N'gioi', N'excel', N'hoat_dong'),
        (N'HS003', N'Le Minh Khoa', N'THPT_DD', N'LOP_11', N'KV_HN_DD', N'trung_binh', N'sql', N'hoat_dong'),
        (N'HS004', N'Pham Bao Chau', N'THPT_TD', N'LOP_12', N'KV_HCM_TD', N'kha', N'sql', N'hoat_dong'),
        (N'HS005', N'Vu Anh Thu', N'THPT_DD', N'LOP_10', N'KV_HN_DD', N'gioi', N'api', N'hoat_dong'),
        (N'HS006', N'Do Tuan Kiet', N'THPT_CG', N'LOP_11', N'KV_HN_CG', N'kha', N'excel', N'hoat_dong'),
        (N'HS007', N'Bui Khanh An', N'THPT_TD', N'LOP_10', N'KV_HCM_TD', N'trung_binh', N'sql', N'hoat_dong'),
        (N'HS008', N'Nguyen Gia Han', N'THPT_CG', N'LOP_12', N'KV_HN_CG', N'yeu', N'excel', N'hoat_dong')
) AS src (
    ma_hoc_sinh, ho_ten, ma_truong_hoc, ma_lop_hoc, ma_khu_vuc,
    hoc_luc, nguon_du_lieu, trang_thai
)
INNER JOIN danh_muc_truong_hoc AS th
    ON th.ma_truong_hoc = src.ma_truong_hoc
INNER JOIN danh_muc_lop_hoc AS lh
    ON lh.ma_lop_hoc = src.ma_lop_hoc
INNER JOIN danh_muc_khu_vuc AS kv
    ON kv.ma_khu_vuc = src.ma_khu_vuc;

INSERT INTO du_lieu_gia_su_day_mon (
    gia_su_id, mon_hoc_id, lop_hoc_id, hoc_phi_trung_binh_gio
)
SELECT
    gs.gia_su_id,
    mh.mon_hoc_id,
    lh.lop_hoc_id,
    src.hoc_phi_trung_binh_gio
FROM (
    VALUES
        (N'GS001', N'MON_TOAN', N'LOP_10', 170000),
        (N'GS001', N'MON_TOAN', N'LOP_11', 180000),
        (N'GS001', N'MON_TOAN', N'LOP_12', 200000),
        (N'GS002', N'MON_TOAN', N'LOP_12', 230000),
        (N'GS002', N'MON_LY', N'LOP_12', 240000),
        (N'GS003', N'MON_ANH', N'LOP_10', 160000),
        (N'GS003', N'MON_ANH', N'LOP_11', 170000),
        (N'GS003', N'MON_ANH', N'LOP_12', 180000),
        (N'GS004', N'MON_LY', N'LOP_11', 240000),
        (N'GS004', N'MON_LY', N'LOP_12', 260000),
        (N'GS005', N'MON_HOA', N'LOP_10', 180000),
        (N'GS005', N'MON_HOA', N'LOP_11', 190000),
        (N'GS006', N'MON_TOAN', N'LOP_12', 260000),
        (N'GS006', N'MON_LY', N'LOP_12', 270000)
) AS src (ma_gia_su, ma_mon_hoc, ma_lop_hoc, hoc_phi_trung_binh_gio)
INNER JOIN thong_tin_gia_su AS gs
    ON gs.ma_gia_su = src.ma_gia_su
INNER JOIN danh_muc_mon_hoc AS mh
    ON mh.ma_mon_hoc = src.ma_mon_hoc
INNER JOIN danh_muc_lop_hoc AS lh
    ON lh.ma_lop_hoc = src.ma_lop_hoc;

INSERT INTO du_lieu_nhu_cau_hoc (
    hoc_sinh_id, mon_hoc_id, lop_hoc_id, khu_vuc_id, hinh_thuc_hoc,
    muc_tieu_hoc_tap, ngan_sach_toi_da_gio, so_buoi_moi_tuan,
    trang_thai_nhu_cau, ngay_dang, nguon_du_lieu
)
SELECT
    hs.hoc_sinh_id,
    mh.mon_hoc_id,
    lh.lop_hoc_id,
    kv.khu_vuc_id,
    src.hinh_thuc_hoc,
    src.muc_tieu_hoc_tap,
    src.ngan_sach_toi_da_gio,
    src.so_buoi_moi_tuan,
    src.trang_thai_nhu_cau,
    src.ngay_dang,
    src.nguon_du_lieu
FROM (
    VALUES
        (N'HS001', N'MON_TOAN', N'LOP_12', N'KV_HN_CG', N'truc_tiep', N'On thi tot nghiep mon Toan', 220000, 3, N'dang_tim_gia_su', CAST('2026-04-01' AS DATE), N'excel'),
        (N'HS002', N'MON_TOAN', N'LOP_12', N'KV_HN_CG', N'ca_hai', N'Cung co Toan 12', 250000, 2, N'dang_tim_gia_su', CAST('2026-04-01' AS DATE), N'excel'),
        (N'HS003', N'MON_ANH', N'LOP_11', N'KV_HN_DD', N'online', N'Cai thien giao tiep Tieng Anh', 180000, 3, N'dang_tim_gia_su', CAST('2026-04-02' AS DATE), N'sql'),
        (N'HS004', N'MON_TOAN', N'LOP_12', N'KV_HCM_TD', N'truc_tiep', N'On thi dai hoc mon Toan', 230000, 3, N'dang_tim_gia_su', CAST('2026-04-02' AS DATE), N'sql'),
        (N'HS005', N'MON_LY', N'LOP_10', N'KV_HN_DD', N'truc_tiep', N'Hoc tot Vat ly 10', 210000, 2, N'dang_tim_gia_su', CAST('2026-04-02' AS DATE), N'api'),
        (N'HS006', N'MON_TOAN', N'LOP_11', N'KV_HN_CG', N'ca_hai', N'Nang diem Toan 11', 200000, 2, N'dang_tim_gia_su', CAST('2026-04-03' AS DATE), N'excel'),
        (N'HS007', N'MON_ANH', N'LOP_10', N'KV_HCM_TD', N'online', N'Mat goc Tieng Anh can kem co ban', 170000, 3, N'dang_tim_gia_su', CAST('2026-04-03' AS DATE), N'sql'),
        (N'HS008', N'MON_TOAN', N'LOP_12', N'KV_HN_CG', N'truc_tiep', N'Mat goc Toan 12 can hoc lai', 260000, 4, N'dang_tim_gia_su', CAST('2026-04-03' AS DATE), N'excel'),
        (N'HS005', N'MON_TOAN', N'LOP_10', N'KV_HN_DD', N'truc_tiep', N'Bo sung Toan 10', 200000, 2, N'da_ghep', CAST('2026-04-01' AS DATE), N'api')
) AS src (
    ma_hoc_sinh, ma_mon_hoc, ma_lop_hoc, ma_khu_vuc, hinh_thuc_hoc,
    muc_tieu_hoc_tap, ngan_sach_toi_da_gio, so_buoi_moi_tuan,
    trang_thai_nhu_cau, ngay_dang, nguon_du_lieu
)
INNER JOIN thong_tin_hoc_sinh AS hs
    ON hs.ma_hoc_sinh = src.ma_hoc_sinh
INNER JOIN danh_muc_mon_hoc AS mh
    ON mh.ma_mon_hoc = src.ma_mon_hoc
INNER JOIN danh_muc_lop_hoc AS lh
    ON lh.ma_lop_hoc = src.ma_lop_hoc
INNER JOIN danh_muc_khu_vuc AS kv
    ON kv.ma_khu_vuc = src.ma_khu_vuc;

INSERT INTO du_lieu_xep_hang_gia_su (
    gia_su_id, hoc_sinh_id, diem_xep_hang, ngay_danh_gia, nguon_du_lieu
)
SELECT
    gs.gia_su_id,
    hs.hoc_sinh_id,
    src.diem_xep_hang,
    src.ngay_danh_gia,
    src.nguon_du_lieu
FROM (
    VALUES
        (N'GS001', N'HS001', 4.80, CAST('2026-04-01' AS DATE), N'excel'),
        (N'GS001', N'HS002', 4.90, CAST('2026-04-02' AS DATE), N'excel'),
        (N'GS002', N'HS003', 4.60, CAST('2026-04-01' AS DATE), N'sql'),
        (N'GS002', N'HS006', 4.70, CAST('2026-04-03' AS DATE), N'sql'),
        (N'GS003', N'HS003', 4.75, CAST('2026-04-02' AS DATE), N'excel'),
        (N'GS003', N'HS007', 4.85, CAST('2026-04-03' AS DATE), N'excel'),
        (N'GS004', N'HS005', 4.95, CAST('2026-04-02' AS DATE), N'api'),
        (N'GS004', N'HS004', 4.90, CAST('2026-04-03' AS DATE), N'api'),
        (N'GS005', N'HS004', 4.40, CAST('2026-04-02' AS DATE), N'excel'),
        (N'GS006', N'HS008', 5.00, CAST('2026-04-03' AS DATE), N'sql'),
        (N'GS006', N'HS002', 4.95, CAST('2026-04-03' AS DATE), N'sql')
) AS src (ma_gia_su, ma_hoc_sinh, diem_xep_hang, ngay_danh_gia, nguon_du_lieu)
INNER JOIN thong_tin_gia_su AS gs
    ON gs.ma_gia_su = src.ma_gia_su
INNER JOIN thong_tin_hoc_sinh AS hs
    ON hs.ma_hoc_sinh = src.ma_hoc_sinh;

-- =========================================================
-- 6. TRUY VAN MAU CHO DASHBOARD
-- =========================================================

-- 6.1. Top khu vuc co nhieu gia su hoat dong nhat
SELECT TOP 10
    kv.khu_vuc_id,
    kv.ten_khu_vuc,
    kv.quan_huyen,
    kv.tinh_thanh,
    COUNT(gs.gia_su_id) AS so_luong_gia_su
FROM thong_tin_gia_su AS gs
INNER JOIN danh_muc_khu_vuc AS kv
    ON gs.khu_vuc_id = kv.khu_vuc_id
WHERE gs.trang_thai = N'hoat_dong'
GROUP BY
    kv.khu_vuc_id,
    kv.ten_khu_vuc,
    kv.quan_huyen,
    kv.tinh_thanh
ORDER BY so_luong_gia_su DESC, kv.ten_khu_vuc ASC;

-- 6.2. Top truong dai hoc co nhieu gia su hoat dong nhat
SELECT TOP 10
    th.truong_hoc_id,
    th.ten_truong_hoc,
    kv.ten_khu_vuc,
    kv.tinh_thanh,
    COUNT(gs.gia_su_id) AS so_luong_gia_su
FROM thong_tin_gia_su AS gs
INNER JOIN danh_muc_truong_hoc AS th
    ON gs.truong_hoc_id = th.truong_hoc_id
LEFT JOIN danh_muc_khu_vuc AS kv
    ON th.khu_vuc_id = kv.khu_vuc_id
WHERE gs.trang_thai = N'hoat_dong'
  AND th.loai_truong = N'dai_hoc'
GROUP BY
    th.truong_hoc_id,
    th.ten_truong_hoc,
    kv.ten_khu_vuc,
    kv.tinh_thanh
ORDER BY so_luong_gia_su DESC, th.ten_truong_hoc ASC;

-- 6.3. Top lop / mon hoc / khu vuc co nhieu hoc sinh dang can day nhat
SELECT TOP 10
    lh.ten_lop_hoc,
    lh.cap_hoc,
    mh.ten_mon_hoc,
    kv.ten_khu_vuc,
    kv.tinh_thanh,
    COUNT(DISTINCT COALESCE(CONVERT(NVARCHAR(30), nc.hoc_sinh_id), CONCAT(N'ANON_', CONVERT(NVARCHAR(30), nc.du_lieu_nhu_cau_hoc_id)))) AS so_luong_hoc_sinh,
    COUNT(nc.du_lieu_nhu_cau_hoc_id) AS so_luong_nhu_cau
FROM du_lieu_nhu_cau_hoc AS nc
INNER JOIN danh_muc_lop_hoc AS lh
    ON nc.lop_hoc_id = lh.lop_hoc_id
INNER JOIN danh_muc_mon_hoc AS mh
    ON nc.mon_hoc_id = mh.mon_hoc_id
INNER JOIN danh_muc_khu_vuc AS kv
    ON nc.khu_vuc_id = kv.khu_vuc_id
WHERE nc.trang_thai_nhu_cau = N'dang_tim_gia_su'
GROUP BY
    lh.ten_lop_hoc,
    lh.cap_hoc,
    mh.ten_mon_hoc,
    kv.ten_khu_vuc,
    kv.tinh_thanh
ORDER BY so_luong_hoc_sinh DESC, so_luong_nhu_cau DESC, lh.ten_lop_hoc ASC, mh.ten_mon_hoc ASC;

-- 6.4. Top gia su co xep hang cao nhat
-- Chi tinh cac gia su co it nhat 2 luot danh gia de tranh top bi lech
SELECT TOP 10
    gs.gia_su_id,
    gs.ma_gia_su,
    gs.ho_ten,
    kv.ten_khu_vuc,
    th.ten_truong_hoc,
    CAST(AVG(xh.diem_xep_hang) AS DECIMAL(4,2)) AS diem_trung_binh,
    COUNT(xh.du_lieu_xep_hang_gia_su_id) AS so_luot_danh_gia
FROM du_lieu_xep_hang_gia_su AS xh
INNER JOIN thong_tin_gia_su AS gs
    ON xh.gia_su_id = gs.gia_su_id
LEFT JOIN danh_muc_khu_vuc AS kv
    ON gs.khu_vuc_id = kv.khu_vuc_id
LEFT JOIN danh_muc_truong_hoc AS th
    ON gs.truong_hoc_id = th.truong_hoc_id
WHERE gs.trang_thai = N'hoat_dong'
GROUP BY
    gs.gia_su_id,
    gs.ma_gia_su,
    gs.ho_ten,
    kv.ten_khu_vuc,
    th.ten_truong_hoc
HAVING COUNT(xh.du_lieu_xep_hang_gia_su_id) >= 2
ORDER BY diem_trung_binh DESC, so_luot_danh_gia DESC, gs.ho_ten ASC;
