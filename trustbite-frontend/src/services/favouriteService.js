import api from './api';

const handleError = (err) => {
  throw new Error(
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    'Something went wrong'
  );
};

export const favouriteService = {
  async getAll() {
    try {
      const res = await api.get('/favourites/');

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async add(messId) {
    try {
      const res = await api.post(`/favourites/${messId}`);

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async remove(messId) {
    try {
      const res = await api.delete(`/favourites/${messId}`);

      return res.data || { success: true };
    } catch (err) {
      handleError(err);
    }
  },

  async check(messId) {
    try {
      const res = await api.get(
        `/favourites/${messId}/check`
      );

      return Boolean(res.data?.is_favourited);
    } catch (err) {
      handleError(err);
    }
  },
};