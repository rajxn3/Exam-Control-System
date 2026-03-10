// Main JavaScript for the Exam Control System

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in on protected pages
    const protectedPages = ['dashboard.html', 'exam.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !localStorage.getItem('isLoggedIn')) {
        window.location.href = '1.html';
    }
    
    // Initialize tooltips
    initializeTooltips();
    
    // Check system compatibility
    checkCompatibility();
});

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltipText = this.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
    
    this.tooltipElement = tooltip;
}

function hideTooltip() {
    if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
    }
}

function checkCompatibility() {
    // Check for required APIs
    const requiredAPIs = [
        { name: 'LocalStorage', test: () => 'localStorage' in window },
        { name: 'ES6', test: () => 'Promise' in window }
    ];
    
    const missingAPIs = requiredAPIs.filter(api => !api.test());
    
    if (missingAPIs.length > 0) {
        console.warn('Missing required APIs:', missingAPIs.map(api => api.name));
    }
}

// Utility functions
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '1.html';
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTime,
        logout
    };
}
