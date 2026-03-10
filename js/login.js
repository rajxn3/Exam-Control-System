/**
 * login.js - Comprehensive Authentication with API and Mock Fallback
 */

// Global state tracking
let currentRole = 'student';
let googleEmail = '';

// Local fallback if API is unavailable
const LOCAL_FALLBACK = {
    student: { usernames: ['Raj Priyan', 'Danish'], password: '12345678' },
    instructor: { username: 'instructor_demo', password: 'pass456' },
    admin: { username: 'admin_root', password: 'root123' }
};

/**
 * UI INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    selectRole('student');
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.getAttribute('data-role');
            if (role) selectRole(role);
        });
    });

    document.querySelectorAll('.demo-credentials p').forEach(p => {
        p.addEventListener('click', () => {
            if (currentRole === 'student' && p.textContent.includes('Student')) {
                fillForm('raj', '9867', 'CS101');
            } else if (currentRole === 'instructor' && p.textContent.includes('Instructor')) {
                fillForm('instructor1', 'Instruter@123');
            } else if (currentRole === 'admin' && p.textContent.includes('Admin')) {
                fillForm('admin1', 'Admin@123');
            }
        });
    });

    document.getElementById('examLoginForm')?.addEventListener('submit', handleLoginFormSubmit);
});

/**
 * FORM UTILITIES
 */
function fillForm(user, pass, code = '') {
    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');
    const codeEl = document.getElementById('examCode');
    if (userEl) userEl.value = user;
    if (passEl) passEl.value = pass;
    if (codeEl) codeEl.value = code;
}

function selectRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-role') === role);
    });

    const examCodeGroup = document.getElementById('examCodeGroup');
    const examCodeInput = document.getElementById('examCode');
    const studentCreds = document.getElementById('studentCreds');
    const instructorCreds = document.getElementById('instructorCreds');
    const adminCreds = document.getElementById('adminCreds');

    if (examCodeGroup) examCodeGroup.style.display = role === 'student' ? 'block' : 'none';
    if (examCodeInput) examCodeInput.required = role === 'student';

    if (studentCreds) {
        studentCreds.innerHTML = `<p><strong>Student:</strong> raj / 9867 (from SQL)</p>`;
        studentCreds.style.display = role === 'student' ? 'block' : 'none';
    }
    if (instructorCreds) {
        instructorCreds.innerHTML = `<p><strong>Instructor:</strong> instructor1 / Instruter@123 (from SQL)</p>`;
        instructorCreds.style.display = role === 'instructor' ? 'block' : 'none';
    }
    if (adminCreds) {
        adminCreds.innerHTML = `<p><strong>Admin:</strong> admin1 / Admin@123 (from SQL)</p>`;
        adminCreds.style.display = role === 'admin' ? 'block' : 'none';
    }
}

/**
 * AUTHENTICATION HANDLERS
 */
async function handleLoginFormSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const examCode = currentRole === 'student' ? document.getElementById('examCode')?.value.trim().toUpperCase() : '';
    
    const loginBtn = document.getElementById('loginButton');
    const spinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('btnText');
    const errorMessage = document.getElementById('errorMessage');

    if (!username || !password) { showError(errorMessage, 'Please fill in all required fields'); return; }
    if (currentRole === 'student' && !examCode) { showError(errorMessage, 'Exam code is required'); return; }

    if (loginBtn) loginBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (errorMessage) errorMessage.style.display = 'none';

    try {
        // --- STEP 1: AUTHENTICATE WITH FIREBASE ---
        console.log("Checking Firestore for user...");
        const firebaseUser = await authenticateWithFirebase(username, password, currentRole, examCode);
        
        if (firebaseUser) {
            console.log("Firestore Authentication Successful!");
            handleLoginSuccess(firebaseUser.full_name || username, currentRole, examCode);
            return;
        }

        // --- STEP 2: FALLBACK TO SQL SERVER ---
        console.log("Attempting SQL Login...");
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: currentRole })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('userId', data.user.user_id);
            if (data.user.student_info && data.user.student_info.student_id) {
                localStorage.setItem('studentId', data.user.student_info.student_id);
            }
            handleLoginSuccess(data.user.full_name || username, currentRole, examCode);
        } else {
            handleLoginFailure(currentRole, loginBtn, spinner, btnText, errorMessage, data.message);
        }
    } catch (error) {
        console.warn('Network/Connection error. Checking local mock logic.');
        // MOCK LOGIC FALLBACK
        const mockPass = (currentRole === 'student') ? '9867' : (currentRole === 'instructor' ? 'Instruter@123' : 'Admin@123');
        if (password === mockPass) {
            handleLoginSuccess(username, currentRole, examCode);
        } else {
            handleLoginFailure(currentRole, loginBtn, spinner, btnText, errorMessage, "Authentication failed. Check your connection.");
        }
    }
}

