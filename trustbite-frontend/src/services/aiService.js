import api from './api';

export const aiService = {
  async getSuggestions(params = {}) {
    const res = await api.get('/api/ai/suggestions', { params });
    return res.data;
  },
};
