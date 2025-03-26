import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-900 to-black text-white p-6 overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-40" 
                style={{ 
                    backgroundImage: "url('/api/placeholder/1600/900')",
                    filter: 'blur(2px)'
                }}
            ></div>
            
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                <div className="bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl p-8">
                    <h2 className="text-center text-3xl font-extrabold text-blue-400 mb-6">
                        Sign in to Your Account
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="text-red-400 text-center mb-4 bg-red-900 bg-opacity-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Sign In
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <Link 
                                to="/register" 
                                className="text-green-400 hover:text-green-300 transition-colors duration-300"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;