// Firestore Authentication Check
async function authenticateWithFirebase(username, password, role, examCode) {
    if (!window.firebase_db || !window.fb_query) {
        console.error("Firebase not ready");
        return null;
    }
    try {
        const usersRef = window.fb_collection(window.firebase_db, "users");
        const q = window.fb_query(usersRef, 
            window.fb_where("username", "==", username),
            window.fb_where("password", "==", password),
            window.fb_where("role", "==", role),
            ...(role === 'student' ? [window.fb_where("examCode", "==", examCode)] : [])
        );
        const querySnapshot = await window.fb_getDocs(q);
        return !querySnapshot.empty ? querySnapshot.docs[0].data() : null;
    } catch (e) {
        console.error("Firebase Auth Error:", e);
        return null;
    }
}

function handleLoginSuccess(username, role, examCode) {
    const successOverlay = document.getElementById('successOverlay');
    const successMessage = document.getElementById('successMessage');
    const progressFill = document.getElementById('authProgressFill');
    const statusTitle = document.getElementById('authStatusTitle');

    let targetUrl = 'dashboard.html';
    let redirectMsg = '';

    if (role === 'student') {
        const subject = getExamSubject(examCode);
        redirectMsg = `Access granted for ${subject}. Connecting to SQL Result Engine...`;
        targetUrl = 'exam.html';
        
        localStorage.setItem('examLoggedIn', 'true');
        localStorage.setItem('examUsername', username);
        localStorage.setItem('examCode', examCode);
        localStorage.setItem('examSubject', subject);
        localStorage.setItem('examStartTime', Date.now().toString());
    } else {
        redirectMsg = `${role.charAt(0).toUpperCase() + role.slice(1)} portal established. Fetching dashboard...`;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);

    // SQL Data mapping to Display
    let displayName = username;
    let roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
    if (role === 'admin') { displayName = 'Super Admin'; roleDisplay = 'Administrator'; }
    else if (role === 'instructor') { displayName = 'Dr. Ramesh Kumar'; roleDisplay = 'Instructor'; }
    
    localStorage.setItem('displayName', displayName);
    localStorage.setItem('userRoleDisplay', roleDisplay);

    if (successMessage) successMessage.textContent = redirectMsg;
    if (statusTitle) statusTitle.textContent = "Identity Authenticated";
    if (successOverlay) successOverlay.classList.add('active');
    if (progressFill) progressFill.style.width = '100%';

    // Log login to Firebase if available
    logToFirestore(username, role);

    setTimeout(() => { window.location.href = targetUrl; }, 2000);
}

/**
 * FIREBASE LOGGING
 */
async function logToFirestore(username, role) {
    if (!window.firebase_db || !window.fb_addDoc) {
        console.warn("Firebase not initialized yet.");
        return;
    }
    try {
        await window.fb_addDoc(window.fb_collection(window.firebase_db, "user_logins"), {
            username: username,
            role: role,
            loginTime: window.fb_serverTimestamp(),
            userAgent: navigator.userAgent
        });
        console.log("Login documented in Firestore Database.");
    } catch (e) {
        console.error("Firestore Audit Error:", e);
    }
}

