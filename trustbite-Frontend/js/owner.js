// Owner Dashboard Functionality

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.owner-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Set active sidebar link
    if (event && event.target) {
        event.target.closest('.sidebar-link').classList.add('active');
    }
}

// Toggle Edit Mode for Mess Details
function toggleEditMode() {
    const form = document.getElementById('messDetailsForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    const formActions = document.getElementById('formActions');
    const editBtn = document.getElementById('editBtnText');
    
    const isDisabled = inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = !isDisabled;
    });
    
    if (isDisabled) {
        formActions.style.display = 'flex';
        editBtn.textContent = '❌ Cancel Edit';
    } else {
        formActions.style.display = 'none';
        editBtn.textContent = '✏️ Edit Details';
    }
}

// Cancel Edit
function cancelEdit() {
    toggleEditMode();
    // Reset form to original values (in real app, would reload from database)
}

// Toggle Menu Edit
function toggleMenuEdit() {
    const inputs = document.querySelectorAll('.menu-meal input');
    const formActions = document.getElementById('menuFormActions');
    const editBtn = document.getElementById('menuEditBtnText');
    
    const isDisabled = inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = !isDisabled;
    });
    
    if (isDisabled) {
        formActions.style.display = 'flex';
        editBtn.textContent = '❌ Cancel';
    } else {
        formActions.style.display = 'none';
        editBtn.textContent = '✏️ Edit Menu';
    }
}

// Cancel Menu Edit
function cancelMenuEdit() {
    toggleMenuEdit();
}

// Save Menu
function saveMenu() {
    alert('Menu saved successfully! (In real app, would save to database)');
    toggleMenuEdit();
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const messForm = document.getElementById('messDetailsForm');
    
    if (messForm) {
        messForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mess details saved successfully! (In real app, would save to database)');
            toggleEditMode();
        });
    }
    
    // Check if user is owner
    const user = getCurrentUser();
    if (!user || (user.role !== 'owner' && user.role !== 'mess_owner')) {
        window.location.href = 'login.html';
    }
});