import axios from 'axios';

// Kết nối backend thật (Node.js + SQL Server) — dùng khi backend đã triển khai
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Mock server (json-server) — dùng khi chạy local demo không cần backend
const mock = axios.create({ baseURL: 'http://localhost:3001' });

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboardSummary = () =>
  Promise.all([
    mock.get('/top_khu_vuc_gia_su'),
    mock.get('/top_nhu_cau_hoc'),
  ]).then(([areaR, demandR]) => ({
    data: {
      data: {
        tong_gia_su_hoat_dong: areaR.data.reduce((s, d) => s + d.so_luong_gia_su, 0),
        tong_nhu_cau_dang_mo:  demandR.data.reduce((s, d) => s + d.so_luong_nhu_cau, 0),
        tong_khu_vuc: areaR.data.length,
        tong_mon_hoc: 5,
      }
    }
  }));

// ── Tutors — Read ──────────────────────────────────
export const getTutors             = (params = {}) => api.get('/tutors', { params });
export const getTutorById          = (id)          => api.get(`/tutors/${id}`);

// ── Tutors — Write (CRUD + SP) ─────────────────────
export const createTutor           = (data)        => api.post('/tutors', data);
export const updateTutor           = (id, data)    => api.put(`/tutors/${id}`, data);
export const updateTutorStatus     = (id, trang_thai) => api.patch(`/tutors/${id}/status`, { trang_thai });
export const deleteTutor           = (id)          => api.delete(`/tutors/${id}`);

// ── Students / Demands — Read ──────────────────────
export const getStudents           = (params = {}) => api.get('/students', { params });

// ── Students / Demands — Write ─────────────────────
export const createDemand          = (data)        => api.post('/students', data);
export const deleteDemand          = (id)          => api.delete(`/students/${id}`);

// ── Matching (SP) ──────────────────────────────────
export const findMatchingTutors    = (data)        => api.post('/matching', data);
export const confirmMatch          = (data)        => api.post('/matching/confirm', data);
export const getMatchLog           = ()            => api.get('/matching/log');

// ── Filters & Catalogs ─────────────────────────────
export const getFilters            = ()            => api.get('/filters');
export const getCatalogLopHoc      = ()            => api.get('/catalog/lop-hoc');
export const getCatalogTruongHoc   = ()            => api.get('/catalog/truong-hoc');

// ── Stats — đọc từ mock json-server, format về {data:{data:[{label,count}]}} ─
export const getStatsTutorsByArea = () =>
  mock.get('/top_khu_vuc_gia_su').then(r => ({
    data: {
      data: r.data.map(d => ({
        label: `${d.ten_khu_vuc}, ${d.tinh_thanh}`,
        count: d.so_luong_gia_su,
        ten_khu_vuc: d.ten_khu_vuc,
        tinh_thanh: d.tinh_thanh,
      }))
    }
  }));

export const getStatsTutorsBySchool = () =>
  mock.get('/top_truong_gia_su').then(r => ({
    data: {
      data: r.data.map(d => ({
        label: d.ten_truong_hoc.replace(/^Đại học /, 'ĐH '),
        count: d.so_luong_gia_su,
      }))
    }
  }));

export const getStatsSubjectsDemand = () =>
  mock.get('/top_nhu_cau_hoc').then(r => ({
    data: {
      data: r.data.map(d => ({
        label: `${d.ten_mon_hoc} – ${d.ten_lop_hoc}`,
        count: d.so_luong_nhu_cau,
      }))
    }
  }));

export const getStatsTopRating = () =>
  mock.get('/top_gia_su_xep_hang').then(r => ({
    data: {
      data: r.data.map(d => ({
        label: d.ho_ten,
        count: d.diem_trung_binh,
        ten_khu_vuc: d.ten_khu_vuc,
        ten_truong_hoc: d.ten_truong_hoc,
        so_luot_danh_gia: d.so_luot_danh_gia,
      }))
    }
  }));

export const getStatsTeachingMode = () =>
  Promise.resolve({
    data: {
      data: [
        { label: 'online',    count: 312 },
        { label: 'truc_tiep', count: 287 },
        { label: 'ca_hai',    count: 401 },
      ]
    }
  });

export const getStatsDegreeDistrib = () =>
  Promise.resolve({
    data: {
      data: [
        { label: 'Cử nhân', count: 420 },
        { label: 'Kỹ sư',   count: 195 },
        { label: 'Thạc sĩ', count: 318 },
        { label: 'Tiến sĩ', count:  67 },
      ]
    }
  });

export default api;

// ── Raw mock exports (dữ liệu gốc từ json-server, dùng trong pages mới) ──
export const getTopKhuVucGiaSu  = () => mock.get('/top_khu_vuc_gia_su').then(r => r.data)
export const getTopTruongGiaSu  = () => mock.get('/top_truong_gia_su').then(r => r.data)
export const getTopNhuCauHoc    = () => mock.get('/top_nhu_cau_hoc').then(r => r.data)
export const getTopGiaSuXepHang = () => mock.get('/top_gia_su_xep_hang').then(r => r.data)
