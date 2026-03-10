document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '1.html';
        return;
    }
    
    // Get user info
    const userRole = localStorage.getItem('userRole') || 'student';
    const username = localStorage.getItem('username') || 'User';
    
    // Update UI with user info
    document.getElementById('userRoleDisplay').textContent = 
        userRole.charAt(0).toUpperCase() + userRole.slice(1);
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
    document.getElementById('dashboardTitle').textContent = 
        `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard`;
    
    // Initialize sidebar menu based on role
    initializeSidebar(userRole);
    
    // Initialize charts
    initializeCharts();
    
    // Load dashboard data
    loadDashboardData();
    
    // Event listeners
    document.getElementById('userProfile').addEventListener('click', toggleUserDropdown);
    document.getElementById('notificationBtn').addEventListener('click', showNotifications);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#userProfile') && !e.target.closest('#userDropdown')) {
            document.getElementById('userDropdown').style.display = 'none';
        }
    });
});

function initializeSidebar(role) {
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuItems = getMenuItemsForRole(role);
    
    sidebarMenu.innerHTML = '';
    menuItems.forEach(item => {
        const menuItem = document.createElement('a');
        menuItem.className = 'menu-item';
        menuItem.href = '#';
        menuItem.innerHTML = `
            <i class="fas fa-${item.icon}"></i>
            <span>${item.text}</span>
        `;
        if (item.id === 'dashboard') {
            menuItem.classList.add('active');
        }
        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(item.id);
            // Update active menu item
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            menuItem.classList.add('active');
        });
        sidebarMenu.appendChild(menuItem);
    });
}

function getMenuItemsForRole(role) {
    const commonItems = [
        { id: 'dashboard', text: 'Dashboard', icon: 'tachometer-alt' },
        { id: 'exams', text: 'Exams', icon: 'file-alt' },
        { id: 'results', text: 'Results', icon: 'chart-bar' }
    ];
    
    switch(role) {
        case 'student':
            return [
                ...commonItems,
                { id: 'myexams', text: 'My Exams', icon: 'calendar-check' },
                { id: 'profile', text: 'Profile', icon: 'user' }
            ];
        case 'instructor':
            return [
                ...commonItems,
                { id: 'questions', text: 'Question Bank', icon: 'question-circle' },
                { id: 'students', text: 'Students', icon: 'users' },
                { id: 'reports', text: 'Reports', icon: 'file-export' }
            ];
        case 'admin':
            return [
                ...commonItems,
                { id: 'questions', text: 'Question Bank', icon: 'question-circle' },
                { id: 'students', text: 'Students', icon: 'users' },
                { id: 'instructors', text: 'Instructors', icon: 'chalkboard-teacher' },
                { id: 'settings', text: 'System Settings', icon: 'cog' },
                { id: 'audit', text: 'Audit Logs', icon: 'clipboard-list' }
            ];
        default:
            return commonItems;
    }
}

function loadContent(contentId) {
    const contentArea = document.getElementById('contentArea');
    
    // Show loading
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--secondary);"></i>
        </div>
    `;
    
    // Simulate API call delay
    setTimeout(() => {
        switch(contentId) {
            case 'dashboard':
                window.location.reload(); // Reload to show dashboard
                break;
            case 'exams':
                loadExamsContent();
                break;
            case 'questions':
                loadQuestionsContent();
                break;
            case 'students':
                loadStudentsContent();
                break;
            case 'results':
                loadResultsContent();
                break;
            case 'settings':
                loadSettingsContent();
                break;
            default:
                loadDashboardContent();
        }
    }, 500);
}

function loadDashboardContent() {
    const contentArea = document.getElementById('contentArea');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'student') {
        contentArea.innerHTML = `
            <div class="exam-grid" id="studentExamsGrid">
                <!-- Student exams will be loaded here -->
            </div>
        `;
        loadStudentExams();
    } else {
        // Return to main dashboard
        window.location.reload();
    }
}

function loadExamsContent() {
    const contentArea = document.getElementById('contentArea');
    const userRole = localStorage.getItem('userRole');
    
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Manage Exams</h2>
                <button class="btn btn-primary" onclick="createNewExam()">
                    <i class="fas fa-plus"></i> Create New Exam
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="examsTableBody">
                            <!-- Exams will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    loadExamsData();
}

function loadExamsData() {
    const exams = [
        { id: 1, name: 'Midterm Exam - CS101', subject: 'Computer Science', date: '2024-03-15', duration: '120 min', status: 'active' },
        { id: 2, name: 'Final Exam - MATH202', subject: 'Mathematics', date: '2024-03-20', duration: '180 min', status: 'scheduled' },
        { id: 3, name: 'Quiz - PHYS101', subject: 'Physics', date: '2024-03-10', duration: '60 min', status: 'completed' },
        { id: 4, name: 'Practical Exam - ENG301', subject: 'Engineering', date: '2024-03-25', duration: '240 min', status: 'draft' }
    ];
    
    const tableBody = document.getElementById('examsTableBody');
    tableBody.innerHTML = '';
    
    exams.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exam.id}</td>
            <td><strong>${exam.name}</strong></td>
            <td>${exam.subject}</td>
            <td>${exam.date}</td>
            <td>${exam.duration}</td>
            <td><span class="status-badge status-${exam.status}">${exam.status}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editExam(${exam.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-success btn-sm" onclick="viewExam(${exam.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteExam(${exam.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function initializeCharts() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Average Score %',
                data: [72, 75, 78, 76, 80, 82],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Participation Count',
                data: [120, 135, 150, 142, 160, 175],
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
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

function loadDashboardData() {
    // Simulate loading recent exams
    const recentExams = [
        { name: 'Midterm CS101', date: '2024-03-15', participants: 150, status: 'active' },
        { name: 'Final MATH202', date: '2024-03-20', participants: 200, status: 'pending' },
        { name: 'Quiz PHYS101', date: '2024-03-10', participants: 120, status: 'completed' },
        { name: 'Practical ENG301', date: '2024-03-25', participants: 80, status: 'scheduled' }
    ];
    
    const tableBody = document.getElementById('recentExamsTable');
    tableBody.innerHTML = '';
    
    recentExams.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exam.name}</td>
            <td>${exam.date}</td>
            <td>${exam.participants}</td>
            <td><span class="status-badge status-${exam.status}">${exam.status}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewExamDetails('${exam.name}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    
    // Position dropdown
    const profileBtn = document.getElementById('userProfile');
    const rect = profileBtn.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 5) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    dropdown.style.minWidth = '200px';
    dropdown.style.background = 'white';
    dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    dropdown.style.borderRadius = '5px';
    dropdown.style.zIndex = '1000';
    dropdown.style.padding = '0.5rem 0';
    dropdown.style.border = '1px solid #ddd';
}

function showNotifications() {
    Swal.fire({
        title: 'Notifications',
        html: `
            <div style="text-align: left;">
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>New Exam Scheduled</strong><br>
                    <small>Midterm CS101 - March 15, 2024</small>
                </div>
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>3 New Submissions</strong><br>
                    <small>Quiz PHYS101 requires grading</small>
                </div>
                <div style="padding: 10px;">
                    <strong>System Update</strong><br>
                    <small>Maintenance scheduled for Sunday</small>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
    });
}

