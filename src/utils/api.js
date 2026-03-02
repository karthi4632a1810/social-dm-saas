const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get backend base URL (without /api)
export const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

// Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Remove /server prefix if present
  const cleanPath = imagePath.startsWith('/server') ? imagePath.replace('/server', '') : imagePath;
  // Ensure path starts with /
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${getBackendUrl()}${finalPath}`;
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
  try {
    const token = getToken();

    const headers = {
      ...options.headers
    };

    // Only set JSON header if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};


// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'P.M' : 'A.M';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${day} ${month}, ${displayHours}:${displayMinutes} ${ampm}`;
};
export const formatMonthYear = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date; // difference in milliseconds

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day ago`;

  // Fallback to normal date if it's old
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
// API functions for Authentication
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success && data.data.token) {
      setToken(data.data.token);
      setUser(data.data.user);
    }
    return data;
  },
  register: async (name, email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await response.json();
    if (data.success && data.data.token) {
      setToken(data.data.token);
      setUser(data.data.user);
    }
    return data;
  },
  updateProfile: async (payload) => {
    // payload example: { name, email, phone, password }
    const response = await authFetch(`${API_BASE_URL}/auth/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // If backend returns updated user, keep localStorage in sync
    if (data.success && data.data?.user) {
      setUser(data.data.user);
    }
    return data;
  },
  uploadAvatar: async (formData) => {
    const res = await authFetch(`${API_BASE_URL}/auth/avatar`, {
      method: "PUT",
      body: formData
    });
    return res.json();
  },
  getCurrentUser: async () => {
    const response = await authFetch(`${API_BASE_URL}/auth/me`);
    return response.json();
  },
  logout: () => {
    removeToken();
  }
};

// API functions for Links
export const linkAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await authFetch(`${API_BASE_URL}/links?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching links:', error);
      return { success: false, message: 'Failed to fetch links', data: [] };
    }
  },
  getAllByDate: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_BASE_URL}/links//all/by-date?${queryString}`);
    return response.json();
  },
  getById: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_BASE_URL}/links/${id}?${queryString}`);
    return response.json();
  },
  create: async (data) => {
    const response = await authFetch(`${API_BASE_URL}/links`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  update: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/links/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  incrementClick: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/links/${id}/click`, {
      method: 'POST'
    });
    return response.json();
  },
  incrementView: async (id) => {
    const response = await fetch(`${API_BASE_URL}/links/${id}/view`, {
      method: 'POST'
    });
    return response.json();
  },
  incrementVisitor: async (id, visitorId) => {
    const response = await fetch(`${API_BASE_URL}/links/${id}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId })
    });
    return response.json();
  },
  getBySlug: async (slug) => {
    try {
      // Public endpoint for redirects - no auth required
      const response = await fetch(`${API_BASE_URL}/links/public/slug/${slug}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching link by slug:', error);
      return { success: false, message: 'Failed to fetch link' };
    }
  },
};

