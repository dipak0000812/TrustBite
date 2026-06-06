import api from './api';

const handleError = (err) => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    const msg = detail
      .map((d) => {
        const field = d.field 
          ? d.field.replace('body \u2192 ', '') 
          : (d.loc ? d.loc[d.loc.length - 1] : '');
        const message = d.message || d.msg || 'Invalid value';
        return field ? `${field}: ${message}` : message;
      })
      .join(', ');
    throw new Error(msg);
  }
  throw new Error(
    (typeof detail === 'string' ? detail : null) ||
    err?.response?.data?.message ||
    'Something went wrong'
  );
};

export const messService = {
  async getFeatured(limit = 6) {
    try {
      const res = await api.get('/api/messes/featured', {
        params: { limit },
      });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async getAll(params = {}) {
    try {
      const res = await api.get('/api/messes/', { params });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/api/messes/${id}`);

      if (!res.data) {
        throw new Error('Mess not found');
      }

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async getMenu(messId, mealType = null) {
    try {
      const params = mealType ? { meal_type: mealType } : {};

      const res = await api.get(`/api/messes/${messId}/menu`, {
        params,
      });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async create(data) {
    try {
      const res = await api.post('/api/messes/', data);

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/api/messes/${id}`, data);

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async delete(id) {
    try {
      const res = await api.delete(`/api/messes/${id}`);

      return res.data || { success: true };
    } catch (err) {
      handleError(err);
    }
  },

  async getOwnerMesses() {
    try {
      const res = await api.get('/api/messes/owner/mine');

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async addMenuItem(messId, data) {
    try {
      const res = await api.post(`/api/messes/${messId}/menu`, data);
      return res.data;
    } catch (err) { handleError(err); }
  },

  async updateMenuItem(messId, itemId, data) {
    try {
      const res = await api.put(`/api/messes/${messId}/menu/${itemId}`, data);
      return res.data;
    } catch (err) { handleError(err); }
  },

  async deleteMenuItem(messId, itemId) {
    try {
      await api.delete(`/api/messes/${messId}/menu/${itemId}`);
      return true;
    } catch (err) { handleError(err); }
  },

  async search(params = {}) {
    try {
      const res = await api.get('/api/search/', { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) { handleError(err); }
  },

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/messes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Convert relative path (/static/uploads/...) to absolute backend URL
      // so <img> tags resolve against the backend host, not the frontend host.
      if (res.data?.url && res.data.url.startsWith('/')) {
        res.data.url = api.defaults.baseURL + res.data.url;
      }
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },
};