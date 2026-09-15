import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

export const resumeAPI = {
  uploadResume: (formData) =>
    API.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getResumes: () => API.get("/resumes"),
  getResumeById: (id) => API.get(`/resumes/${id}`),
  deleteResume: (id) => API.delete(`/resumes/${id}`),
  setPrimaryResume: (id) => API.put(`/resumes/${id}/primary`),
};

export const jobAPI = {
  getJobs: (params) => API.get("/jobs", { params }),
  getJobById: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post("/jobs", data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
};

export const matchAPI = {
  evaluateMatch: (resumeId, jobId) =>
    API.get(`/match/evaluate/resume/${resumeId}/job/${jobId}`),
  getRecommendations: (params) => API.get("/match/recommendations", { params }),
  applyForJob: (data) => API.post("/match/apply", data),
  getUserApplications: () => API.get("/match/applications"),
};

export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  getUsers: () => API.get("/admin/users"),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getApplications: () => API.get("/admin/applications"),
  updateApplicationStatus: (id, status) =>
    API.put(`/admin/applications/${id}/status`, { status }),
};

export default API;
