import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import SymptomAnalyzer from './components/SymptomAnalyzer';
import AdminRouter from './components/AdminRouter';
import { isAuthenticated } from './services/api';

function PrivateRoute({ children }) {
    const isAuth = isAuthenticated();
    console.log('PrivateRoute - isAuthenticated:', isAuth);
    return isAuth ? children : <Navigate to="/login" />;
}

function App() {
    const [authenticated, setAuthenticated] = useState(isAuthenticated());

    const handleLoginSuccess = () => {
        console.log('Login success!');
        setAuthenticated(true);
    };

    const handleLogout = () => {
        console.log('Logout');
        setAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/*" element={<AdminRouter />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <SymptomAnalyzer onLogout={handleLogout} />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;