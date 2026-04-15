import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally - redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;

// ── Named service functions ─────────────────────────────────────────────────

// Resources (Module A)
export const resourceService = {
  getAll: (params) => api.get("/resources", { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post("/resources", data),
  update: (id, d) => api.put(`/resources/${id}`, d),
  setStatus: (id, s) =>
    api.patch(`/resources/${id}/status`, null, { params: { status: s } }),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Bookings (Module B)
export const bookingService = {
  getAll: () => api.get("/bookings"),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  approve: (id) => api.patch(`/bookings/${id}/approve`),
  reject: (id, r) => api.patch(`/bookings/${id}/reject`, { reason: r }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

// Tickets (Module C)
export const ticketService = {
  getAll: () => api.get("/tickets"),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  updateStatus: (id, s, n) =>
    api.patch(`/tickets/${id}/status`, { status: s, notes: n }),
  assign: (id, techId, techName) =>
    api.patch(`/tickets/${id}/assign`, {
      technicianId: techId,
      technicianName: techName,
    }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  updateComment: (tid, cid, c) =>
    api.put(`/tickets/${tid}/comments/${cid}`, { content: c }),
  deleteComment: (tid, cid) => api.delete(`/tickets/${tid}/comments/${cid}`),
};

// Notifications (Module D)
export const notificationService = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// Auth (Module E)
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, pw) =>
    api.post("/auth/register", { name, email, password: pw }),
  me: () => api.get("/auth/me"),
};
