import React, { useState, useEffect, useRef } from 'react';

// Language options for the dropdown
const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'tw', name: 'Twi', flag: '🇬🇭' },
    { code: 'ee', name: 'Ewe', flag: '🇬🇭' },
    { code: 'gaa', name: 'Ga', flag: '🇬🇭' }
];

function VoiceInput({ onTranscript, onListeningChange }) {
    // State variables
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [recognition, setRecognition] = useState(null);
    const [error, setError] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    
    // Reference to store recognition instance
    const recognitionRef = useRef(null);

    // Check if browser supports speech recognition
    const isSpeechSupported = () => {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    };

    // Initialize speech recognition
    useEffect(() => {
        if (!isSpeechSupported()) {
            setError('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
            return;
        }

        // Create speech recognition instance
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        // Configure recognition
        recognitionInstance.continuous = true;        // Keep listening
        recognitionInstance.interimResults = true;    // Show partial results
        recognitionInstance.lang = language;          // Set language
        
        // Handle recognition results
        recognitionInstance.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            // Process all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Show interim transcript while speaking
            if (interimTranscript) {
                setInterimTranscript(interimTranscript);
            }
            
            // Send final transcript to parent component
            if (finalTranscript) {
                onTranscript(finalTranscript);
                setInterimTranscript('');
            }
        };
        
        // Handle recognition start
        recognitionInstance.onstart = () => {
            setIsListening(true);
            setError('');
            if (onListeningChange) onListeningChange(true);
        };
        
        // Handle recognition end
        recognitionInstance.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            if (onListeningChange) onListeningChange(false);
        };
        
        // Handle errors
        recognitionInstance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            switch(event.error) {
                case 'not-allowed':
                    setError('Microphone access denied. Please allow microphone access to use voice input.');
                    break;
                case 'no-speech':
                    setError('No speech detected. Please try again.');
                    break;
                case 'audio-capture':
                    setError('No microphone found. Please connect a microphone.');
                    break;
                default:
                    setError('Speech recognition error. Please try again.');
            }
            
            setIsListening(false);
            if (onListeningChange) onListeningChange(false);
        };
        
        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;
        
        // Cleanup on unmount
        return () => {
            if (recognitionInstance) {
                recognitionInstance.abort();
            }
        };
    }, [language]); // Re-initialize when language changes

    // Toggle listening on/off
    const toggleListening = () => {
        if (!recognition) {
            setError('Speech recognition not available');
            return;
        }
        
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error('Error starting recognition:', err);
                setError('Could not start listening. Please try again.');
            }
        }
    };

    // Update language when dropdown changes
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        
        // If currently listening, restart with new language
        if (isListening && recognition) {
            recognition.stop();
            setTimeout(() => {
                recognition.lang = newLanguage;
                recognition.start();
            }, 100);
        } else if (recognition) {
            recognition.lang = newLanguage;
        }
    };

    // Get current language display name
    const getCurrentLanguage = () => {
        const lang = languages.find(l => l.code === language);
        return lang ? `${lang.flag} ${lang.name}` : 'English';
    };

    return (
        <div style={styles.container}>
            {/* Language Selector */}
            <div style={styles.languageSelector}>
                <select 
                    value={language} 
                    onChange={handleLanguageChange}
                    style={styles.select}
                    disabled={isListening}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Voice Input Button */}
            <button 
                onClick={toggleListening}
                style={{
                    ...styles.button,
                    backgroundColor: isListening ? '#dc3545' : '#28a745'
                }}
                disabled={!recognition}
            >
                {isListening ? '🔴 Stop Listening' : '🎤 Speak Symptoms'}
            </button>
            
            {/* Interim Transcript (shows while speaking) */}
            {interimTranscript && (
                <div style={styles.interim}>
                    <span style={styles.interimLabel}>Speaking:</span> {interimTranscript}
                </div>
            )}
            
            {/* Error Message */}
            {error && (
                <div style={styles.error}>
                    ⚠️ {error}
                </div>
            )}
            
            {/* Listening Indicator */}
            {isListening && (
                <div style={styles.listeningIndicator}>
                    <span className="pulse"></span>
                    Listening in {getCurrentLanguage()}...
                </div>
            )}
        </div>
    );
}

// CSS Styles
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '15px',
    },
    languageSelector: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    select: {
        padding: '8px 12px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    button: {
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    interim: {
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic',
    },
    interimLabel: {
        fontWeight: 'bold',
        color: '#333',
    },
    error: {
        padding: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '5px',
        fontSize: '12px',
    },
    listeningIndicator: {
        padding: '8px',
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        borderRadius: '5px',
        fontSize: '12px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
};

// Add animation CSS for pulse effect
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes pulse {
        0% { opacity: 0.4; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1.2); }
    }
    .pulse {
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: #28a745;
        border-radius: 50%;
        animation: pulse 0.8s ease-in-out infinite alternate;
    }
`;
document.head.appendChild(styleSheet);

export default VoiceInput;