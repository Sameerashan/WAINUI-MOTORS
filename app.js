/* ==========================================
   WAINUI MOTORS - PREMIUM WEB APPLICATION LOGIC (JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application components
    initTabNavigation();
    initMobileMenu();
    initHeaderScroll();
    initBookingForm();
    loadExistingBookings();
});

/**
 * 1. SPA Tab Navigation Logic
 */
function initTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn, .footer-links button');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = btn.getAttribute('data-tab') || 'services'; // fallback for footer buttons
            switchTab(targetTab);
        });
    });
}

// Global function to allow inline onclick handlers to function
window.switchTab = function(tabId) {
    // 1. Get all tab content elements
    const tabs = document.querySelectorAll('.tab-content');
    const navBtns = document.querySelectorAll('.nav-btn');
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    
    // 2. Deactivate all tabs & buttons
    tabs.forEach(tab => tab.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    mobileNavBtns.forEach(btn => btn.classList.remove('active'));
    
    // 3. Activate target tab
    const targetElement = document.getElementById(tabId);
    if (targetElement) {
        targetElement.classList.add('active');
        
        // Match nav items
        document.querySelectorAll(`.nav-btn[data-tab="${tabId}"]`).forEach(btn => btn.classList.add('active'));
        document.querySelectorAll(`.mobile-nav-btn[data-tab="${tabId}"]`).forEach(btn => btn.classList.add('active'));
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 4. Close mobile overlay if open
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const toggleIcon = document.querySelector('.mobile-menu-toggle i');
    if (mobileOverlay && mobileOverlay.classList.contains('open')) {
        mobileOverlay.classList.remove('open');
        toggleIcon.className = 'fa-solid fa-bars';
    }
};

// Global function to pre-select a service from service cards
window.bookServicePreselected = function(serviceName) {
    const serviceSelect = document.getElementById('booking-service');
    if (serviceSelect) {
        // Pre-select service in dropdown
        serviceSelect.value = serviceName;
    }
    // Switch to booking tab
    switchTab('booking');
};


/**
 * 2. Mobile Hamburger Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const toggleIcon = menuToggle.querySelector('i');
    
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileOverlay.classList.toggle('open');
        toggleIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
}


/**
 * 3. Header Scroll Transformation
 */
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}


/**
 * 4. Booking Form Logic, Validation & LocalStorage
 */
function initBookingForm() {
    const form = document.getElementById('booking-form');
    const dateInput = document.getElementById('booking-date');
    const plateInput = document.getElementById('booking-plate');
    
    if (!form) return;

    // Set minimum date to today so users cannot book past dates
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Auto uppercase license plate and restrict length / characters
    plateInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();
        // Remove non-alphanumeric chars
        value = value.replace(/[^A-Z0-9]/g, '');
        e.target.value = value;
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm(form)) {
            // Success - Process data
            const newBooking = {
                id: 'WN-' + Math.floor(1000 + Math.random() * 9000), // Random 4 digit booking ID
                name: document.getElementById('booking-name').value.trim(),
                phone: document.getElementById('booking-phone').value.trim(),
                email: document.getElementById('booking-email').value.trim() || 'N/A',
                service: document.getElementById('booking-service').value,
                plate: document.getElementById('booking-plate').value.trim().toUpperCase(),
                make: document.getElementById('booking-make').value.trim() || 'Generic Vehicle',
                date: document.getElementById('booking-date').value,
                time: document.getElementById('booking-time').value,
                notes: document.getElementById('booking-notes').value.trim() || 'None',
                status: 'Pending Confirmation',
                timestamp: new Date().getTime()
            };

            // Save to LocalStorage
            saveBooking(newBooking);
            
            // Show Success Modal
            showSuccessModal(newBooking);
            
            // Reset form fields
            form.reset();
            
            // Re-render list
            loadExistingBookings();
        }
    });

    // Clean errors on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('has-error');
        });
        input.addEventListener('change', () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('has-error');
        });
    });
}

