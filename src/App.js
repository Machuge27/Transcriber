import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate 
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import TranscriptionDashboard from './components/TranscriptionDashboard'; // New import
import HomePage from './pages/Home';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <TranscriptionDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/home" replace />}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;