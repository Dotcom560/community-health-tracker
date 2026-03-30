import React, { useState } from 'react';
import { login } from '../services/api';

function AdminLogin({ onAdminLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Admin credentials (in production, this should come from backend)
    // For now, we'll check if the user is "admin" (you can change this)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123'; // Change this to a strong password

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set admin status
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        localStorage.setItem('admin_username', username);
        
        // Set a fake token for admin
        const adminToken = 'admin-token-' + Date.now();
        localStorage.setItem('access_token', adminToken);
        
        // Call success callback
        onAdminLoginSuccess();
    } else {
        setError('Invalid admin credentials');
    }
    setLoading(false);
};

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.adminIcon}>🔐</div>
                <h2 style={styles.title}>Admin Login</h2>
                <p style={styles.subtitle}>Secure access to admin dashboard</p>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Admin Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            required
                            style={styles.input}
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
                            style={styles.input}
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
                
                <div style={styles.demoNote}>
                    <p>Demo Admin Credentials:</p>
                    <p><strong>Username:</strong> admin</p>
                    <p><strong>Password:</strong> admin123</p>
                    <p style={styles.warning}>⚠️ Change these credentials in production!</p>
                </div>
            </div>
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
    adminIcon: {
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
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    demoNote: {
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
};

export default AdminLogin;