function validateForm(form) {
    let isValid = true;
    
    // Required inputs
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        const value = input.value.trim();
        const group = input.closest('.form-group');
        
        if (!value) {
            isValid = false;
            if (group) group.classList.add('has-error');
        } else {
            if (group) group.classList.remove('has-error');
        }
    });

    // Phone format basic check
    const phoneInput = document.getElementById('booking-phone');
    if (phoneInput && phoneInput.value.trim()) {
        const phone = phoneInput.value.trim();
        const group = phoneInput.closest('.form-group');
        // Very basic phone validation (numbers, spaces, +, dashes, min 6 digits)
        const phoneRegex = /^[0-9+\s-]{6,15}$/;
        if (!phoneRegex.test(phone)) {
            isValid = false;
            if (group) {
                group.classList.add('has-error');
                const errorSpan = group.querySelector('.error-msg');
                if (errorSpan) errorSpan.textContent = 'Please enter a valid phone number (e.g. 022 156 3723)';
            }
        }
    }

    // Email format check (only if entered)
    const emailInput = document.getElementById('booking-email');
    if (emailInput && emailInput.value.trim()) {
        const email = emailInput.value.trim();
        const group = emailInput.closest('.form-group');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            isValid = false;
            if (group) group.classList.add('has-error');
        }
    }

    return isValid;
}

/**
 * 5. LocalStorage Bookings Handling
 */
function saveBooking(booking) {
    let bookings = [];
    const stored = localStorage.getItem('wainui_bookings');
    if (stored) {
        try {
            bookings = JSON.parse(stored);
        } catch (e) {
            bookings = [];
        }
    }
    bookings.unshift(booking); // Add newest booking at the top
    localStorage.setItem('wainui_bookings', JSON.stringify(bookings));
}

function loadExistingBookings() {
    const container = document.getElementById('bookings-list-container');
    if (!container) return;

    let bookings = [];
    const stored = localStorage.getItem('wainui_bookings');
    if (stored) {
        try {
            bookings = JSON.parse(stored);
        } catch (e) {
            bookings = [];
        }
    }

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-bookings-state">
                <i class="fa-regular fa-calendar-xmark"></i>
                <p>You have no pending booking requests saved in this browser session.</p>
                <p class="small-text">Submit the form on the left to schedule your repair.</p>
            </div>
        `;
        return;
    }

    // Render bookings list
    let html = '';
    bookings.forEach(b => {
        // Format date beautifully
        const dateObj = new Date(b.date);
        const formattedDate = dateObj.toLocaleDateString('en-NZ', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        html += `
            <div class="booking-card" id="card-${b.id}">
                <div class="booking-card-header">
                    <span class="booking-ref">${b.id}</span>
                    <span class="booking-status">${b.status}</span>
                </div>
                <div class="booking-card-body">
                    <p><i class="fa-solid fa-gears"></i> <strong>${b.service}</strong></p>
                    <p><i class="fa-regular fa-calendar"></i> ${formattedDate} at ${b.time}</p>
                    <p><i class="fa-solid fa-car"></i> ${b.make} <span class="plate-badge">${b.plate}</span></p>
                </div>
                <div class="booking-card-footer">
                    <button class="cancel-booking-btn" onclick="cancelBooking('${b.id}')">
                        <i class="fa-regular fa-trash-can"></i> Cancel Request
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Cancel Booking logic (global so inline onclick can access it)
window.cancelBooking = function(bookingId) {
    if (confirm(`Are you sure you want to cancel booking request ${bookingId}?`)) {
        let bookings = [];
        const stored = localStorage.getItem('wainui_bookings');
        if (stored) {
            try {
                bookings = JSON.parse(stored);
            } catch (e) {
                bookings = [];
            }
        }
        
        // Filter out cancelled booking
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('wainui_bookings', JSON.stringify(bookings));
        
        // Re-render
        loadExistingBookings();
    }
};

/**
 * 6. Success Modal Functions
 */
function showSuccessModal(booking) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    // Fill details
    document.getElementById('modal-client-name').textContent = booking.name;
    document.getElementById('modal-ref-num').textContent = booking.id;
    document.getElementById('modal-service').textContent = booking.service;
    
    // Format date nicely
    const dateObj = new Date(booking.date);
    const formattedDate = dateObj.toLocaleDateString('en-NZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById('modal-date-time').textContent = `${formattedDate} @ ${booking.time}`;
    document.getElementById('modal-plate').textContent = booking.plate;

    // Open Modal
    modal.classList.add('open');
}

window.closeSuccessModal = function() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('open');
    }
};
