import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const resourceService = {
  // Get all resources (with filters)
  getAll: (params) => 
    api.get('/resources', { params }),

  // Get single resource
  getById: (id) => 
    api.get(`/resources/${id}`),

  // Create resource (ADMIN)
  create: (data) => 
    api.post('/resources', data),

  // ✏️ Update full resource (ADMIN)
  update: (id, data) => 
    api.put(`/resources/${id}`, data),

  // Update status (ADMIN)
  setStatus: (id, status) => 
    api.patch(`/resources/${id}/status`, null, {
      params: { status }
    }),

  // Upload images (max 5 images, 5MB each) (multipart) (ADMIN)
  uploadImages: (id, files) => {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return api.post(`/resources/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete single image (ADMIN)
  deleteImage: (id, imageUrl) => 
    api.delete(`/resources/${id}/images`, {
      params: { imageUrl }
    }),

  // Delete resource (ADMIN)
  delete: (id) => 
    api.delete(`/resources/${id}`),

  // Get QR code (returns image)
  getQR: (id) => 
    api.get(`/resources/${id}/qr`, {
      responseType: 'blob' // IMPORTANT
    }),
};

export const bookingService = {
  getAll:   (params) => api.get('/bookings', { params }),
  getById:  (id)     => api.get(`/bookings/${id}`),
  create:   (data)   => api.post('/bookings', data),
  approve:  (id)     => api.patch(`/bookings/${id}/approve`),
  reject:   (id, r)  => api.patch(`/bookings/${id}/reject`, { reason: r }),
  cancel:   (id)     => api.patch(`/bookings/${id}/cancel`),
}

export const ticketService = {
  getAll:        ()            => api.get('/tickets'),
  getById:       (id)          => api.get(`/tickets/${id}`),
  create:        (data)        => api.post('/tickets', data),
  updateStatus:  (id, s, n)    => api.patch(`/tickets/${id}/status`, { status: s, notes: n }),
  assign:        (id, tId, tN) => api.patch(`/tickets/${id}/assign`, { technicianId: tId, technicianName: tN }),
  getComments:   (id)          => api.get(`/tickets/${id}/comments`),
  addComment:    (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  updateComment: (tid, cid, c) => api.put(`/tickets/${tid}/comments/${cid}`, { content: c }),
  deleteComment: (tid, cid)    => api.delete(`/tickets/${tid}/comments/${cid}`),
}

export const notificationService = {
  getAll:         ()   => api.get('/notifications'),
  getUnreadCount: ()   => api.get('/notifications/unread-count'),
  markRead:       (id) => api.patch(`/notifications/${id}/read`),
  markAllRead:    ()   => api.patch('/notifications/read-all'),
}

export const authService = {
  login:    (email, pw) => api.post('/auth/login', { email, password: pw }),
  register: (name, email, pw) => api.post('/auth/register', { name, email, password: pw }),
  me:       ()          => api.get('/auth/me'),
}
