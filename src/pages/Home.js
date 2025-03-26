import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-900 to-black text-white p-6 overflow-hidden">
            {/* Background Image Placeholder */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-40" 
                style={{ 
                    backgroundImage: "url('/path-to-placeholder-home-bg.jpg')",
                    filter: 'blur(2px)'
                }}
            ></div>
            
            {/* Hero Section with Animated Mic */}
            <div className="relative z-10 text-center max-w-2xl animate-fade-in">
                <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-lg">
                    Audio Transcription App
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    Your personal speech-to-text companion. Upload audio files and get accurate transcriptions instantly!
                </p>
                {/* Animated Microphone */}
                <div className="flex justify-center mt-4">
                    <img src="/path-to-animated-mic.gif" alt="Animated Microphone" className="w-16 h-16 animate-bounce" />
                </div>
            </div>
            
            {/* Image Placeholder for How It Works */}
            <img src="/path-to-how-it-works.jpg" alt="How It Works" className="w-2/3 mt-6 rounded-lg shadow-lg" />

            {/* Buttons */}
            <div className="relative z-10 mt-8 flex gap-6 animate-slide-up">
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                    Login
                </button>
                <button 
                    onClick={() => navigate('/register')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                    Register
                </button>
            </div>

            {/* How to Use Section */}
            <div className="relative z-10 mt-12 max-w-3xl text-gray-300 text-center">
                <h2 className="text-3xl font-bold text-white">How to Use the App</h2>
                <ul className="mt-4 space-y-4">
                    <li><strong>1. Create Your Account:</strong> Register with your email and password.</li>
                    <li><strong>2. Log In:</strong> Access your personal dashboard.</li>
                    <li><strong>3. Upload and Transcribe:</strong> Upload an audio file and get an instant transcript.</li>
                    <li><strong>4. View History:</strong> Access your past transcriptions anytime.</li>
                </ul>
            </div>

            {/* Placeholder for Transcription History UI */}
            <img src="/path-to-transcription-history.jpg" alt="Transcription History" className="w-2/3 mt-6 rounded-lg shadow-lg" />

            {/* Privacy Section */}
            <div className="relative z-10 mt-12 text-center max-w-2xl">
                <h2 className="text-2xl font-semibold text-white">Privacy First</h2>
                <p className="mt-2 text-gray-300">Your transcriptions are private and only accessible to you.</p>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-10 text-gray-400 text-sm">
                © {new Date().getFullYear()} AI Transcriber. All Rights Reserved.
            </div>

            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                .animate-slide-up {
                    animation: slideUp 1s ease-out 0.5s forwards;
                    opacity: 0;
                }
                .animate-bounce {
                    animation: bounce 1s infinite alternate;
                }
                @keyframes bounce {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