/**
 * DEVELOPER UTILITY
 * Call this from console: seedFirestoreUsers() 
 * to create demo accounts in your Firebase project.
 */
window.seedFirestoreUsers = async function() {
    if (!window.firebase_db || !window.fb_addDoc) {
        console.error("Firebase not initialized.");
        return;
    }
    const users = [
        { username: 'admin1', password: 'Admin@123', role: 'admin', full_name: 'System Admin' },
        { username: 'instructor1', password: 'Instruter@123', role: 'instructor', full_name: 'Dr. Ramesh Kumar' },
        { username: 'raj', password: '9867', role: 'student', examCode: 'CS101', full_name: 'Raj Priyan' }
    ];

    try {
        for (const user of users) {
            await window.fb_addDoc(window.fb_collection(window.firebase_db, "users"), user);
            console.log(`Created user: ${user.username}`);
        }
        alert("Firestore Seeded Successfully!");
    } catch (e) {
        console.error("Seed Error:", e);
    }
};

function handleLoginFailure(role, btn, spinner, text, errorEl, msg) {
    showError(errorEl, msg || `Invalid ${role} credentials. Please try again.`);
    if (btn) btn.disabled = false;
    if (spinner) spinner.style.display = 'none';
}

/**
 * GOOGLE MODAL FLOW HELPERS
 */
window.selectGoogleAccount = function(name, email) {
    googleEmail = email;
    const emailDisp = document.getElementById('googleDisplayEmail');
    const initials = document.getElementById('googleInitials');
    if (emailDisp) emailDisp.textContent = email;
    if (initials) initials.textContent = name.charAt(0);
    document.getElementById('googleAccountStep').style.display = 'none';
    startSecurityScan();
};

window.useAnotherAccount = function() {
    document.getElementById('googleAccountStep').style.display = 'none';
    document.getElementById('googleEmailStep').style.display = 'block';
};

window.toggleGoogleHelp = function(show) {
    document.getElementById('googleHelpStep').style.display = show ? 'block' : 'none';
    if (show) {
        ['googleAccountStep', 'googleEmailStep', 'googlePasswordStep', 'googleMobileStep', 'googleOtpStep', 'googleQrStep', 'googleScanStep']
        .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    } else {
        document.getElementById('googleOtpStep').style.display = 'block';
    }
};

window.goToGoogleQr = function() {
    ['googleMobileStep', 'googleOtpStep', 'googleHelpStep'].forEach(id => { 
        const el = document.getElementById(id); if (el) el.style.display = 'none'; 
    });
    document.getElementById('googleQrStep').style.display = 'block';
};

window.handleQrVerification = function() {
    const qrSuccess = document.getElementById('qrSuccess');
    if (qrSuccess) qrSuccess.style.display = 'flex';
    setTimeout(() => { handleGoogleLoginFinal(true); }, 1500);
};

window.startSecurityScan = async function() {
    const emailInput = document.getElementById('googleEmailInput');
    if (!googleEmail && emailInput) googleEmail = emailInput.value;
    if (!googleEmail) { alert("Please enter email"); return; }
    document.getElementById('googleEmailStep').style.display = 'none';
    document.getElementById('googleScanStep').style.display = 'block';
    const progress = document.getElementById('scanProgress');
    const statusText = document.getElementById('scanStatusText');
    for (let i = 0; i < 4; i++) {
        const icon = document.getElementById(`icon${i+1}`);
        if (icon) icon.className = 'fas fa-circle-notch fa-spin scan-icon scanning';
        await new Promise(r => setTimeout(r, 600));
        if (icon) icon.className = 'fas fa-check-circle scan-icon done';
        if (progress) progress.style.width = `${(i+1)*25}%`;
    }
    setTimeout(() => {
        document.getElementById('googleScanStep').style.display = 'none';
        document.getElementById('googlePasswordStep').style.display = 'block';
        const init = document.getElementById('googleInitials');
        const disp = document.getElementById('googleDisplayEmail');
        if (init) init.textContent = googleEmail.charAt(0).toUpperCase();
        if (disp) disp.textContent = googleEmail;
    }, 800);
};

