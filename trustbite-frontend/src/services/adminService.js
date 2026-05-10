import api from './api';

const handleError = (err) => {
  throw new Error(
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    'Admin operation failed'
  );
};

export const adminService = {
  // ── Stats ────────────────────────────────────────────────────────
  async getAdminStats() {
    try {
      const res = await api.get('/api/admin/stats');
      return res.data;
    } catch (err) { handleError(err); }
  },

  // ── Mess Management ──────────────────────────────────────────────
  async getAllMesses() {
    try {
      const res = await api.get('/api/admin/messes');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) { handleError(err); }
  },

  async getPendingMesses() {
    try {
      const res = await api.get('/api/admin/messes/pending');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) { handleError(err); }
  },

  async approveMess(messId, isActive) {
    try {
      const res = await api.patch(`/api/admin/messes/${messId}/approve`, { is_active: isActive });
      return res.data;
    } catch (err) { handleError(err); }
  },

  async setHygieneScore(messId, payload) {
    try {
      const res = await api.patch(`/api/admin/messes/${messId}/hygiene`, payload);
      return res.data;
    } catch (err) { handleError(err); }
  },

  // ── User Management ──────────────────────────────────────────────
  async getAllUsers() {
    try {
      const res = await api.get('/api/admin/users');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) { handleError(err); }
  },

  async deactivateUser(userId) {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      return true;
    } catch (err) { handleError(err); }
  },

  async reactivateUser(userId) {
    try {
      const res = await api.patch(`/api/admin/users/${userId}/reactivate`);
      return res.data;
    } catch (err) { handleError(err); }
  },

  // ── Review Moderation ────────────────────────────────────────────
  async deactivateReview(reviewId) {
    try {
      const res = await api.patch(`/api/admin/reviews/${reviewId}/deactivate`);
      return res.data;
    } catch (err) { handleError(err); }
  },
};
