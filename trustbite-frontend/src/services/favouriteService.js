import api from './api';

export const favouriteService = {
  async getAll() {
    const res = await api.get('/favourites/');
    return res.data;
  },

  async add(messId) {
    const res = await api.post(`/favourites/${messId}`);
    return res.data;
  },

  async remove(messId) {
    await api.delete(`/favourites/${messId}`);
  },

  async check(messId) {
    const res = await api.get(`/favourites/${messId}/check`);
    return res.data.is_favourited;
  },
};
