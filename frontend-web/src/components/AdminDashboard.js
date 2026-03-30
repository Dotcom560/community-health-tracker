import React, { useState, useEffect } from 'react';
import { logout, getAdminStats, getAdminUsers, updateUserRole } from '../services/api';
import AdminAuth from './AdminAuth';

function AdminDashboardContent() {
    const [stats, setStats] = useState({
        total_users: 0,
        total_reports: 0,
        emergency_count: 0,
        urgent_count: 0,
        non_urgent_count: 0,
        recent_reports: [],
        top_symptoms: []
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [updatingRole, setUpdatingRole] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        
        // Fetch statistics
        const statsResult = await getAdminStats();
        if (statsResult.success) {
            setStats(statsResult.data);
        } else {
            setError(statsResult.error || 'Failed to load statistics');
        }
        
        // Fetch users list
        const usersResult = await getAdminUsers();
        if (usersResult.success) {
            setUsers(usersResult.data.users || []);
        }
        
        setLoading(false);
    };

    const handleRoleUpdate = async (userId, newRole) => {
        setUpdatingRole(userId);
        const result = await updateUserRole(userId, newRole);
        
        if (result.success) {
            // Update local users list
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
            // Show success message (could use a toast notification)
            alert('✅ User role updated successfully');
        } else {
            alert('❌ Error: ' + result.error);
        }
        setUpdatingRole(null);
    };

    const handleLogout = () => {
    // Clear all admin-related storage
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Force a clean redirect to main login
    window.location.href = '/';
};

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error && !stats.total_users) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>⚠️</div>
                <h3>Error Loading Dashboard</h3>
                <p>{error}</p>
                <button onClick={fetchDashboardData} style={styles.retryBtn}>Try Again</button>
                <button onClick={handleLogout} style={styles.backBtn}>Back to Home</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>📊 Admin Dashboard</h2>
                <div style={styles.headerActions}>
                    <button onClick={fetchDashboardData} style={styles.refreshBtn} title="Refresh data">
                        🔄 Refresh
                    </button>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>
            
            {/* Tab Navigation */}
            <div style={styles.tabs}>
                <button 
                    onClick={() => setActiveTab('overview')}
                    style={{...styles.tab, ...(activeTab === 'overview' && styles.activeTab)}}
                >
                    📈 Overview
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    style={{...styles.tab, ...(activeTab === 'users' && styles.activeTab)}}
                >
                    👥 Users ({users.length})
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{...styles.tab, ...(activeTab === 'reports' && styles.activeTab)}}
                >
                    📋 Reports ({stats.total_reports})
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    style={{...styles.tab, ...(activeTab === 'analytics' && styles.activeTab)}}
                >
                    📊 Analytics
                </button>
            </div>
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>👥</div>
                            <div>
                                <h3>Total Users</h3>
                                <p style={styles.statNumber}>{stats.total_users}</p>
                            </div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📋</div>
                            <div>
                                <h3>Total Reports</h3>
                                <p style={styles.statNumber}>{stats.total_reports}</p>
                            </div>
                        </div>
                        <div style={{...styles.statCard, backgroundColor: '#dc3545'}}>
                            <div style={styles.statIcon}>🚨</div>
                            <div>
                                <h3>Emergency</h3>
                                <p style={styles.statNumber}>{stats.emergency_count}</p>
                            </div>
                        </div>
                        <div style={{...styles.statCard, backgroundColor: '#fd7e14'}}>
                            <div style={styles.statIcon}>⚠️</div>
                            <div>
                                <h3>Urgent</h3>
                                <p style={styles.statNumber}>{stats.urgent_count}</p>
                            </div>
                        </div>
                        <div style={{...styles.statCard, backgroundColor: '#28a745'}}>
                            <div style={styles.statIcon}>🏠</div>
                            <div>
                                <h3>Non-Urgent</h3>
                                <p style={styles.statNumber}>{stats.non_urgent_count}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.section}>
                        <h3>📈 Top Symptoms</h3>
                        {stats.top_symptoms && stats.top_symptoms.length > 0 ? (
                            stats.top_symptoms.map((symptom, idx) => (
                                <div key={idx} style={styles.symptomItem}>
                                    <span style={styles.symptomName}>{symptom.name}</span>
                                    <div style={styles.barContainer}>
                                        <div style={{
                                            ...styles.bar,
                                            width: `${(symptom.count / (stats.top_symptoms[0]?.count || 1)) * 100}%`
                                        }}></div>
                                    </div>
                                    <span style={styles.symptomCount}>{symptom.count}</span>
                                </div>
                            ))
                        ) : (
                            <p style={styles.noData}>No symptom data available yet</p>
                        )}
                    </div>
                </>
            )}
            
            {/* Users Tab */}
            {activeTab === 'users' && (
                <div style={styles.section}>
                    <h3>👥 User Management</h3>
                    <div style={styles.tableWrapper}>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span>Username</span>
                                <span>Email</span>
                                <span>Role</span>
                                <span>Reports</span>
                                <span>Joined</span>
                                <span>Action</span>
                            </div>
                            {users.map(user => (
                                <div key={user.id} style={styles.tableRow}>
                                    <span style={styles.userName}>{user.username}</span>
                                    <span style={styles.userEmail}>{user.email || '—'}</span>
                                    <span>
                                        <select 
                                            value={user.role || 'patient'}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            disabled={updatingRole === user.id}
                                            style={styles.roleSelect}
                                        >
                                            <option value="patient">Patient</option>
                                            <option value="doctor">Doctor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {updatingRole === user.id && <span style={styles.updating}>...</span>}
                                    </span>
                                    <span>{user.report_count || 0}</span>
                                    <span>{formatDate(user.date_joined)}</span>
                                    <span>
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Delete user ${user.username}?`)) {
                                                        // Add delete functionality if needed
                                                        alert('Delete functionality coming soon');
                                                    }
                                                }}
                                                style={styles.deleteBtn}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {users.length === 0 && (
                        <p style={styles.noData}>No users found</p>
                    )}
                </div>
            )}
            
            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div style={styles.section}>
                    <h3>📋 Recent Symptom Reports</h3>
                    <div style={styles.tableWrapper}>
                        <div style={styles.table}>
                            <div style={styles.tableHeader}>
                                <span>User</span>
                                <span>Symptoms</span>
                                <span>Triage</span>
                                <span>Confidence</span>
                                <span>Date</span>
                            </div>
                            {stats.recent_reports && stats.recent_reports.length > 0 ? (
                                stats.recent_reports.map(report => (
                                    <div key={report.id} style={styles.tableRow}>
                                        <span>{report.user}</span>
                                        <span style={styles.symptomText} title={report.symptoms}>
                                            {report.symptoms?.substring(0, 50)}...
                                        </span>
                                        <span>
                                            <span style={{
                                                ...styles.triageBadge,
                                                backgroundColor: report.triage_level === 'emergency' ? '#dc3545' :
                                                                report.triage_level === 'urgent' ? '#fd7e14' : '#28a745'
                                            }}>
                                                {report.triage_level}
                                            </span>
                                        </span>
                                        <span>{Math.round((report.confidence || 0) * 100)}%</span>
                                        <span>{formatDate(report.date)}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={styles.noData}>No reports found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div style={styles.section}>
                    <h3>📊 Analytics Overview</h3>
                    <div style={styles.analyticsGrid}>
                        <div style={styles.analyticsCard}>
                            <h4>📈 Engagement Rate</h4>
                            <p style={styles.analyticsNumber}>
                                {stats.total_reports > 0 && stats.total_users > 0
                                    ? ((stats.total_reports / stats.total_users) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p>Reports per user</p>
                        </div>
                        <div style={styles.analyticsCard}>
                            <h4>🚨 Emergency Rate</h4>
                            <p style={styles.analyticsNumber}>
                                {stats.total_reports > 0
                                    ? ((stats.emergency_count / stats.total_reports) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p>of total reports</p>
                        </div>
                        <div style={styles.analyticsCard}>
                            <h4>⚠️ Urgent Rate</h4>
                            <p style={styles.analyticsNumber}>
                                {stats.total_reports > 0
                                    ? ((stats.urgent_count / stats.total_reports) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p>of total reports</p>
                        </div>
                        <div style={styles.analyticsCard}>
                            <h4>🏠 Non-Urgent Rate</h4>
                            <p style={styles.analyticsNumber}>
                                {stats.total_reports > 0
                                    ? ((stats.non_urgent_count / stats.total_reports) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p>of total reports</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// AdminDashboard component that wraps content with authentication
function AdminDashboard() {
    return (
        <AdminAuth>
            <AdminDashboardContent />
        </AdminAuth>
    );
}

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    headerActions: {
        display: 'flex',
        gap: '10px',
    },
    refreshBtn: {
        padding: '8px 16px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid #dee2e6',
        paddingBottom: '10px',
    },
    tab: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    activeTab: {
        backgroundColor: '#17a2b8',
        color: 'white',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    statIcon: {
        fontSize: '32px',
    },
    statNumber: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '5px 0 0',
    },
    section: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    symptomItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px',
    },
    symptomName: {
        width: '100px',
        fontWeight: '500',
    },
    barContainer: {
        flex: 1,
        height: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px',
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        backgroundColor: '#007bff',
        borderRadius: '5px',
        transition: 'width 0.3s ease',
    },
    symptomCount: {
        width: '50px',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        minWidth: '800px',
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr 0.8fr 0.8fr 1fr 0.8fr',
        gap: '10px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        borderRadius: '8px',
        marginBottom: '10px',
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr 0.8fr 0.8fr 1fr 0.8fr',
        gap: '10px',
        padding: '12px',
        borderBottom: '1px solid #eee',
        alignItems: 'center',
    },
    userName: {
        fontWeight: '500',
    },
    userEmail: {
        color: '#666',
        fontSize: '12px',
    },
    symptomText: {
        fontSize: '13px',
        color: '#555',
    },
    roleSelect: {
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '12px',
    },
    updating: {
        marginLeft: '5px',
        fontSize: '12px',
        color: '#17a2b8',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        opacity: 0.6,
        transition: 'opacity 0.2s',
    },
    triageBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        display: 'inline-block',
        textTransform: 'uppercase',
    },
    analyticsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    analyticsCard: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
    },
    analyticsNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        margin: '10px 0',
        color: '#007bff',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px',
    },
    errorIcon: {
        fontSize: '48px',
        marginBottom: '20px',
    },
    retryBtn: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    backBtn: {
        marginTop: '10px',
        marginLeft: '10px',
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    noData: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
    },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;