window.goToGoogleMobile = function() {
    if (!document.getElementById('googlePasswordInput')?.value) { alert("Please enter password"); return; }
    document.getElementById('googlePasswordStep').style.display = 'none';
    document.getElementById('googleMobileStep').style.display = 'block';
};

window.syncAndFetchGmailOTP = async function() {
    const spinner = document.getElementById('fetchSpinner');
    const text = document.getElementById('fetchText');
    if (spinner) spinner.style.display = 'block';
    if (text) text.textContent = 'Syncing...';
    try {
        if (typeof GoogleAuthBackend !== 'undefined') {
            const res = await GoogleAuthBackend.fetchFromRealGmail(googleEmail);
            if (res.status === 'success') {
                const otp = res.otp.toString();
                for (let i=0; i<6; i++) { const el = document.getElementById(`otp${i+1}`); if (el) el.value = otp[i]; }
                setTimeout(() => handleGoogleLoginFinal(), 1000);
            }
        }
    } catch(e) { if (text) text.textContent = 'Sync Failed'; if (spinner) spinner.style.display='none'; }
};

window.sendGoogleMobileOtp = async function() {
    const phone = document.getElementById('googleMobileInput')?.value;
    if (!phone || phone.length < 10) { alert("Invalid phone"); return; }
    const sendBtn = document.getElementById('sendOtpBtn');
    if (sendBtn) sendBtn.disabled = true;
    try {
        if (typeof GoogleAuthBackend !== 'undefined') {
            const res = await GoogleAuthBackend.sendOTP(googleEmail, phone);
            if (res.status === 'success') {
                document.getElementById('googleMobileStep').style.display = 'none';
                document.getElementById('googleOtpStep').style.display = 'block';
                const toast = document.getElementById('otpToast');
                const tContent = document.getElementById('toastContent');
                if (tContent) tContent.innerHTML = `<b>G-${res.otp}</b> is your code.`;
                if (toast) toast.classList.add('active');
                setTimeout(() => toast?.classList.remove('active'), 7000);
            }
        }
    } catch(e) { if (sendBtn) sendBtn.disabled = false; }
};

window.moveOtp = function(current, nextId) {
    if (current.value.length === 1) document.getElementById(nextId)?.focus();
};

window.handleGoogleLoginFinal = async function(isQr = false) {
    let otp = '';
    if (!isQr) {
        otp = Array.from(document.querySelectorAll('.otp-code')).map(i => i.value).join('');
        if (otp.length < 6) { alert("Enter 6-digit code"); return; }
    }
    if (typeof closeGoogleModal === 'function') closeGoogleModal();
    const successOverlay = document.getElementById('successOverlay');
    const successMessage = document.getElementById('successMessage');
    const fill = document.getElementById('authProgressFill');
    if (successOverlay) successOverlay.classList.add('active');
    setTimeout(() => {
        if (fill) fill.style.width = '100%';
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('username', googleEmail || 'verified_user@gmail.com');
        localStorage.setItem('displayName', 'Verified Student');
        localStorage.setItem('userRoleDisplay', 'Student');
        setTimeout(() => { window.location.href = 'exam.html'; }, 2000);
    }, 1500);
};

/**
 * UTILS
 */
function showError(el, msg) { if (el) { el.textContent = msg; el.style.display = 'block'; } else { alert(msg); } }

function getExamSubject(code) {
    const subjectMap = { 'CS101': 'Computer Science 101', 'MATH202': 'Mathematics 101', 'PHYS101': 'Physics 101' };
    return subjectMap[code] || `${code} Examination`;
}