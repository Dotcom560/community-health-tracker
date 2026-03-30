import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://Almytehub.pythonanywhere.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh: refreshToken,
                });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('is_admin');
                localStorage.removeItem('admin_login_time');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// ========== AUTHENTICATION FUNCTIONS ==========

// Login function
export const login = async (username, password) => {
    try {
        const response = await api.post('/token/', { username, password });
        console.log('Login response:', response.data);
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Set admin for Dotcom
        if (username === 'Dotcom') {
            localStorage.setItem('is_admin', 'true');
            localStorage.setItem('admin_login_time', Date.now().toString());
        }
        
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Invalid username or password';
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
            if (error.response.status === 401) {
                errorMessage = 'Invalid username or password';
            } else if (error.response.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }
        } else if (error.request) {
            errorMessage = 'Cannot connect to server. Check your internet.';
        }
        return { success: false, error: errorMessage };
    }
};


// Analyze symptoms function
export const analyzeSymptoms = async (symptomsData) => {
    try {
        const response = await api.post('/analyze/', symptomsData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Analysis failed. Please try again.' };
    }
};

// Logout function
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_username');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

// Check if user is admin
export const isAdmin = () => {
    const adminStatus = localStorage.getItem('is_admin');
    const adminLoginTime = localStorage.getItem('admin_login_time');
    
    if (!adminStatus || adminStatus !== 'true') return false;
    
    // Check if session is still valid (24 hours)
    if (adminLoginTime) {
        const loginTime = parseInt(adminLoginTime);
        const currentTime = Date.now();
        const hoursSinceLogin = (currentTime - loginTime) / (1000 * 60 * 60);
        if (hoursSinceLogin >= 24) {
            // Session expired
            logout();
            return false;
        }
    }
    
    return true;
};

// Get current user info
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/user/');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to get user info' };
    }
};

// ========== ADMIN FUNCTIONS ==========

// Get admin dashboard statistics
export const getAdminStats = async () => {
    try {
        const response = await api.get('/admin/stats/');
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, error: 'Admin access required' };
        }
        return { success: false, error: 'Failed to fetch statistics' };
    }
};

// Get all users (admin only)
export const getAdminUsers = async () => {
    try {
        const response = await api.get('/admin/users/');
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, error: 'Admin access required' };
        }
        return { success: false, error: 'Failed to fetch users' };
    }
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
    try {
        const response = await api.post(`/admin/users/${userId}/role/`, { role });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, error: 'Admin access required' };
        }
        return { success: false, error: 'Failed to update user role' };
    }
};

// Get user reports (admin only)
export const getUserReports = async (userId = null) => {
    try {
        const url = userId ? `/admin/users/${userId}/reports/` : '/admin/reports/';
        const response = await api.get(url);
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, error: 'Admin access required' };
        }
        return { success: false, error: 'Failed to fetch reports' };
    }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}/`);
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, error: 'Admin access required' };
        }
        return { success: false, error: 'Failed to delete user' };
    }
};

// Get system health check
export const getSystemHealth = async () => {
    try {
        const response = await api.get('/health/');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Health check failed' };
    }
};

// ========== USER PROFILE FUNCTIONS ==========

// Get user profile
export const getUserProfile = async () => {
    try {
        const response = await api.get('/profile/');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch profile' };
    }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.put('/profile/', profileData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to update profile' };
    }
};

// Get user history
export const getUserHistory = async () => {
    try {
        const response = await api.get('/history/');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch history' };
    }
};

// Delete history entry
export const deleteHistoryEntry = async (entryId) => {
    try {
        const response = await api.delete(`/history/${entryId}/`);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to delete history entry' };
    }
};

// ========== MEDICATION FUNCTIONS ==========

// Get medications for a condition
export const getMedications = async (condition) => {
    try {
        const response = await api.post('/medications/', { condition });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch medications' };
    }
};

// Search medications
export const searchMedications = async (query) => {
    try {
        const response = await api.get(`/medications/search/?q=${encodeURIComponent(query)}`);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: 'Failed to search medications' };
    }
};

// ========== UTILITY FUNCTIONS ==========

// Refresh token
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        return { success: true, data: response.data };
    } catch (error) {
        logout();
        return { success: false, error: 'Token refresh failed' };
    }
};

// Check server status
export const checkServerStatus = async () => {
    try {
        const response = await api.get('/');
        return { success: true, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default api;
