document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('userRole') !== 'admin') {
        window.location.href = '1.html';
        return;
    }

    // Initialize admin panel
    initializeAdminPanel();
    
    // Load initial data
    loadAdminData();
});

function initializeAdminPanel() {
    // Setup sidebar menu
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuItems = [
        { id: 'dashboard', text: 'Dashboard', icon: 'tachometer-alt' },
        { id: 'exams', text: 'Exams', icon: 'file-alt' },
        { id: 'questions', text: 'Question Bank', icon: 'question-circle' },
        { id: 'users', text: 'User Management', icon: 'users' },
        { id: 'reports', text: 'Reports', icon: 'chart-bar' },
        { id: 'settings', text: 'System Settings', icon: 'cog' },
        { id: 'audit', text: 'Audit Logs', icon: 'clipboard-list' }
    ];
    
    sidebarMenu.innerHTML = '';
    menuItems.forEach(item => {
        const menuItem = document.createElement('a');
        menuItem.className = 'menu-item';
        menuItem.href = '#';
        menuItem.innerHTML = `
            <i class="fas fa-${item.icon}</i>
            <span>${item.text}</span>
        `;
        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.id === 'dashboard') {
                window.location.href = 'dashboard.html';
            } else {
                showAdminTab(item.id);
            }
        });
        sidebarMenu.appendChild(menuItem);
    });
}

function showAdminTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.admin-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabId + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
        
        // Find and activate corresponding tab button
        const tabButtons = document.querySelectorAll('.admin-tab');
        tabButtons.forEach(btn => {
            if (btn.textContent.includes(tabId.charAt(0).toUpperCase() + tabId.slice(1))) {
                btn.classList.add('active');
            }
        });
        
        // Load tab data
        switch(tabId) {
            case 'users':
                loadUsers();
                break;
            case 'audit':
                loadAuditLogs();
                break;
            case 'reports':
                loadReports();
                break;
        }
    }
}

function loadAdminData() {
    // Load admin statistics
    loadAdminStats();
    
    // Load initial tab data
    loadUsers();
}

async function loadAdminStats() {
    try {
        // In a real application, these would come from an API
        const stats = {
            totalUsers: 1247,
            activeExams: 15,
            totalQuestions: 5832,
            systemUptime: 99.8
        };
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeExams').textContent = stats.activeExams;
        document.getElementById('totalQuestions').textContent = stats.totalQuestions;
        document.getElementById('systemUptime').textContent = stats.systemUptime + '%';
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

async function loadUsers() {
    try {
        // Sample user data - in real app, fetch from API
        const users = [
            { id: 1, username: 'john_doe', email: 'john@university.edu', role: 'student', status: 'active', lastLogin: '2024-03-15 14:30:00' },
            { id: 2, username: 'jane_smith', email: 'jane@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-03-15 09:15:00' },
            { id: 3, username: 'admin_user', email: 'admin@university.edu', role: 'admin', status: 'active', lastLogin: '2024-03-15 16:45:00' },
            { id: 4, username: 'bob_jones', email: 'bob@university.edu', role: 'student', status: 'inactive', lastLogin: '2024-02-28 11:20:00' },
            { id: 5, username: 'sarah_miller', email: 'sarah@university.edu', role: 'student', status: 'active', lastLogin: '2024-03-14 13:10:00' },
            { id: 6, username: 'prof_wilson', email: 'wilson@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-03-15 08:45:00' },
            { id: 7, username: 'mike_chen', email: 'mike@university.edu', role: 'student', status: 'active', lastLogin: '2024-03-14 16:30:00' },
            { id: 8, username: 'lisa_garcia', email: 'lisa@university.edu', role: 'student', status: 'inactive', lastLogin: '2024-02-15 10:15:00' }
        ];
        
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td><span class="status-badge status-${user.role}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="resetPassword(${user.id})">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-${user.status === 'active' ? 'danger' : 'success'} btn-sm" onclick="toggleUserStatus(${user.id})">
                            <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        Swal.fire('Error', 'Failed to load users', 'error');
    }
}

function filterUsers() {
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchFilter = document.getElementById('searchUser').value.toLowerCase();
    
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const role = row.querySelector('td:nth-child(3)').textContent;
        const status = row.querySelector('td:nth-child(4)').textContent;
        const username = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        
        const roleMatch = !roleFilter || role === roleFilter;
        const statusMatch = !statusFilter || status === statusFilter;
        const searchMatch = !searchFilter || 
                           username.includes(searchFilter) || 
                           email.includes(searchFilter);
        
        row.style.display = roleMatch && statusMatch && searchMatch ? '' : 'none';
    });
}

