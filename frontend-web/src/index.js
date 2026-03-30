import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ========== SERVICE WORKER REGISTRATION ==========
// This enables the app to work offline and load faster
// The service worker caches static assets and allows the app to work offline

if ('serviceWorker' in navigator) {
    // Wait for the page to fully load before registering
    window.addEventListener('load', () => {
        // Register the service worker
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered successfully:', registration);
                
                // Optional: Check for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('🔄 New content is available; please refresh.');
                                } else {
                                    console.log('✅ Content is cached for offline use.');
                                }
                            }
                        };
                    }
                };
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
} else {
    console.log('⚠️ Service Worker is not supported in this browser');
}
// =================================================
// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered');
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}