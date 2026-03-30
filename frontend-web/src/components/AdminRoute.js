import React from 'react';

function AdminRoute({ children }) {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (!token || !isAdmin) {
        // Not authorized, show access denied
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🚫</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                    <button onClick={() => window.location.href = '/'} style={styles.button}>
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }
    
    // Authorized, render the dashboard
    return children;
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    card: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '1rem',
    },
    button: {
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default AdminRoute;