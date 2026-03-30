// Global Variables
let allMessData = [];
let filteredMessData = [];
let currentMessId = null;
let currentImageIndex = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    allMessData = [...messData];
    filteredMessData = [...messData];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // Page-specific initialization
    if (currentPage === 'index.html' || currentPage === '') {
        loadFeaturedMess();
    } else if (currentPage === 'dashboard.html') {
        loadDashboard();
    } else if (currentPage === 'mess-details.html') {
        loadMessDetails();
    } else if (currentPage === 'profile.html') {
        initProfile();
    }
    
    // Initialize star ratings
    initStarRatings();
});

// ============================================
// LANDING PAGE FUNCTIONS
// ============================================

function searchLocation() {
    const searchInput = document.getElementById('locationSearch').value;
    if (searchInput) {
        localStorage.setItem('searchLocation', searchInput);
        window.location.href = 'dashboard.html';
    }
}

function loadFeaturedMess() {
    const grid = document.getElementById('featuredMessGrid');
    if (!grid) return;
    
    const featured = messData.slice(0, 6);
    grid.innerHTML = featured.map(mess => createMessCard(mess)).join('');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function loadDashboard() {
    applyFilters();
    updateResultsCount();
}

function filterMess() {
    const searchInput = document.getElementById('navSearchInput').value.toLowerCase();
    
    filteredMessData = allMessData.filter(mess => {
        return mess.name.toLowerCase().includes(searchInput) ||
               mess.location.toLowerCase().includes(searchInput);
    });
    
    renderMessGrid();
    updateResultsCount();
}

function applyFilters() {
    const locationFilter = document.getElementById('locationFilter').value;
    const distanceFilter = document.querySelector('input[name="distance"]:checked').value;
    const priceRange = document.getElementById('priceRange').value;
    const trustScoreFilter = document.querySelector('input[name="trustScore"]:checked').value;
    const verifiedOnly = document.getElementById('verifiedOnly').checked;
    
    // Food type checkboxes
    const foodTypes = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked'))
        .filter(cb => ['veg', 'non-veg', 'both'].includes(cb.value))
        .map(cb => cb.value);
    
    // Meal type checkboxes
    const mealTypes = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked'))
        .filter(cb => ['breakfast', 'lunch', 'dinner'].includes(cb.value))
        .map(cb => cb.value);
    
    filteredMessData = allMessData.filter(mess => {
        // Location filter
        if (locationFilter !== 'all' && !mess.location.toLowerCase().includes(locationFilter)) {
            return false;
        }
        
        // Distance filter
        if (distanceFilter !== 'all' && mess.distance > parseFloat(distanceFilter)) {
            return false;
        }
        
        // Price filter
        if (mess.pricing.monthly > parseInt(priceRange)) {
            return false;
        }
        
        // Trust score filter
        if (trustScoreFilter !== '0' && mess.trustScore < parseInt(trustScoreFilter)) {
            return false;
        }
        
        // Verified filter
        if (verifiedOnly && !mess.verified) {
            return false;
        }
        
        // Food type filter
        if (foodTypes.length > 0 && !foodTypes.includes(mess.foodType)) {
            return false;
        }
        
        // Meal type filter
        if (mealTypes.length > 0) {
            const hasAllMealTypes = mealTypes.every(type => mess.mealTypes.includes(type));
            if (!hasAllMealTypes) return false;
        }
        
        return true;
    });
    
    renderMessGrid();
    updateResultsCount();
}

function clearFilters() {
    // Reset all filters
    document.getElementById('locationFilter').value = 'all';
    document.querySelector('input[name="distance"][value="all"]').checked = true;
    document.getElementById('priceRange').value = 6000;
    document.getElementById('priceLabel').textContent = '₹6,000';
    document.querySelector('input[name="trustScore"][value="0"]').checked = true;
    document.getElementById('verifiedOnly').checked = false;
    
    // Uncheck all checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Clear search
    const searchInput = document.getElementById('navSearchInput');
    if (searchInput) searchInput.value = '';
    
    applyFilters();
}

function updatePriceLabel(value) {
    document.getElementById('priceLabel').textContent = `₹${parseInt(value).toLocaleString()}`;
}

function sortMess() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredMessData.sort((a, b) => {
        switch(sortBy) {
            case 'trust-desc':
                return b.trustScore - a.trustScore;
            case 'trust-asc':
                return a.trustScore - b.trustScore;
            case 'price-asc':
                return a.pricing.monthly - b.pricing.monthly;
            case 'price-desc':
                return b.pricing.monthly - a.pricing.monthly;
            case 'rating-desc':
                return b.rating - a.rating;
            case 'distance-asc':
                return a.distance - b.distance;
            default:
                return 0;
        }
    });
    
    renderMessGrid();
}

