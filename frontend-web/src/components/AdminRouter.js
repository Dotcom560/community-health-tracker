import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function AdminRouter() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
        // Check if admin is already logged in
        const adminStatus = localStorage.getItem('is_admin') === 'true';
        const adminLoginTime = localStorage.getItem('admin_login_time');
        
        if (adminStatus && adminLoginTime) {
            const loginTime = parseInt(adminLoginTime);
            const hoursSinceLogin = (Date.now() - loginTime) / (1000 * 60 * 60);
            if (hoursSinceLogin < 24) {
                return true;
            }
        }
        return false;
    });

    const handleAdminLoginSuccess = () => {
        setIsAdminAuthenticated(true);
    };

    // If not authenticated, show admin login
    if (!isAdminAuthenticated) {
        return <AdminLogin onAdminLoginSuccess={handleAdminLoginSuccess} />;
    }

    // If authenticated, show dashboard
    return <AdminDashboard />;
}

export default AdminRouter;