document.addEventListener('DOMContentLoaded', function() {
    const roleBtns = document.querySelectorAll('.role-btn');
    const examCodeInput = document.getElementById('examCode');
    const examCodeLabel = document.getElementById('examCodeLabel');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Role selection
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const role = this.dataset.role;
            updateFormForRole(role);
        });
    });
    
    function updateFormForRole(role) {
        switch(role) {
            case 'student':
                examCodeLabel.textContent = 'Exam Code (Required)';
                examCodeInput.required = true;
                examCodeInput.placeholder = 'Enter exam code provided';
                break;
            case 'instructor':
                examCodeLabel.textContent = 'Department Code (Optional)';
                examCodeInput.required = false;
                examCodeInput.placeholder = 'Enter department code';
                break;
            case 'admin':
                examCodeLabel.textContent = 'Access Key (Optional)';
                examCodeInput.required = false;
                examCodeInput.placeholder = 'Enter admin access key';
                break;
        }
    }
    
    // Password visibility toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const examCode = document.getElementById('examCode').value;
        const activeRole = document.querySelector('.role-btn.active').dataset.role;
        
        // Simple validation
        if (!username || !password) {
            showAlert('Error', 'Please fill in all required fields', 'error');
            return;
        }
        
        if (activeRole === 'student' && !examCode) {
            showAlert('Error', 'Exam code is required for students', 'error');
            return;
        }
        
        // Demo authentication (replace with real API call)
        const demoCredentials = {
            'student': { username: 'student123', password: 'pass123' },
            'instructor': { username: 'instructor', password: 'teach123' },
            'admin': { username: 'admin', password: 'admin123' }
        };
        
        const demoUser = demoCredentials[activeRole];
        
        if (username === demoUser.username && password === demoUser.password) {
            showAlert('Success', `Welcome, ${activeRole}!`, 'success');
            
            // Store user session
            localStorage.setItem('userRole', activeRole);
            localStorage.setItem('username', username);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect based on role
            setTimeout(() => {
                switch(activeRole) {
                    case 'student':
                        window.location.href = 'exam.html';
                        break;
                    case 'instructor':
                    case 'admin':
                        window.location.href = 'dashboard.html';
                        break;
                }
            }, 1500);
        } else {
            showAlert('Error', 'Invalid credentials. Please try again.', 'error');
        }
    });
    
    function showAlert(title, text, icon) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: text,
                icon: icon,
                confirmButtonColor: '#3498db'
            });
        } else {
            alert(`${title}: ${text}`);
        }
    }
});