function renderMessGrid() {
    const grid = document.getElementById('messGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (filteredMessData.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        grid.innerHTML = filteredMessData.map(mess => createMessCard(mess)).join('');
    }
}

function updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.textContent = filteredMessData.length;
    }
}

function createMessCard(mess) {
    const scoreClass = getScoreClass(mess.trustScore);
    const foodBadge = getFoodBadge(mess.foodType);
    
    return `
        <div class="mess-card" onclick="viewMessDetails(${mess.id})">
            <img src="${mess.image}" alt="${mess.name}" class="mess-card-image">
            <div class="mess-card-content">
                <div class="mess-card-header">
                    <div>
                        <h3 class="mess-card-title">${mess.name}</h3>
                        <p class="mess-card-location">📍 ${mess.location}</p>
                        <p class="mess-card-distance">${mess.distance} km away</p>
                    </div>
                    <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${mess.id})">
                        ♡
                    </button>
                </div>
                
                <div class="mess-card-badges">
                    ${foodBadge}
                    ${mess.verified ? '<span class="badge badge-verified">✓ Verified</span>' : ''}
                </div>
                
                <div class="mess-card-scores">
                    <div class="score-badge ${scoreClass}">
                        <span class="score-value">${mess.trustScore}</span>
                        <span class="score-label">Trust</span>
                    </div>
                    <div class="score-badge ${getScoreClass(mess.hygieneScore)}">
                        <span class="score-value">${mess.hygieneScore}</span>
                        <span class="score-label">Hygiene</span>
                    </div>
                </div>
                
                <div class="mess-card-footer">
                    <div>
                        <div class="mess-card-price">
                            ₹${mess.pricing.monthly.toLocaleString()}
                            <span class="price-period">/month</span>
                        </div>
                    </div>
                    <div class="mess-card-rating">
                        <span class="rating-stars">⭐</span>
                        <span>${mess.rating} (${mess.reviewCount})</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-poor';
}

function getFoodBadge(foodType) {
    const badges = {
        'veg': '<span class="badge badge-veg">🥗 Veg</span>',
        'non-veg': '<span class="badge badge-non-veg">🍗 Non-Veg</span>',
        'both': '<span class="badge badge-both">🍽️ Both</span>'
    };
    return badges[foodType] || '';
}

function toggleFavorite(messId) {
    console.log('Toggle favorite:', messId);
    // localStorage implementation for favorites
}

// ============================================
// MESS DETAILS PAGE
// ============================================

function loadMessDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    currentMessId = parseInt(urlParams.get('id')) || 1;
    
    const mess = messData.find(m => m.id === currentMessId);
    if (!mess) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Update page content
    document.getElementById('messName').textContent = mess.name;
    document.getElementById('messAddress').textContent = `${mess.address}`;
    document.getElementById('subscriberCount').textContent = mess.subscriberCount;
    document.getElementById('experience').textContent = mess.experience;
    document.getElementById('capacity').textContent = mess.capacity;
    document.getElementById('messDescription').textContent = mess.description;
    
    // Verified badge
    if (mess.verified) {
        document.getElementById('verifiedBadge').style.display = 'inline-block';
    }
    
    // Tags
    const tagsContainer = document.getElementById('messTags');
    tagsContainer.innerHTML = mess.tags.map(tag => 
        `<span class="badge badge-outline">${tag}</span>`
    ).join('');
    
    // Images
    document.getElementById('mainImage').src = mess.images[0];
    const thumbnails = document.getElementById('thumbnails');
    thumbnails.innerHTML = mess.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage(${index})">
            <img src="${img}" alt="Mess image ${index + 1}">
        </div>
    `).join('');
    
    // Menu
    if (mess.menu && mess.menu.length > 0) {
        const menuBody = document.getElementById('menuTableBody');
        menuBody.innerHTML = mess.menu.map(day => `
            <tr>
                <td><strong>${day.day}</strong></td>
                <td>${day.breakfast ? day.breakfast.join(', ') : '-'}</td>
                <td>${day.lunch ? day.lunch.join(', ') : '-'}</td>
                <td>${day.dinner ? day.dinner.join(', ') : '-'}</td>
            </tr>
        `).join('');
    }
    
    // Facilities
    const facilitiesGrid = document.getElementById('facilitiesGrid');
    facilitiesGrid.innerHTML = mess.facilities.map(facility => `
        <div class="facility-item">
            <span class="facility-icon">✓</span>
            <span>${facility}</span>
        </div>
    `).join('');
    
    // Timings
    const timingList = document.getElementById('timingList');
    timingList.innerHTML = mess.timings.map(timing => `
        <div class="timing-item">
            <span class="timing-label">${timing.meal}:</span>
            <span class="timing-value">${timing.time}</span>
        </div>
    `).join('');
    
    // Booking card
    document.getElementById('trustScoreCard').querySelector('.score-value').textContent = mess.trustScore;
    document.getElementById('trustScoreCard').className = `score-badge score-large ${getScoreClass(mess.trustScore)}`;
    
    document.getElementById('hygieneScoreCard').querySelector('.score-value').textContent = mess.hygieneScore;
    document.getElementById('hygieneScoreCard').className = `score-badge score-large ${getScoreClass(mess.hygieneScore)}`;
    
    document.getElementById('cardRating').textContent = mess.rating;
    document.getElementById('cardReviewCount').textContent = mess.reviewCount;
    
    document.getElementById('monthlyPrice').textContent = `₹${mess.pricing.monthly.toLocaleString()}`;
    document.getElementById('weeklyPrice').textContent = `₹${mess.pricing.weekly.toLocaleString()}`;
    document.getElementById('dailyPrice').textContent = `₹${mess.pricing.daily}`;
    
    // Availability
    const available = mess.capacity - mess.subscriberCount;
    const percentage = ((mess.capacity - available) / mess.capacity * 100).toFixed(0);
    document.getElementById('availabilityFill').style.width = `${percentage}%`;
    document.getElementById('availabilityText').textContent = `${available}/${mess.capacity} seats available`;
    
    // Owner contact
    document.getElementById('ownerName').textContent = mess.owner.name;
    document.getElementById('ownerPhone').textContent = mess.owner.phone;
    document.getElementById('ownerPhone').href = `tel:${mess.owner.phone}`;
    document.getElementById('ownerEmail').textContent = mess.owner.email;
    document.getElementById('ownerEmail').href = `mailto:${mess.owner.email}`;
    
    // Reviews
    loadReviews(mess);
    
    // Update price
    updatePrice();
}