function addNewUser() {
    Swal.fire({
        title: 'Add New User',
        html: `
            <div style="text-align: left;">
                <label>Username</label>
                <input type="text" id="newUsername" class="swal2-input" placeholder="Enter username">
                
                <label>Email</label>
                <input type="email" id="newEmail" class="swal2-input" placeholder="Enter email">
                
                <label>Password</label>
                <input type="password" id="newPassword" class="swal2-input" placeholder="Enter password">
                
                <label>Role</label>
                <select id="newRole" class="swal2-input">
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                </select>
                
                <label>Department (Optional)</label>
                <input type="text" id="newDepartment" class="swal2-input" placeholder="Enter department">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add User',
        preConfirm: () => {
            const username = document.getElementById('newUsername').value;
            const email = document.getElementById('newEmail').value;
            const password = document.getElementById('newPassword').value;
            const role = document.getElementById('newRole').value;
            
            if (!username || !email || !password) {
                Swal.showValidationMessage('Please fill in all required fields');
                return false;
            }
            
            if (password.length < 6) {
                Swal.showValidationMessage('Password must be at least 6 characters');
                return false;
            }
            
            return { username, email, password, role };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'User added successfully', 'success');
            loadUsers(); // Refresh user list
        }
    });
}

function editUser(userId) {
    Swal.fire({
        title: 'Edit User',
        text: `Editing user ID: ${userId}`,
        icon: 'info'
    });
}

function resetPassword(userId) {
    Swal.fire({
        title: 'Reset Password',
        html: `
            <p>Reset password for user ID: ${userId}</p>
            <input type="password" id="newPasswordReset" class="swal2-input" placeholder="Enter new password">
        `,
        showCancelButton: true,
        confirmButtonText: 'Reset Password',
        preConfirm: () => {
            const password = document.getElementById('newPasswordReset').value;
            if (!password) {
                Swal.showValidationMessage('Please enter a new password');
                return false;
            }
            if (password.length < 6) {
                Swal.showValidationMessage('Password must be at least 6 characters');
                return false;
            }
            return password;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Password reset successfully', 'success');
        }
    });
}

function toggleUserStatus(userId) {
    Swal.fire({
        title: 'Change User Status',
        text: 'Are you sure you want to change this user\'s status?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Changed!', 'User status updated.', 'success');
            loadUsers(); // Refresh user list
        }
    });
}

function exportUsers() {
    Swal.fire({
        title: 'Export Users',
        text: 'Exporting user data to CSV...',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}

function loadAuditLogs() {
    // Sample audit logs
    const auditLogs = [
        { time: '2024-03-15 14:30:00', action: 'Login', user: 'john_doe', details: 'Successful login from IP 192.168.1.100' },
        { time: '2024-03-15 14:25:00', action: 'Exam Started', user: 'jane_smith', details: 'Started exam "Midterm CS101"' },
        { time: '2024-03-15 14:20:00', action: 'User Created', user: 'admin_user', details: 'Created new user: mike_chen' },
        { time: '2024-03-15 14:15:00', action: 'Exam Submitted', user: 'bob_jones', details: 'Submitted exam "Final MATH202" with score 85%' },
        { time: '2024-03-15 14:10:00', action: 'Violation Detected', user: 'sarah_miller', details: 'Multiple faces detected during exam' },
        { time: '2024-03-15 14:05:00', action: 'System Update', user: 'system', details: 'Applied security patch v2.1.5' },
        { time: '2024-03-15 14:00:00', action: 'Backup', user: 'system', details: 'Daily database backup completed' },
        { time: '2024-03-15 13:55:00', action: 'Password Reset', user: 'prof_wilson', details: 'Password reset requested and completed' }
    ];
    
    const auditLogsContainer = document.getElementById('auditLogs');
    auditLogsContainer.innerHTML = '';
    
    auditLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <div>
                <div class="log-action">${log.action}</div>
                <div class="log-details">${log.details}</div>
                <div class="log-user">By: ${log.user}</div>
            </div>
            <div class="log-time">${log.time}</div>
        `;
        auditLogsContainer.appendChild(logEntry);
    });
}

function refreshAuditLogs() {
    Swal.fire({
        title: 'Refreshing...',
        text: 'Refreshing audit logs',
        icon: 'info',
        timer: 1000,
        showConfirmButton: false
    }).then(() => {
        loadAuditLogs();
    });
}

function loadReports() {
    // Initialize report chart
    const ctx = document.getElementById('systemReportChart').getContext('2d');
    const reportChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Exams Conducted',
                    data: [45, 52, 48, 55, 60, 65, 70],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#3498db',
                    borderWidth: 1
                },
                {
                    label: 'Active Users',
                    data: [800, 850, 900, 950, 1000, 1050, 1100],
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                },
                {
                    label: 'Violations',
                    data: [12, 8, 15, 10, 9, 7, 11],
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: '#e74c3c',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function generateReport() {
    const period = document.getElementById('reportPeriod').value;
    
    Swal.fire({
        title: 'Generating Report',
        html: `Generating system report for last ${period} days...`,
        timer: 2000,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        Swal.fire({
            title: 'Report Generated',
            html: `
                <div style="text-align: left;">
                    <h4>System Report Summary</h4>
                    <p><strong>Period:</strong> Last ${period} days</p>
                    <p><strong>Total Exams:</strong> 125</p>
                    <p><strong>Active Users:</strong> 1,247</p>
                    <p><strong>Average Score:</strong> 78.5%</p>
                    <p><strong>System Uptime:</strong> 99.8%</p>
                    <p><strong>Violations:</strong> 45 (0.36%)</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Download PDF',
            cancelButtonText: 'Close'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Downloading...', 'Report download started', 'info');
            }
        });
    });
}

function saveSettings() {
    Swal.fire({
        title: 'Saving Settings',
        text: 'Updating system settings...',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        Swal.fire('Success!', 'System settings updated successfully', 'success');
    });
}
