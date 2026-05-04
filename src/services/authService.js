import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/auth/forgot_password", { email }),
  resetPassword: (data) => api.post("/auth/reset_password", data),
  verifyOtp: (email, otp) => api.post("/auth/verify_otp", { email, otp }),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
};

export const userService = {
  getProfile: () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return api.get(`/user/info/${user.id}`);
  },
  updateProfile: (data) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // Convert field names to match backend schema
    const backendData = {
      full_name: data.fullname || data.full_name,
      user_name: data.username || data.user_name,
      email: data.email,
      phone: data.phone,
    };
    // Remove undefined fields
    Object.keys(backendData).forEach(
      (key) => backendData[key] === undefined && delete backendData[key],
    );
    return api.put(`/user/update/${user.id}`, backendData);
  },
  changePassword: (data) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return api.put(`/user/update/${user.id}`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  },
  updateAvatar: (avatarUrl) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return api.put(`/user/update/${user.id}`, { avatar_url: avatarUrl });
  },
  updateQR: (qrUrl) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return api.put(`/user/update/${user.id}`, { qr_url: qrUrl });
  },
};

export const roomService = {
  checkCode: (roomCode) => api.get(`/rooms/check_code/${roomCode}`),
  createRoom: (data) => api.post("/rooms/create", data),
  joinRoom: (data) => api.post("/rooms/join", data),
  getAllRooms: (userId) => api.get(`/rooms/user/${userId}`),
  getRoomDetail: (roomId, period = null) => {
    const params = period ? `?period=${period}` : "";
    return api.get(`/rooms/${roomId}${params}`);
  },
  getMemberCount: async (roomId) => {
    const res = await api.get(`/rooms/${roomId}`);
    return res.data?.members?.length || 0;
  },
  updateRoom: (roomId, data) => api.put(`/rooms/update/${roomId}`, data),
  deleteRoom: (roomId) => api.delete(`/rooms/delete/${roomId}`),
  leaveRoom: (roomId) =>
    api.delete("/rooms/leave", { data: { room_id: roomId } }),
  removeUser: (data) => api.delete("/rooms/removeUser", { data }),
};

export const expenseService = {
  addExpense: (data) => api.post("/expenses", data),
  getExpenses: (roomId) => api.get(`/expenses/${roomId}`),
  getExpenseDetail: (expenseId) => api.get(`/expenses/detail/${expenseId}`),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
};

export const balanceService = {
  getBalances: (roomId) => api.get(`/balances/${roomId}`),
  settleBalance: (balanceId) => api.post(`/balances/settle/${balanceId}`),
};

export const statisticsService = {
  getRoomStats: (roomId) => api.get(`/statistics/${roomId}`),
  getUserStats: (userId) => api.get(`/statistics/user/${userId}`),
};

export const noteService = {
  getNotes: (userId) => api.get(`/notes/${userId}`),
  createNote: (userId, content) => api.post(`/notes/${userId}`, { content }),
  updateNote: (noteId, content) => api.put(`/notes/${noteId}`, { content }),
  deleteNote: (noteId) => api.delete(`/notes/${noteId}`),
};
