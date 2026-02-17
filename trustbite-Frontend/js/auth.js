// Authentication Functions

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('trustbite_user') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('trustbite_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Switch Role Tabs on Login Page
function switchRole(role) {
    // Update hidden field
    document.getElementById('loginRole').value = role;
    
    // Update tab styles
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.role === role) {
            tab.classList.add('active');
        }
    });
}

// Handle Login (UPDATED - Role-based routing)
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('loginRole').value;
    
    // Simple validation
    if (email && password) {
        // Create user object with role
        const user = {
            id: Date.now(),
            name: email.split('@')[0].replace(/[0-9]/g, '').replace('.', ' '),
            email: email,
            role: role,  // 'student' or 'owner'
            phone: '+91 98765 43210',
            location: 'Pune, Maharashtra'
        };
        
        // For mess owners, add mess ownership
        if (role === 'owner') {
            user.messId = 1; // Assuming they own mess ID 1 (Annapurna Mess)
            user.messName = 'Annapurna Mess';
        }
        
        // Save to localStorage
        localStorage.setItem('trustbite_user', JSON.stringify(user));
        
        // Redirect based on role
        if (role === 'student') {
            window.location.href = 'dashboard.html';
        } else if (role === 'owner') {
            window.location.href = 'owner-dashboard.html';
        }
    } else {
        showError('loginError', 'Please enter valid credentials');
    }
}

// Handle Register (UPDATED)
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validation
    if (!acceptTerms) {
        showError('registerError', 'Please accept terms and conditions');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters');
        return;
    }
    
    // Create user
    const user = {
        id: Date.now(),
        name: fullName,
        email: email,
        phone: phone,
        location: location,
        role: role
    };
    
    // For mess owners, assign a mess
    if (role === 'mess_owner') {
        user.messId = 1;
        user.messName = 'Annapurna Mess';
    }
    
    // Save to localStorage
    localStorage.setItem('trustbite_user', JSON.stringify(user));
    
    // Redirect based on role
    if (role === 'student') {
        window.location.href = 'dashboard.html';
    } else if (role === 'mess_owner') {
        window.location.href = 'owner-dashboard.html';
    }
}

// Show Error Message
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    }
}

// Logout
function logout() {
    localStorage.removeItem('trustbite_user');
    window.location.href = 'index.html';
}

// Toggle User Menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('userMenu');
    
    if (menu && dropdown && !dropdown.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// Initialize user info on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    
    if (user) {
        // Update user initials
        const initialsEl = document.getElementById('userInitials');
        if (initialsEl) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            initialsEl.textContent = initials;
        }
        
        // Update user name and email in dropdown
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        
        if (userNameEl) userNameEl.textContent = user.name;
        if (userEmailEl) userEmailEl.textContent = user.email;
        
        // Update profile page
        const profileNameEl = document.getElementById('profileName');
        const profileEmailEl = document.getElementById('profileEmail');
        const profileInitialsEl = document.getElementById('profileInitials');
        
        if (profileNameEl) profileNameEl.textContent = user.name;
        if (profileEmailEl) profileEmailEl.textContent = user.email;
        if (profileInitialsEl) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            profileInitialsEl.textContent = initials;
        }
    }
    
    // Check if user needs to be logged in for this page
    const currentPage = window.location.pathname.split('/').pop();
    
    const protectedPages = ['dashboard.html', 'mess-details.html', 'subscription.html', 'profile.html', 'owner-dashboard.html'];
    
    // Redirect to login if not logged in
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Role-based page access
    if (user) {
        // Students cannot access owner dashboard
        if (currentPage === 'owner-dashboard.html' && user.role !== 'owner' && user.role !== 'mess_owner') {
            window.location.href = 'dashboard.html';
        }
        
        // Owners redirected from student dashboard to owner dashboard
        if (currentPage === 'dashboard.html' && (user.role === 'owner' || user.role === 'mess_owner')) {
            window.location.href = 'owner-dashboard.html';
        }
    }
});