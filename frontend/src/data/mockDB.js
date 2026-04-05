const initialTutors = [
  { id: 'GS001', ma_gia_su: 'GS_001', name: 'Nguyễn Minh Anh', gender: 'Nữ', year: 2000, degree: 'Cử nhân', school: 'ĐH Sư phạm HN', area: 'Cầu Giấy', exp: 3, fee: 180000, status: 'Hoạt động', subjects: ['Toán'], grades: ['Lớp 10', 'Lớp 11', 'Lớp 12'], email: 'anh.nm@gmail.com', phone: '0981234567' },
  { id: 'GS002', ma_gia_su: 'GS_002', name: 'Trần Quang Huy', gender: 'Nam', year: 1999, degree: 'Kỹ sư', school: 'ĐH Bách Khoa HN', area: 'Đống Đa', exp: 4, fee: 220000, status: 'Hoạt động', subjects: ['Toán', 'Vật lý'], grades: ['Lớp 12'], email: 'huy.tq@gmail.com', phone: '0912345678' },
  { id: 'GS003', ma_gia_su: 'GS_003', name: 'Lê Thu Trang', gender: 'Nữ', year: 2001, degree: 'Cử nhân', school: 'ĐH Quốc gia HN', area: 'Cầu Giấy', exp: 2, fee: 170000, status: 'Tạm ẩn', subjects: ['Tiếng Anh'], grades: ['Lớp 10', 'Lớp 11'], email: 'trang.lt@gmail.com', phone: '0934567890' },
  { id: 'GS004', ma_gia_su: 'GS_004', name: 'Phạm Đức Long', gender: 'Nam', year: 1998, degree: 'Thạc sĩ', school: 'ĐH Bách Khoa HN', area: 'Đống Đa', exp: 5, fee: 250000, status: 'Hoạt động', subjects: ['Vật lý'], grades: ['Lớp 11', 'Lớp 12'], email: 'long.pd@gmail.com', phone: '0945678901' },
];

const initialStudents = [
  { id: 'HS001', ma_nhu_cau: 'NC_001', studentName: 'Nguyễn Hoàng Nam', grade: 'Lớp 12', subject: 'Toán', area: 'Cầu Giấy', budget: 220000, type: 'Trực tiếp', target: 'Ôn thi tốt nghiệp', status: 'Đang tìm' },
  { id: 'HS002', ma_nhu_cau: 'NC_002', studentName: 'Trần Hà Linh', grade: 'Lớp 12', subject: 'Toán', area: 'Cầu Giấy', budget: 250000, type: 'Cả hai', target: 'Củng cố kiến thức', status: 'Đã ghép' },
  { id: 'HS003', ma_nhu_cau: 'NC_003', studentName: 'Lê Minh Khoa', grade: 'Lớp 11', subject: 'Tiếng Anh', area: 'Đống Đa', budget: 180000, type: 'Online', target: 'Cải thiện giao tiếp', status: 'Đang tìm' },
  { id: 'HS004', ma_nhu_cau: 'NC_004', studentName: 'Phạm Bảo Châu', grade: 'Lớp 12', subject: 'Vật lý', area: 'Thủ Đức', budget: 230000, type: 'Trực tiếp', target: 'Ôn đại học', status: 'Đang tìm' },
  { id: 'HS005', ma_nhu_cau: 'NC_005', studentName: 'Vũ Anh Thư', grade: 'Lớp 10', subject: 'Vật lý', area: 'Đống Đa', budget: 210000, type: 'Trực tiếp', target: 'Học tốt lớp 10', status: 'Đang tìm' },
];

const areas = ['Cầu Giấy', 'Đống Đa', 'Thanh Xuân', 'Nam Từ Liêm', 'Thủ Đức', 'Liên Chiểu'];
const subjects = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Tin học'];
const schools = ['ĐH Bách Khoa HN', 'ĐH Sư phạm HN', 'ĐH Quốc gia HN', 'ĐH Bách Khoa TP HCM'];

export { initialTutors, initialStudents, areas, subjects, schools };
