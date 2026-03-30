import React, { useState, useRef, useEffect } from 'react';
import { analyzeSymptoms } from '../services/api';

function Chatbot({ token }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "👋 Hello! I'm your health assistant. Describe your symptoms and I'll help you understand what to do.",
            sender: 'bot',
            time: new Date().toLocaleTimeString()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        // Add user message
        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setLoading(true);
        const userInput = input;
        setInput('');
        
        try {
            // Call the analyze API
            const response = await analyzeSymptoms({
                symptoms_text: userInput,
                temperature: 0,
                duration_days: 1
            });
            
            if (response.success) {
                const data = response.data;
                
                // Build bot response based on triage level
                let botResponse = '';
                
                switch(data.triage_level) {
                    case 'emergency':
                        botResponse = `🚨 **EMERGENCY ALERT** 🚨\n\n${data.recommendation}\n\n📋 **Condition:** ${data.possible_condition}\n\n💊 **Recommended:** ${data.medications?.map(m => m.name).join(', ') || 'Seek immediate medical care'}\n\n⚠️ **Please seek emergency care immediately!**`;
                        break;
                    case 'urgent':
                        botResponse = `⚠️ **URGENT** ⚠️\n\n${data.recommendation}\n\n📋 **Condition:** ${data.possible_condition}\n\n💊 **Recommended Medications:**\n${data.medications?.map(m => `• ${m.name} - ${m.dosage}`).join('\n') || 'Consult a doctor'}\n\n📝 **Confidence:** ${(data.confidence_score * 100).toFixed(0)}%`;
                        break;
                    default:
                        botResponse = `🏠 **Non-Urgent**\n\n${data.recommendation}\n\n📋 **Condition:** ${data.possible_condition}\n\n💊 **Recommended:**\n${data.medications?.map(m => `• ${m.name} - ${m.dosage}`).join('\n') || 'Rest and stay hydrated'}\n\n📝 **Confidence:** ${(data.confidence_score * 100).toFixed(0)}%`;
                }
                
                // Add quick reply suggestions
                const suggestions = [
                    "I have chest pain",
                    "I have high fever",
                    "I feel weak",
                    "I have headache"
                ];
                
                const botMessage = {
                    id: Date.now() + 1,
                    text: botResponse,
                    sender: 'bot',
                    time: new Date().toLocaleTimeString(),
                    suggestions: suggestions
                };
                setMessages(prev => [...prev, botMessage]);
                
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Sorry, I couldn't analyze that. Please try describing your symptoms differently.",
                    sender: 'bot',
                    time: new Date().toLocaleTimeString()
                }]);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Connection error. Please check your internet and try again.",
                sender: 'bot',
                time: new Date().toLocaleTimeString()
            }]);
        }
        
        setLoading(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        setTimeout(() => sendMessage(), 100);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={styles.chatToggle}
            >
                {isOpen ? '✖' : '💬'}
            </button>
            
            {/* Chat Window */}
            {isOpen && (
                <div style={styles.chatContainer}>
                    <div style={styles.chatHeader}>
                        <div>
                            <span style={styles.chatIcon}>🤖</span>
                            <span style={styles.chatTitle}>Health Assistant</span>
                            <span style={styles.onlineDot}>●</span>
                            <span style={styles.onlineText}>Online</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✖</button>
                    </div>
                    
                    <div style={styles.messagesContainer}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={msg.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper}>
                                <div style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
                                    <div style={styles.messageText}>{msg.text}</div>
                                    <div style={styles.messageTime}>{msg.time}</div>
                                </div>
                                {msg.suggestions && (
                                    <div style={styles.suggestionsContainer}>
                                        {msg.suggestions.map((suggestion, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                style={styles.suggestionBtn}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div style={styles.typingIndicator}>
                                <span>●</span>
                                <span>●</span>
                                <span>●</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Describe your symptoms..."
                            style={styles.input}
                            disabled={loading}
                        />
                        <button 
                            onClick={sendMessage} 
                            style={styles.sendBtn}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    chatToggle: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
    },
    chatContainer: {
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        width: '380px',
        height: '550px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
    },
    chatHeader: {
        padding: '15px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    chatIcon: {
        fontSize: '20px',
        marginRight: '8px',
    },
    chatTitle: {
        fontWeight: 'bold',
        fontSize: '16px',
        marginRight: '10px',
    },
    onlineDot: {
        color: '#4caf50',
        fontSize: '12px',
        marginRight: '4px',
    },
    onlineText: {
        fontSize: '12px',
        opacity: 0.9,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '0 5px',
    },
    messagesContainer: {
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
    },
    userMessageWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px',
    },
    botMessageWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    userMessage: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '18px',
        maxWidth: '80%',
        wordWrap: 'break-word',
    },
    botMessage: {
        backgroundColor: '#e9ecef',
        color: '#333',
        padding: '10px 15px',
        borderRadius: '18px',
        maxWidth: '80%',
        wordWrap: 'break-word',
    },
    messageText: {
        fontSize: '14px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
    },
    messageTime: {
        fontSize: '10px',
        opacity: 0.6,
        marginTop: '4px',
        textAlign: 'right',
    },
    suggestionsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px',
    },
    suggestionBtn: {
        padding: '6px 12px',
        backgroundColor: '#e9ecef',
        border: '1px solid #dee2e6',
        borderRadius: '20px',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    typingIndicator: {
        display: 'flex',
        gap: '4px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '18px',
        width: 'fit-content',
        marginBottom: '10px',
    },
    inputContainer: {
        padding: '15px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '20px',
        fontSize: '14px',
        outline: 'none',
    },
    sendBtn: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};

export default Chatbot;