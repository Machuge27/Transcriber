import React, { createContext, useState, useContext, useEffect } from 'react';
// import jwtDecode from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/API';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const getSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const [theme, setTheme] = useState(getSystemTheme());

    useEffect(() => {
        // Check token validity on app load
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                if (decoded.exp > currentTime) {
                    setUser(decoded);
                } else {
                    logout();
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const handleApiError = (error) => {
        if (error.response) {
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
            return {
                success: false,
                status: null,
                message: 'No response received from server. Please check your network connection.'
            };
        } else {
            return {
                success: false,
                status: null,
                message: 'Error setting up the request'
            };
        }
    };

    const login = async (username, password) => {
        try {
            const result = await AuthService.login(username, password);
            
            if (result.success) {
                const { access } = result.data;
                localStorage.setItem('token', access);
                localStorage.setItem('refresh', access);
                
                const decoded = jwtDecode(access);
                setUser(decoded);
                setToken(access);
                
                return true;
            } else {
                console.error('Login failed:', result.message);
                return false;
            }
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Login failed:', apiError.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const register = async (username, email, password, password2) => {
        try {
            const result = await AuthService.register({ 
                username, 
                email, 
                password, 
                password2 
            });
            
            if (result.success) {
                return true;
            } else {
                console.error('Registration failed:', result.message);
                return false;
            }
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Registration failed:', apiError.message);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading, theme, setTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);




/* prompt
this fan handles the errors from login/register, relay the returned items appopriately to the caller:
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
*/