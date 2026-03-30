import React, { useState, useEffect } from 'react';
import { analyzeSymptoms, logout } from '../services/api';
import VoiceInput from './VoiceInput';
import Chatbot from './Chatbot';
import History from './History';
import AdminDashboard from './AdminDashboard';

function SymptomAnalyzer({ onLogout }) {
    const [symptoms, setSymptoms] = useState('');
    const [temperature, setTemperature] = useState('');
    const [duration, setDuration] = useState('');
    const [tempMethod, setTempMethod] = useState('unknown'); // 'known', 'feeling'
    const [tempFeeling, setTempFeeling] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isVoiceListening, setIsVoiceListening] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // History state - load from localStorage
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('symptom_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Check if user is admin
    useEffect(() => {
        const adminStatus = localStorage.getItem('is_admin') === 'true';
        setIsAdmin(adminStatus);
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('symptom_history', JSON.stringify(history));
    }, [history]);

    // Function to save symptom check to history
    const saveToHistory = (symptomsText, resultData) => {
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            symptoms: symptomsText,
            triage_level: resultData.triage_level,
            triage_display: resultData.triage_display,
            recommendation: resultData.recommendation,
            confidence: resultData.confidence_score,
            temperature: resultData.temperature,
            duration: resultData.duration_days,
            possible_condition: resultData.possible_condition
        };
        const updatedHistory = [newEntry, ...history].slice(0, 30); // Keep last 30 entries
        setHistory(updatedHistory);
    };

    // Function to get actual temperature value based on user selection
    const getTemperatureValue = () => {
        if (tempMethod === 'known' && temperature) {
            return parseFloat(temperature);
        } else if (tempMethod === 'feeling') {
            const feelingMap = {
                'normal': 36.5,
                'warm': 37.5,
                'feverish': 38.5,
                'high_fever': 39.5,
                'very_high': 40.5
            };
            return feelingMap[tempFeeling] || 37.0;
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        // Calculate temperature based on user input method
        const tempValue = getTemperatureValue();

        const res = await analyzeSymptoms({
            symptoms_text: symptoms,
            temperature: tempValue,
            duration_days: parseInt(duration) || 1,
        });

        if (res.success) {
            setResult(res.data);
            saveToHistory(symptoms, res.data); // Save to history
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    const getTriageStyle = (level) => {
        switch(level) {
            case 'emergency': return { backgroundColor: '#dc3545', color: 'white' };
            case 'urgent': return { backgroundColor: '#fd7e14', color: 'white' };
            default: return { backgroundColor: '#28a745', color: 'white' };
        }
    };

    // Get temperature display text
    const getTemperatureDisplay = () => {
        if (tempMethod === 'known' && temperature) {
            return `${temperature}°C (measured)`;
        } else if (tempMethod === 'feeling') {
            const feelingDisplay = {
                'normal': '36.5°C - Normal',
                'warm': '37.5°C - Slightly elevated',
                'feverish': '38.5°C - Mild fever',
                'high_fever': '39.5°C - High fever',
                'very_high': '40.5°C - Very high fever'
            };
            return `${feelingDisplay[tempFeeling]} (based on how you feel)`;
        }
        return 'Not specified';
    };

    // Handle selecting a history entry
    const handleHistorySelect = (entry) => {
        setSymptoms(entry.symptoms);
        setShowHistory(false);
        // Optionally scroll to the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========== FIXED LOGOUT FUNCTION ==========
    const handleLogoutClick = () => {
        // Clear all auth data from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('admin_login_time');
        localStorage.removeItem('admin_username');
        
        // Call the logout function from api.js
        logout();
        
        // Call parent onLogout if provided
        if (onLogout) {
            onLogout();
        }
        
        // Redirect to login page
        window.location.href = '/login';
    };
    // ==========================================

    return (
        <div>
            <div style={styles.header}>
                <h2>🏥 Community Health Tracker</h2>
                <div style={styles.headerButtons}>
                    <button 
                        onClick={() => setShowHistory(true)} 
                        style={styles.historyBtn}
                        title="View your symptom history"
                    >
                        📋 History {history.length > 0 && `(${history.length})`}
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowAdmin(true)} 
                            style={styles.adminBtn}
                            title="Admin Dashboard"
                        >
                            🔐 Admin Panel
                        </button>
                    )}
                    <button onClick={handleLogoutClick} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <h3>🩺 Symptom Checker</h3>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Voice Input Section */}
                        <div style={styles.voiceSection}>
                            <VoiceInput 
                                onTranscript={(text) => {
                                    setSymptoms(prev => prev + (prev ? ' ' : '') + text);
                                }}
                                onListeningChange={(listening) => {
                                    setIsVoiceListening(listening);
                                }}
                            />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label>Describe your symptoms</label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Example: I have a fever and headache for 2 days... or click the microphone to speak"
                                rows={4}
                                required
                                style={styles.textarea}
                            />
                            {isVoiceListening && (
                                <div style={styles.voiceHint}>
                                    🎤 Listening... Speak clearly in your chosen language
                                </div>
                            )}
                        </div>
                        
                        {/* Temperature Section - User Friendly */}
                        <div style={styles.tempSection}>
                            <label style={styles.label}>Temperature</label>
                            
                            {/* Temperature method selector */}
                            <div style={styles.tempMethodSelector}>
                                <button 
                                    type="button"
                                    onClick={() => setTempMethod('known')}
                                    style={{
                                        ...styles.tempMethodBtn,
                                        backgroundColor: tempMethod === 'known' ? '#007bff' : '#e9ecef',
                                        color: tempMethod === 'known' ? 'white' : '#333'
                                    }}
                                >
                                    🌡️ I know my temperature
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setTempMethod('feeling')}
                                    style={{
                                        ...styles.tempMethodBtn,
                                        backgroundColor: tempMethod === 'feeling' ? '#28a745' : '#e9ecef',
                                        color: tempMethod === 'feeling' ? 'white' : '#333'
                                    }}
                                >
                                    🤒 I can describe how I feel
                                </button>
                            </div>
                            
                            {tempMethod === 'known' && (
                                <div style={styles.tempInputGroup}>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        placeholder="Enter temperature in °C (e.g., 38.5)"
                                        style={styles.input}
                                    />
                                    <div style={styles.tempHint}>
                                        💡 Normal body temperature is around 36.5-37.5°C. Fever is typically above 38°C.
                                    </div>
                                </div>
                            )}
                            
                            {tempMethod === 'feeling' && (
                                <div style={styles.tempFeelingGroup}>
                                    <select 
                                        value={tempFeeling}
                                        onChange={(e) => setTempFeeling(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="normal">😊 Normal - I feel fine</option>
                                        <option value="warm">😐 Warm - Slightly warm but comfortable</option>
                                        <option value="feverish">😓 Feverish - I feel hot and uncomfortable</option>
                                        <option value="high_fever">🔥 High Fever - Very hot, sweating</option>
                                        <option value="very_high">🌡️ Very High Fever - Extremely hot, shivering</option>
                                    </select>
                                    <div style={styles.tempHint}>
                                        💡 Based on your selection, we'll use: <strong>
                                            {tempFeeling === 'normal' && '36.5°C (Normal temperature)'}
                                            {tempFeeling === 'warm' && '37.5°C (Slightly elevated - monitor)'}
                                            {tempFeeling === 'feverish' && '38.5°C (Mild fever - stay hydrated)'}
                                            {tempFeeling === 'high_fever' && '39.5°C (High fever - consider medical attention)'}
                                            {tempFeeling === 'very_high' && '40.5°C (Very high fever - seek care immediately!)'}
                                        </strong>
                                    </div>
                                </div>
                            )}
                            
                            {tempMethod === 'unknown' && (
                                <div style={styles.tempHint}>
                                    👆 Please select how you'd like to provide your temperature information above.
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label>Duration (days)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="How many days have you had symptoms?"
                                style={styles.input}
                            />
                            <div style={styles.tempHint}>
                                💡 Enter the number of days you've been experiencing these symptoms.
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} style={styles.analyzeBtn}>
                            {loading ? 'Analyzing...' : '🔍 Analyze Symptoms'}
                        </button>
                    </form>
                    
                    {error && <div style={styles.error}>{error}</div>}
                    
                    {result && (
                        <div style={styles.resultContainer}>
                            <h4>📊 Analysis Result</h4>
                            <div style={styles.resultCard}>
                                <div style={styles.resultRow}>
                                    <strong>Triage Level:</strong>
                                    <span style={{ ...styles.badge, ...getTriageStyle(result.triage_level) }}>
                                        {result.triage_display || result.triage_level.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div style={styles.resultRow}>
                                    <strong>Confidence:</strong>
                                    <span>{(result.confidence_score * 100).toFixed(0)}%</span>
                                </div>
                                
                                <div style={styles.resultRow}>
                                    <strong>Temperature Used:</strong>
                                    <span>{getTemperatureDisplay()}</span>
                                </div>
                                
                                <div style={styles.resultRow}>
                                    <strong>Possible Condition:</strong>
                                    <span>{result.possible_condition}</span>
                                </div>
                                
                                <div style={styles.resultRow}>
                                    <strong>Recommendation:</strong>
                                    <span>{result.recommendation}</span>
                                </div>
                                
                                {/* Medications Section */}
                                {result.medications && result.medications.length > 0 && (
                                    <>
                                        <div style={styles.divider}></div>
                                        <div style={styles.medicationsHeader}>
                                            <strong>💊 Recommended Medications:</strong>
                                        </div>
                                        {result.medications.map((med, index) => (
                                            <div key={index} style={styles.medicationCard}>
                                                <div style={styles.medicationName}>
                                                    <strong>{med.name}</strong>
                                                </div>
                                                <div style={styles.medicationDetail}>
                                                    <span style={styles.medicationLabel}>Dosage:</span> {med.dosage}
                                                </div>
                                                <div style={styles.medicationDetail}>
                                                    <span style={styles.medicationLabel}>Note:</span> {med.note}
                                                </div>
                                            </div>
                                        ))}
                                        <div style={styles.disclaimer}>
                                            ⚠️ This is for informational purposes only. Consult a healthcare professional before taking any medication.
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* History Modal */}
            {showHistory && (
                <History 
                    history={history}
                    onSelect={handleHistorySelect}
                    onClose={() => setShowHistory(false)}
                />
            )}
            
            {/* Admin Dashboard Modal - Only shows if user is admin */}
            {showAdmin && isAdmin && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>📊 Admin Dashboard</h3>
                            <button onClick={() => setShowAdmin(false)} style={styles.modalClose}>✖</button>
                        </div>
                        <div style={styles.modalBody}>
                            <AdminDashboard />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Chatbot */}
            <Chatbot token={localStorage.getItem('access_token')} />
        </div>
    );
}

const styles = {
    header: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButtons: {
        display: 'flex',
        gap: '10px',
    },
    historyBtn: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.2s',
    },
    adminBtn: {
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.2s',
    },
    logoutBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    voiceSection: {
        marginBottom: '1rem',
    },
    voiceHint: {
        fontSize: '0.75rem',
        color: '#28a745',
        marginTop: '0.25rem',
        padding: '0.25rem',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        marginTop: '0.25rem',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        marginTop: '0.25rem',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    analyzeBtn: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#28a745',
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
        marginTop: '1rem',
    },
    resultContainer: {
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '2px solid #eee',
    },
    resultCard: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem',
    },
    resultRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid #eee',
    },
    badge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
    },
    divider: {
        borderTop: '1px solid #ddd',
        margin: '1rem 0',
    },
    medicationsHeader: {
        marginBottom: '0.75rem',
        fontSize: '1rem',
        color: '#333',
    },
    medicationCard: {
        backgroundColor: '#fff',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        borderLeft: '4px solid #28a745',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    medicationName: {
        fontSize: '1rem',
        marginBottom: '0.25rem',
        color: '#2c3e50',
    },
    medicationDetail: {
        fontSize: '0.875rem',
        color: '#555',
        marginTop: '0.25rem',
    },
    medicationLabel: {
        fontWeight: 'bold',
        color: '#666',
        marginRight: '0.5rem',
    },
    disclaimer: {
        fontSize: '0.75rem',
        color: '#999',
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #eee',
        fontStyle: 'italic',
    },
    // New styles for temperature section
    tempSection: {
        marginBottom: '1rem',
    },
    tempMethodSelector: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    tempMethodBtn: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        textAlign: 'center',
    },
    tempInputGroup: {
        marginTop: '0.5rem',
    },
    tempFeelingGroup: {
        marginTop: '0.5rem',
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        marginTop: '0.25rem',
    },
    tempHint: {
        fontSize: '0.75rem',
        color: '#666',
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        lineHeight: '1.4',
    },
    // Modal styles for Admin Dashboard
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
    },
    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0 5px',
    },
    modalBody: {
        padding: '20px',
    },
};

export default SymptomAnalyzer;