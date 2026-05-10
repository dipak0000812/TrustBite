import api from './api';

const handleError = (err) => {
  throw new Error(
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    'Something went wrong'
  );
};

export const reviewService = {
  async getMessReviews(messId, skip = 0, limit = 20) {
    try {
      const res = await api.get(`/api/messes/${messId}/reviews`, {
        params: { skip, limit },
      });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async addReview(messId, data) {
    try {
      if (!data?.rating || !data?.comment?.trim()) {
        throw new Error('Review data is incomplete');
      }

      const payload = {
        rating: Number(data.rating),
        hygiene_rating: Number(data.hygiene_rating || 5),
        comment: data.comment?.trim() || null,
      };

      const res = await api.post(
        `/api/messes/${messId}/reviews`,
        payload
      );

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async hasReviewed(messId) {
    try {
      const res = await api.get(
        `/api/messes/${messId}/has-reviewed`
      );

      return Boolean(res.data?.has_reviewed);
    } catch (err) {
      handleError(err);
    }
  },
};