function changeMainImage(index) {
    const mess = messData.find(m => m.id === currentMessId);
    currentImageIndex = index;
    document.getElementById('mainImage').src = mess.images[index];
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function prevImage() {
    const mess = messData.find(m => m.id === currentMessId);
    currentImageIndex = (currentImageIndex - 1 + mess.images.length) % mess.images.length;
    changeMainImage(currentImageIndex);
}

function nextImage() {
    const mess = messData.find(m => m.id === currentMessId);
    currentImageIndex = (currentImageIndex + 1) % mess.images.length;
    changeMainImage(currentImageIndex);
}

function updatePrice() {
    const mess = messData.find(m => m.id === currentMessId);
    if (!mess) return;
    
    const selectedPlan = document.querySelector('input[name="plan"]:checked').value;
    const selectedMeals = Array.from(document.querySelectorAll('.meal-checkboxes input:checked')).length;
    
    let basePrice = 0;
    if (selectedPlan === 'monthly') basePrice = mess.pricing.monthly;
    else if (selectedPlan === 'weekly') basePrice = mess.pricing.weekly;
    else basePrice = mess.pricing.daily * 30;
    
    // Adjust for meal selection (assuming base includes 2 meals)
    const mealMultiplier = selectedMeals === 0 ? 0 : selectedMeals / 2;
    const totalPrice = Math.round(basePrice * mealMultiplier);
    
    document.getElementById('totalPrice').textContent = `₹${totalPrice.toLocaleString()}`;
}

function handleSubscribe() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    alert('Subscription feature coming soon! This is a prototype.');
}

