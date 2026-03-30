import React from 'react';

function History({ history, onSelect, onClose }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getTriageColor = (level) => {
        switch(level) {
            case 'emergency': return '#dc3545';
            case 'urgent': return '#fd7e14';
            default: return '#28a745';
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>📋 Symptom History</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✖</button>
                </div>
                <div style={styles.content}>
                    {history.length === 0 ? (
                        <p style={styles.empty}>No history yet. Start checking symptoms!</p>
                    ) : (
                        history.map(entry => (
                            <div 
                                key={entry.id} 
                                style={styles.historyCard}
                                onClick={() => onSelect(entry)}
                            >
                                <div style={styles.historyHeader}>
                                    <span style={styles.date}>{formatDate(entry.date)}</span>
                                    <span style={{
                                        ...styles.triageBadge,
                                        backgroundColor: getTriageColor(entry.triage_level)
                                    }}>
                                        {entry.triage_display || entry.triage_level}
                                    </span>
                                </div>
                                <p style={styles.symptoms}>{entry.symptoms.substring(0, 80)}...</p>
                                <div style={styles.historyFooter}>
                                    <span>Confidence: {(entry.confidence * 100).toFixed(0)}%</span>
                                    <span>Temp: {entry.temperature || 'N/A'}°C</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
    },
    content: {
        padding: '20px',
        overflowY: 'auto',
    },
    historyCard: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        marginBottom: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #eee',
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    date: {
        color: '#666',
        fontSize: '12px',
    },
    triageBadge: {
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '10px',
        textTransform: 'uppercase',
    },
    symptoms: {
        margin: '8px 0',
        color: '#333',
        fontSize: '14px',
    },
    historyFooter: {
        display: 'flex',
        gap: '15px',
        fontSize: '11px',
        color: '#666',
        marginTop: '8px',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        padding: '40px',
    },
};

export default History;