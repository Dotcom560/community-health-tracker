import React, { useState, useEffect } from 'react';
import { login } from '../services/api';

// Admin credentials from environment variables (for production)
// For development, fallback to hardcoded values
const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@healthtracker.com';

function AdminAuth({ children, onUnauthorized, onLoginSuccess }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // Check if user is already logged in as admin
    useEffect(() => {
        const checkAdminStatus = () => {
            const token = localStorage.getItem('access_token');
            const adminStatus = localStorage.getItem('is_admin');
            const adminLoginTime = localStorage.getItem('admin_login_time');
            
            // Check if admin session is still valid (24 hours)
            const isValidSession = () => {
                if (!adminLoginTime) return false;
                const loginTime = parseInt(adminLoginTime);
                const currentTime = Date.now();
                const hoursSinceLogin = (currentTime - loginTime) / (1000 * 60 * 60);
                return hoursSinceLogin < 24; // Session expires after 24 hours
            };
            
            if (token && adminStatus === 'true' && isValidSession()) {
                setIsAdmin(true);
            } else if (token) {
                // User is logged in but not admin
                setShowLogin(true);
                setError('Admin access required. Please enter admin credentials.');
            } else {
                setShowLogin(true);
            }
            setLoading(false);
        };
        
        checkAdminStatus();
    }, []);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        
        // Check if account is locked due to too many failed attempts
        if (isLocked) {
            setError('Too many failed attempts. Please try again later.');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            // First, try to authenticate with the backend
            // This assumes your backend has an admin verification endpoint
            // For now, we'll use hardcoded check with environment variables
            
            // Option 1: Backend verification (recommended for production)
            // const result = await login(username, password);
            // if (result.success) {
            //     // Check if user has admin role from backend
            //     const userRole = localStorage.getItem('user_role');
            //     if (userRole === 'admin') {
            //         authenticateAdmin();
            //     } else {
            //         setError('Admin privileges required.');
            //     }
            // } else {
            //     setError('Invalid credentials');
            // }
            
            // Option 2: Simple environment-based check (for development)
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                authenticateAdmin();
            } else {
                // Increment failed login attempts
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                
                if (newAttempts >= 5) {
                    setIsLocked(true);
                    setError('Too many failed attempts. Account locked for 15 minutes.');
                    // Auto-unlock after 15 minutes
                    setTimeout(() => {
                        setIsLocked(false);
                        setLoginAttempts(0);
                    }, 15 * 60 * 1000);
                } else {
                    setError(`Invalid admin credentials. ${5 - newAttempts} attempts remaining.`);
                }
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error('Admin login error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const authenticateAdmin = () => {
        // Set admin status
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        localStorage.setItem('admin_username', username);
        
        // Set a regular token for API calls
        // In production, this should come from the backend
        const adminToken = 'admin-token-' + Date.now() + '-' + Math.random().toString(36);
        localStorage.setItem('access_token', adminToken);
        
        setIsAdmin(true);
        setShowLogin(false);
        setLoginAttempts(0);
        
        // Call success callback if provided
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    };
    
    const handleLogout = () => {
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('access_token');
    setIsAdmin(false);
    setShowLogin(true);
    
    // Call unauthorized callback if provided
    if (onUnauthorized) {
        onUnauthorized();
    }
    
    // Redirect to home
    window.location.href = '/';
};
    
    // Show loading spinner while checking admin status
    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Verifying admin access...</p>
            </div>
        );
    }
    
    // Show admin login form if not authenticated
    if (!isAdmin && showLogin) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🔐</div>
                    <h2 style={styles.title}>Admin Access Required</h2>
                    <p style={styles.subtitle}>Please enter admin credentials to continue</p>
                    
                    {error && <div style={styles.error}>{error}</div>}
                    
                    <form onSubmit={handleAdminLogin}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Admin Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter admin username"
                                required
                                disabled={isLocked}
                                style={styles.input}
                                autoFocus
                            />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Admin Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                                disabled={isLocked}
                                style={styles.input}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading || isLocked} 
                            style={styles.button}
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                    
                    <div style={styles.note}>
                        <p><strong>Demo Admin Credentials:</strong></p>
                        <p>Username: <code>admin</code></p>
                        <p>Password: <code>admin123</code></p>
                        <p style={styles.warning}>⚠️ Change these credentials in production!</p>
                    </div>
                    
                    <div style={styles.help}>
                        <button onClick={() => window.location.href = '/'} style={styles.helpButton}>
                            ← Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Admin is authenticated, render the dashboard with logout option
    return (
        <div>
            {/* Optional: Admin header with logout */}
            <div style={styles.adminHeader}>
                <div style={styles.adminInfo}>
                    <span style={styles.adminIcon}>👑</span>
                    <span>Admin: {localStorage.getItem('admin_username') || 'Administrator'}</span>
                </div>
                <button onClick={handleLogout} style={styles.adminLogoutBtn}>
                    Logout
                </button>
            </div>
            {children}
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    icon: {
        fontSize: '48px',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '0.5rem',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '1.5rem',
        fontSize: '14px',
    },
    inputGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '0.5rem',
        transition: 'background-color 0.2s',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    note: {
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#e9ecef',
        borderRadius: '6px',
        fontSize: '12px',
        textAlign: 'center',
    },
    warning: {
        color: '#dc3545',
        marginTop: '0.5rem',
        fontSize: '11px',
    },
    help: {
        marginTop: '1rem',
        textAlign: 'center',
    },
    helpButton: {
        background: 'none',
        border: 'none',
        color: '#17a2b8',
        cursor: 'pointer',
        fontSize: '14px',
        textDecoration: 'underline',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #17a2b8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px',
    },
    adminHeader: {
        backgroundColor: '#17a2b8',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
    },
    adminInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    adminIcon: {
        fontSize: '18px',
    },
    adminLogoutBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.2s',
    },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    input:focus {
        outline: none;
        border-color: #17a2b8;
    }
    
    button:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(styleSheet);

export default AdminAuth;