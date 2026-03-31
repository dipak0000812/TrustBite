import api from './api';

export const statsService = {
  async getPlatformStats() {
    const res = await api.get('/stats/platform');
    return res.data;
  },
};
