import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
});

// API Gia sư
export const getTutors = () => api.get('/tutors');

// API Học sinh
export const getStudents = () => api.get('/students');

// API Thống kê (Dành cho Tấn Chart/Dashboard)
export const getStatsTutorsByArea = () => api.get('/stats/tutors-by-area');
export const getStatsTutorsBySchool = () => api.get('/stats/tutors-by-school');
export const getStatsSubjectsDemand = () => api.get('/stats/subjects-demand');
export const getStatsTopRating = () => api.get('/stats/top-rating');

export default api;
