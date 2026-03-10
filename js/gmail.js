/**
 * gmail.js - Smart Backend Bridge
 * Node: Performs mock logic.
 * Browser: Transparently calls the Express API.
 */

const GoogleAuthBackend = (() => {
    // Check if we are in a browser environment
    const isBrowser = typeof window !== 'undefined' && typeof fetch !== 'undefined';
    const API_BASE = isBrowser ? `${window.location.origin}/api` : '';

    // --- INTERNAL STATE (Only used in Node or local mock mode) ---
    let currentOTP = '';
    let currentUser = '';
    let isAuthenticated = false;

    // --- SHARED LOGIC NAMESPACE ---
    const Logic = {
        verifyPassword: async (email, password) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/verifyPassword`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                return await res.json();
            }

            // --- Server-side Mock Logic ---
            await new Promise(r => setTimeout(r, 1000));
            if (password.length >= 8 || password === '12345678') {
                isAuthenticated = true;
                return { status: 'success', message: 'Authentication successful' };
            }
            isAuthenticated = false;
            return { status: 'error', message: 'Wrong password. Try again.' };
        },

        sendOTP: async (email, phoneNumber) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/sendOTP`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, phoneNumber })
                });
                return await res.json();
            }

            // --- Server-side Mock Logic ---
            if (!isAuthenticated) return { status: 'error', message: 'Authentication required' };
            currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
            currentUser = email;
            await new Promise(r => setTimeout(r, 1000));
            return {
                status: 'success',
                message: 'OTP sent successfully',
                otp: currentOTP,
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString()
            };
        },

        verifyOTP: async (email, enteredOTP) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/verifyOTP`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, enteredOTP })
                });
                return await res.json();
            }

            // --- Server-side Mock Logic ---
            await new Promise(r => setTimeout(r, 1000));
            // Special case for QR sync or debug
            if (enteredOTP === 'QR_SYNC' || (email === currentUser && enteredOTP === currentOTP)) {
                return { status: 'success', sessionId: 'sess_' + Math.random().toString(36).substr(2, 9), user: email };
            }
            return { status: 'error', message: 'Invalid verification code.' };
        },

        getExamSessionData: async (email) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/examSessionData?email=${encodeURIComponent(email)}`);
                const json = await res.json();
                return json.data;
            }

            // --- Server-side Mock Logic ---
            return {
                isLoggedIn: 'true',
                examLoggedIn: 'true',
                userRole: 'student',
                username: email,
                displayName: email.split('@')[0],
                userRoleDisplay: 'Verified External Student',
                examCode: 'CS101',
                examSubject: 'Computer Science 101',
                examStartTime: new Date().toISOString()
            };
        },

        syncWithGmail: async (email) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/syncWithGmail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                return await res.json();
            }

            // --- Server-side Mock Logic ---
            await new Promise(r => setTimeout(r, 1500));
            return { status: 'success', message: 'Gmail mailbox connected via IMAP' };
        },

        fetchFromRealGmail: async (email) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/fetchFromRealGmail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                return await res.json();
            }

            // --- Server-side Mock Logic ---
            await new Promise(r => setTimeout(r, 2000));
            if (!currentOTP) currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
            return { status: 'success', otp: currentOTP, subject: 'Your Google verification code' };
        },

        saveResults: async (resultData) => {
            if (isBrowser) {
                const res = await fetch(`${API_BASE}/saveResults`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resultData)
                });
                return await res.json();
            }
            return { status: 'success' };
        },

        getResults: async (email) => {
            if (isBrowser) {
                const url = email ? `${API_BASE}/getResults?email=${encodeURIComponent(email)}` : `${API_BASE}/getResults`;
                const res = await fetch(url);
                const json = await res.json();
                return json.results;
            }
            return [];
        }
    };

    return Logic;
})();

// Export for both Node and Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleAuthBackend;
} else {
    window.GoogleAuthBackend = GoogleAuthBackend;
}
