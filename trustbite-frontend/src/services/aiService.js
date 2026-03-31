import api from './api';

export const aiService = {
  async getSuggestions(params = {}) {
    const res = await api.get('/ai/suggestions', { params });
    return res.data;
  },
};
