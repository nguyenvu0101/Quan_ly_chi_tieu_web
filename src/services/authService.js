import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot_password', { email }),
  resetPassword: (data) => api.post('/auth/reset_password', data),
  verifyOtp: (email, otp) => api.post('/auth/verify_otp', { email, otp }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
}

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
}

export const roomService = {
  checkCode: (roomCode) => api.get(`/rooms/check_code/${roomCode}`),
  createRoom: (data) => api.post('/rooms/create', data),
  joinRoom: (data) => api.post('/rooms/join', data),
  getAllRooms: (userId) => api.get(`/rooms/user/${userId}`),
  getRoomDetail: (roomId, period = null) => {
    const params = period ? `?period=${period}` : ''
    return api.get(`/rooms/${roomId}${params}`)
  },
  getMemberCount: async (roomId) => {
    const res = await api.get(`/rooms/${roomId}`)
    return res.data?.members?.length || 0
  },
  updateRoom: (roomId, data) => api.put(`/rooms/update/${roomId}`, data),
  deleteRoom: (roomId) => api.delete(`/rooms/delete/${roomId}`),
  leaveRoom: (roomId) => api.delete('/rooms/leave', { data: { room_id: roomId } }),
  removeUser: (data) => api.delete('/rooms/removeUser', { data }),
}

export const expenseService = {
  addExpense: (data) => api.post('/expenses', data),
  getExpenses: (roomId) => api.get(`/expenses/${roomId}`),
  getExpenseDetail: (expenseId) => api.get(`/expenses/detail/${expenseId}`),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
}

export const balanceService = {
  getBalances: (roomId) => api.get(`/balances/${roomId}`),
  settleBalance: (balanceId) => api.post(`/balances/settle/${balanceId}`),
}

export const statisticsService = {
  getRoomStats: (roomId) => api.get(`/statistics/${roomId}`),
  getUserStats: (userId) => api.get(`/statistics/user/${userId}`),
}
