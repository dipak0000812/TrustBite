import api from './api';

export const statsService = {
  async getPlatformStats() {
    const res = await api.get('/api/stats/platform');
    return res.data;
  },
};
