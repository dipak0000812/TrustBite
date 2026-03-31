import api from './api';

export const reviewService = {
  async getMessReviews(messId, skip = 0, limit = 20) {
    const res = await api.get(`/messes/${messId}/reviews`, { params: { skip, limit } });
    return res.data;
  },

  async addReview(messId, data) {
    const res = await api.post(`/messes/${messId}/reviews`, data);
    return res.data;
  },

  async hasReviewed(messId) {
    const res = await api.get(`/messes/${messId}/has-reviewed`);
    return res.data.has_reviewed;
  },
};
