import axios from 'axios';

// Base URL for your API
// https://hillarymutai.pythonanywhere.com/
// https://transcriber-backend-l6tb.onrender.com/
// const BASE_URL = 'https://transcriber-backend-l6tb.onrender.com/api/';
const BASE_URL = 'https://hillarymutai.pythonanywhere.com/api/';
// const BASE_URL = 'http://192.168.100.6:8000/api';
// const BASE_URL = 'http://192.168.0.115:8000/api';

// Create an axios instance with default configuratio
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handling utility
const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        const errorMessage = 
            errorData.detail || 
            errorData.error || 
            (Array.isArray(errorData) ? errorData.join(' ') : Object.values(errorData)[0]) || 
            'An unexpected error occurred';
        
        return {
            success: false,
            status: error.response.status,
            message: errorMessage
        };
    } else if (error.request) {
        // The request was made but no response was received
        return {
            success: false,
            status: null,
            message: 'No response received from server. Please check your network connection.'
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        return {
            success: false,
            status: null,
            message: 'Error setting up the request'
        };
    }
};

// Authentication related API calls
export const AuthService = {
    login: async (username, password) => {
        try {
            const response = await api.post('/token/', { username, password });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    register: async (userData) => {
        try {
            console.log(userData)
            const response = await api.post('/accounts/register/', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    }
};

const refreshAccessToken = async () => {
    try {
        const response = await api.post('/token/refresh/', { refresh: localStorage.getItem('refresh') });
        return response.data.access;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

// Transcription related API calls
export const TranscriptionService = {
    uploadAudio: async (formData, token) => {
        try {
            const response = await api.post('/transcription/transcribe/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    getTranscriptionHistory: async (token) => {
        try {
            const response = await api.get('/transcription/history/', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    getTranscriptionProgress: async (token) => {
        try {
            const response = await api.get('/transcription/progress/', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// Interceptor to handle token expiration and refresh (optional, depends on your backend)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if the error status is 401 and there is no originalRequest._retry flag
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Logic for token refresh would go here
            // This is a placeholder and should be implemented based on your backend
            // For example:
            try {
                const newToken = await refreshAccessToken();
                api.defaults.headres.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Logout user if refresh fails
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;