function loadReviews(mess) {
    const avgRating = document.getElementById('avgRating');
    const reviewCount = document.getElementById('reviewCount');
    const avgStars = document.getElementById('avgStars');
    
    avgRating.textContent = mess.rating.toFixed(1);
    reviewCount.textContent = `${mess.reviewCount} reviews`;
    avgStars.innerHTML = getStarHTML(mess.rating);
    
    // Rating breakdown
    const breakdown = calculateRatingBreakdown(mess.reviewCount);
    const breakdownContainer = document.getElementById('ratingBreakdown');
    breakdownContainer.innerHTML = Object.entries(breakdown).reverse().map(([stars, count]) => `
        <div class="rating-bar-row">
            <span class="rating-bar-label">${stars}★</span>
            <div class="rating-bar-container">
                <div class="rating-bar-fill" style="width: ${(count/mess.reviewCount*100)}%"></div>
            </div>
            <span class="rating-bar-count">${count}</span>
        </div>
    `).join('');
    
    // Reviews list
    const reviewsList = document.getElementById('reviewsList');
    if (mess.reviews && mess.reviews.length > 0) {
        reviewsList.innerHTML = mess.reviews.map(review => createReviewCard(review)).join('');
    } else {
        reviewsList.innerHTML = '<p style="text-align: center; color: var(--gray-600);">No reviews yet. Be the first to review!</p>';
    }
}

function calculateRatingBreakdown(total) {
    // Dummy distribution
    return {
        5: Math.floor(total * 0.6),
        4: Math.floor(total * 0.25),
        3: Math.floor(total * 0.1),
        2: Math.floor(total * 0.03),
        1: Math.floor(total * 0.02)
    };
}

function getStarHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = '';
    
    for (let i = 0; i < fullStars; i++) {
        html += '★';
    }
    if (hasHalfStar) {
        html += '⯨';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        html += '☆';
    }
    
    return html;
}