// API functions for Leads
export const leadAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await authFetch(`${API_BASE_URL}/leads?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { success: false, message: 'Failed to fetch leads', data: [] };
    }
  },
  getById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/leads/${id}`);
    return response.json();
  },
  create: async (data) => {
    const response = await authFetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  createPublic: async (data) => {
    try {
      // Public endpoint for form submissions - no auth required
      console.log('ss')
      const response = await fetch(`${API_BASE_URL}/leads/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating lead:', error);
      return { success: false, message: 'Failed to create lead' };
    }
  },
  update: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  bulkDelete: async (ids) => {
    const response = await authFetch(`${API_BASE_URL}/leads/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    return response.json();
  }
};

// API functions for Forms
export const formAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await authFetch(`${API_BASE_URL}/forms?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching forms:', error);
      return { success: false, message: 'Failed to fetch forms', data: [] };
    }
  },
  getById: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching form:', error);
      return { success: false, message: 'Failed to fetch form' };
    }
  },
  create: async (data) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating form:', error);
      return { success: false, message: 'Failed to create form' };
    }
  },
  update: async (id, data) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating form:', error);
      return { success: false, message: 'Failed to update form' };
    }
  },
  delete: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting form:', error);
      return { success: false, message: 'Failed to delete form' };
    }
  },
  restore: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms/${id}/restore`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Error restoring form:', error);
      return { success: false, message: 'Failed to restore form' };
    }
  },
  permanentDelete: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/forms/${id}/permanent`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error permanently deleting form:', error);
      return { success: false, message: 'Failed to permanently delete form' };
    }
  }
};

// API functions for Analytics
export const analyticsAPI = {
  getStats: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, message: 'Failed to fetch stats', data: { totalClicks: 0, totalLeads: 0, totalLinks: 0, totalChats: 0 } };
    }
  },
  getStatsAll: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/stats/by-date`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, message: 'Failed to fetch stats', data: [] };
    }
  },
  getPlatforms: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/platforms`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching platforms:', error);
      return { success: false, message: 'Failed to fetch platforms', data: [] };
    }
  },
  getWeekly: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/weekly`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      return { success: false, message: 'Failed to fetch weekly data', data: [] };
    }
  },
  getMonthly: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/monthly`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      return { success: false, message: 'Failed to fetch monthly data', data: [] };
    }
  },
  getStatsOverview: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/stats/overview`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return { success: false, message: 'Failed to fetch overview data', data: [] };
    }
  },
  getClicksLeads: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await authFetch(`${API_BASE_URL}/analytics/clicks-leads?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching clicks/leads data:', error);
      return { success: false, message: 'Failed to fetch clicks/leads data', data: { clicks: [], leads: [] } };
    }
  },
  getPageViews: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/analytics/page-views`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching page views:', error);
      return { success: false, message: 'Failed to fetch page views', data: [] };
    }
  }
};


// API notification
export const notificationAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_BASE_URL}/notifications?${queryString}`);
    return response.json();
  },

  markAsRead: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return response.json();
  },

  markAllAsRead: async () => {
    const response = await authFetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT"
    });
    return response.json();
  },

  getUnreadCount: async () => {
    const response = await authFetch(`${API_BASE_URL}/notifications/unread/count`);
    return response.json();
  }
};

// API functions for Contact Cards
export const contactCardAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await authFetch(`${API_BASE_URL}/contact-cards?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching contact cards:", error);
      return { success: false, message: "Failed to fetch contact cards", data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards/${id}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching contact card:", error);
      return { success: false, message: "Failed to fetch contact card" };
    }
  },

  create: async (data) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating contact card:", error);
      return { success: false, message: "Failed to create contact card" };
    }
  },

  update: async (id, data) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating contact card:", error);
      return { success: false, message: "Failed to update contact card" };
    }
  },

  incrementView: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contact-cards/${id}/view`, {
      method: 'POST'
    });
    return response.json();
  },

  incrementVisitor: async (id, visitorId) => {
    const response = await fetch(`${API_BASE_URL}/contact-cards/${id}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId })
    });
    return response.json();
  },
  track: async (id, visitorId) => {
    const response = await fetch(`${API_BASE_URL}/contact-cards/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId })
    });
    return response.json();
  },
  uploadAvatar: async (id, formData) => {
    const res = await authFetch(
      `${API_BASE_URL}/contact-cards/${id}/avatar`,
      {
        method: "PUT",
        body: formData
      }
    );
    return res.json();
  },
  delete: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards/${id}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting contact card:", error);
      return { success: false, message: "Failed to delete contact card" };
    }
  },

  restore: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards/${id}/restore`, {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      console.error("Error restoring contact card:", error);
      return { success: false, message: "Failed to restore contact card" };
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contact-cards/${id}/permanent`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("Error permanently deleting contact card:", error);
      return { success: false, message: "Failed to permanently delete contact card" };
    }
  },
};