function logout() {
    Swal.fire({
        title: 'Confirm Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = '1.html';
        }
    });
}

// Utility functions
function showProfile() {
    Swal.fire({
        title: 'User Profile',
        html: `
            <div style="text-align: center;">
                <div class="avatar" style="width: 80px; height: 80px; margin: 0 auto 1rem; font-size: 2rem;">
                    ${localStorage.getItem('username').charAt(0).toUpperCase()}
                </div>
                <h3>${localStorage.getItem('username')}</h3>
                <p>Role: ${localStorage.getItem('userRole').toUpperCase()}</p>
                <p>Email: ${localStorage.getItem('username')}@university.edu</p>
                <p>Last Login: Today at ${new Date().toLocaleTimeString()}</p>
            </div>
        `,
        showConfirmButton: true
    });
}

function showSettings() {
    Swal.fire({
        title: 'Settings',
        text: 'Settings page is under development',
        icon: 'info'
    });
}

function showHelp() {
    Swal.fire({
        title: 'Help & Support',
        html: `
            <div style="text-align: left;">
                <h4>Need Help?</h4>
                <p><strong>Email:</strong> support@examcontrol.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Documentation:</strong> <a href="#" onclick="window.open('https://docs.examcontrol.com')">View Docs</a></p>
                <hr>
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#" onclick="Swal.close(); loadContent('exams')">Create New Exam</a></li>
                    <li><a href="#" onclick="Swal.close(); loadContent('questions')">Manage Questions</a></li>
                    <li><a href="#" onclick="Swal.close(); loadContent('results')">View Results</a></li>
                </ul>
            </div>
        `,
        width: 600,
        showConfirmButton: false,
        showCloseButton: true
    });
}

function createNewExam() {
    Swal.fire({
        title: 'Create New Exam',
        html: `
            <div style="text-align: left;">
                <label>Exam Name</label>
                <input type="text" id="examName" class="swal2-input" placeholder="Enter exam name">
                
                <label>Subject</label>
                <select id="examSubject" class="swal2-input">
                    <option value="">Select Subject</option>
                    <option value="CS101">Computer Science</option>
                    <option value="MATH202">Mathematics</option>
                    <option value="PHYS101">Physics</option>
                    <option value="ENG301">Engineering</option>
                </select>
                
                <label>Exam Date</label>
                <input type="date" id="examDate" class="swal2-input">
                
                <label>Duration (minutes)</label>
                <input type="number" id="examDuration" class="swal2-input" value="120">
                
                <label>Description</label>
                <textarea id="examDescription" class="swal2-textarea" placeholder="Enter exam description"></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Create Exam',
        preConfirm: () => {
            const name = document.getElementById('examName').value;
            const subject = document.getElementById('examSubject').value;
            const date = document.getElementById('examDate').value;
            
            if (!name || !subject || !date) {
                Swal.showValidationMessage('Please fill in all required fields');
                return false;
            }
            return { name, subject, date };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Exam created successfully', 'success');
            loadExamsData(); // Refresh the exams table
        }
    });
}

function editExam(id) {
    Swal.fire({
        title: 'Edit Exam',
        text: `Editing exam ID: ${id}`,
        icon: 'info'
    });
}

function viewExam(id) {
    Swal.fire({
        title: 'Exam Details',
        html: `
            <div style="text-align: left;">
                <h4>Exam ID: ${id}</h4>
                <p><strong>Name:</strong> Midterm Exam - CS101</p>
                <p><strong>Subject:</strong> Computer Science</p>
                <p><strong>Date:</strong> 2024-03-15</p>
                <p><strong>Duration:</strong> 120 minutes</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Participants:</strong> 150 students</p>
                <hr>
                <h5>Exam Statistics</h5>
                <p>Average Score: 78%</p>
                <p>Completion Rate: 92%</p>
            </div>
        `,
        width: 600,
        showConfirmButton: false,
        showCloseButton: true
    });
}

function deleteExam(id) {
    Swal.fire({
        title: 'Delete Exam',
        text: `Are you sure you want to delete exam ID: ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Deleted!', 'Exam has been deleted.', 'success');
            // In a real app, you would make an API call here
            loadExamsData(); // Refresh the table
        }
    });
}