function createReviewCard(review) {
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${review.userInitials}</div>
                    <div>
                        <div class="reviewer-name">
                            ${review.userName}
                            ${review.verified ? '<span class="badge badge-verified">✓ Verified</span>' : ''}
                        </div>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating-display">
                    <span class="rating-stars">${getStarHTML(review.rating)}</span>
                    <span>${review.rating.toFixed(1)}</span>
                </div>
            </div>
            
            <p class="review-text">${review.comment}</p>
            
            <div class="review-detailed-ratings">
                <div class="detailed-rating-item">
                    <span class="detailed-rating-label">Food</span>
                    <span class="detailed-rating-value">${review.detailedRatings.food}★</span>
                </div>
                <div class="detailed-rating-item">
                    <span class="detailed-rating-label">Hygiene</span>
                    <span class="detailed-rating-value">${review.detailedRatings.hygiene}★</span>
                </div>
                <div class="detailed-rating-item">
                    <span class="detailed-rating-label">Service</span>
                    <span class="detailed-rating-value">${review.detailedRatings.service}★</span>
                </div>
                <div class="detailed-rating-item">
                    <span class="detailed-rating-label">Value</span>
                    <span class="detailed-rating-value">${review.detailedRatings.value}★</span>
                </div>
            </div>
            
            <div class="review-actions">
                <button class="review-action-btn">👍 Helpful (${review.helpful})</button>
                <button class="review-action-btn">🚩 Report</button>
            </div>
        </div>
    `;
}

function filterReviews(filter) {
    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic (for now just visual)
    console.log('Filter reviews by:', filter);
}

function loadMoreReviews() {
    alert('Load more reviews - feature in progress');
}

// ============================================
// REVIEW MODAL
// ============================================

let reviewRatings = {
    overall: 0,
    food: 0,
    hygiene: 0,
    service: 0,
    value: 0
};

function initStarRatings() {
    document.querySelectorAll('.star-rating').forEach(ratingDiv => {
        const stars = ratingDiv.querySelectorAll('.star');
        const category = ratingDiv.id || ratingDiv.dataset.category || 'overall';
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                reviewRatings[category] = rating;
                
                // Update visual
                stars.forEach((s, index) => {
                    s.classList.toggle('filled', index < rating);
                    s.textContent = index < rating ? '★' : '☆';
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach((s, index) => {
                    s.textContent = index < rating ? '★' : '☆';
                });
            });
        });
        
        ratingDiv.addEventListener('mouseleave', function() {
            const currentRating = reviewRatings[category] || 0;
            stars.forEach((s, index) => {
                s.textContent = index < currentRating ? '★' : '☆';
            });
        });
    });
}

function openReviewModal() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('reviewModal').classList.add('show');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('show');
    // Reset form
    document.getElementById('reviewForm').reset();
    reviewRatings = { overall: 0, food: 0, hygiene: 0, service: 0, value: 0 };
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('filled');
    });
}

function submitReview(event) {
    event.preventDefault();
    
    if (reviewRatings.overall === 0) {
        alert('Please provide an overall rating');
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value;
    const isSubscriber = document.getElementById('isSubscriber').checked;
    
    // Create review object
    const review = {
        rating: reviewRatings.overall,
        text: reviewText,
        isSubscriber: isSubscriber,
        detailedRatings: {
            food: reviewRatings.food || reviewRatings.overall,
            hygiene: reviewRatings.hygiene || reviewRatings.overall,
            service: reviewRatings.service || reviewRatings.overall,
            value: reviewRatings.value || reviewRatings.overall
        }
    };
    
    // Save to localStorage
    const reviews = JSON.parse(localStorage.getItem('trustbite_reviews') || '{}');
    if (!reviews[currentMessId]) reviews[currentMessId] = [];
    reviews[currentMessId].push(review);
    localStorage.setItem('trustbite_reviews', JSON.stringify(reviews));
    
    closeReviewModal();
    alert('Review submitted successfully!');
    
    // Reload reviews
    const mess = messData.find(m => m.id === currentMessId);
    loadReviews(mess);
}

// ============================================
// PROFILE PAGE
// ============================================

function initProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Populate form
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('location').value = user.location || '';
    document.getElementById('college').value = user.college || '';
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');
    event.target.classList.add('active');
}

function toggleEditMode() {
    const inputs = document.querySelectorAll('#profileForm input');
    const formActions = document.getElementById('formActions');
    const editBtn = event.target;
    
    const isDisabled = inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = !isDisabled;
    });
    
    if (isDisabled) {
        formActions.style.display = 'flex';
        editBtn.textContent = 'Cancel Edit';
    } else {
        formActions.style.display = 'none';
        editBtn.textContent = 'Edit Profile';
    }
}

function cancelEdit() {
    toggleEditMode();
    initProfile();
}

// ============================================
// SUBSCRIPTION PAGE
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function viewMessDetails(messId) {
    window.location.href = `mess-details.html?id=${messId}`;
}

function contactOwner(messId) {
    alert('Contact owner feature - coming soon!');
}

function cancelSubscription(messId) {
    if (confirm('Are you sure you want to cancel this subscription?')) {
        alert('Subscription cancelled successfully!');
    }
}

function renewSubscription(messId) {
    alert('Renew subscription - redirecting to mess details...');
    viewMessDetails(messId);
}

function writeReview(messId) {
    window.location.href = `mess-details.html?id=${messId}#reviews`;
}

function editReview(reviewId) {
    alert('Edit review - feature coming soon!');
}

function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        alert('Review deleted successfully!');
    }
}

function changePassword() {
    alert('Change password feature - coming soon!');
}