// Main JavaScript file for The Artisan's Chair website
// Handles animations, interactions, and functionality

// Global variables
let currentStep = 1;
const totalSteps = 4;
let bookingData = {
    service: null,
    barber: null,
    date: null,
    time: null,
    clientInfo: {}
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeNavigation();
   initializePageSpecificFeatures();
    initMap();
});

// Animation initialization
function initializeAnimations() {
    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Page-specific feature initialization
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomepage();
            break;
        case 'services.html':
            initServices();
            break;
        case 'booking.html':
            initBooking();
            break;
        case 'barbers.html':
            initBarberProfiles();
            break;
        case 'gallery.html':
            initGallery();
            initLightbox();
            break;
        case 'contact.html':
            initContactForm();
            break;
    }
}

// Homepage specific features
function initHomepage() {
    // Hero text animation
    anime({
        targets: '.hero-title',
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        delay: 500,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: 800,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: '.hero-cta',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 1200,
        easing: 'easeOutQuad'
    });
}

// Services page features
function initServices() {
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const serviceCards = document.querySelectorAll('.service-card[data-category]');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            });
            this.classList.add('active');
            this.classList.remove('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            
            // Filter services
            serviceCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    anime({
                        targets: card,
                        opacity: [0, 1],
                        scale: [0.9, 1],
                        duration: 500,
                        easing: 'easeOutQuad'
                    });
                } else {
                    anime({
                        targets: card,
                        opacity: 0,
                        scale: 0.9,
                        duration: 300,
                        easing: 'easeInQuad',
                        complete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });
    
    // Book service buttons
    document.querySelectorAll('.book-service').forEach(btn => {
        btn.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            const price = this.getAttribute('data-price');
            window.location.href = `booking.html?service=${encodeURIComponent(service)}&price=${price}`;
        });
    });
}

// Booking system
function initBooking() {
    // Check for pre-selected service/barber from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedService = urlParams.get('service');
    const preSelectedBarber = urlParams.get('barber');
    const preSelectedPrice = urlParams.get('price');
    
    if (preSelectedService && preSelectedPrice) {
        bookingData.service = {
            name: preSelectedService,
            price: parseInt(preSelectedPrice),
            duration: '45 minutes'
        };
        enableNextButton('next-step-1');
    }
    
    // Service selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                bookingData.service = null;
                document.getElementById('next-step-1').disabled = true;
            } else {
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                const serviceName = this.querySelector('h3').textContent;
                const servicePrice = parseInt(this.querySelector('.price-highlight').textContent.replace('$', ''));
                const serviceDuration = this.querySelector('.text-sm span').textContent;
                
                bookingData.service = {
                    name: serviceName,
                    price: servicePrice,
                    duration: serviceDuration
                };
                
                enableNextButton('next-step-1');
            }
        });
    });
    
    // Barber selection
    document.querySelectorAll('.barber-card').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                bookingData.barber = null;
                document.getElementById('next-step-2').disabled = true;
            } else {
                document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                const barberName = this.querySelector('h3').textContent;
                const barberId = this.getAttribute('data-barber') || 'default';
                
                bookingData.barber = {
                    name: barberName,
                    id: barberId
                };
                
                enableNextButton('next-step-2');
            }
        });
    });
    
    // Calendar generation
    function generateCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        calendar.innerHTML = '';
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Generate next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day p-3 text-center cursor-pointer rounded-lg border-2 border-steel-gray';
            dayElement.textContent = date.getDate();
            dayElement.setAttribute('data-date', date.toISOString().split('T')[0]);
            
            // Disable Sundays
            if (date.getDay() === 0) {
                dayElement.classList.add('unavailable');
            } else {
                dayElement.addEventListener('click', function() {
                    selectDate(date);
                });
            }
            
            calendar.appendChild(dayElement);
        }
    }
    
    function selectDate(date) {
        bookingData.date = date;
        updateDateSelection();
        generateTimeSlots(date);
    }
    
    function updateDateSelection() {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
    
    function generateTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;
        
        timeSlotsContainer.innerHTML = '';
        
        const timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
        ];
        
        timeSlots.forEach(time => {
            const timeElement = document.createElement('div');
            timeElement.className = 'time-slot p-3 text-center cursor-pointer rounded-lg border-2 border-steel-gray';
            timeElement.textContent = time;
            
            // Randomly make some slots unavailable for demo
            if (Math.random() > 0.7) {
                timeElement.classList.add('unavailable');
            } else {
                timeElement.addEventListener('click', function() {
                    selectTime(time);
                });
            }
            
            timeSlotsContainer.appendChild(timeElement);
        });
    }
    
    function selectTime(time) {
        bookingData.time = time;
        updateTimeSelection();
        enableNextButton('next-step-3');
    }
    
    function updateTimeSelection() {
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
    
    // Step navigation
    function enableNextButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
        }
    }
    
    // Next step buttons
    document.getElementById('next-step-1')?.addEventListener('click', () => goToStep(2));
    document.getElementById('next-step-2')?.addEventListener('click', () => goToStep(3));
    document.getElementById('next-step-3')?.addEventListener('click', () => goToStep(4));
    
    // Back step buttons
    document.getElementById('back-step-2')?.addEventListener('click', () => goToStep(1));
    document.getElementById('back-step-3')?.addEventListener('click', () => goToStep(2));
    document.getElementById('back-step-4')?.addEventListener('click', () => goToStep(3));
    
    function goToStep(step) {
        // Hide current step
        document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
        
        // Show target step
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Update progress indicators
        updateProgressIndicators(step);
        
        // Generate calendar if going to step 3
        if (step === 3) {
            generateCalendar();
        }
        
        // Update booking summary if going to step 4
        if (step === 4) {
            updateBookingSummary();
        }
        
        currentStep = step;
    }
    
    function updateProgressIndicators(step) {
        for (let i = 1; i <= totalSteps; i++) {
            const indicator = document.getElementById(`step-${i}-indicator`);
            const progress = document.getElementById(`progress-${i}-${i+1}`);
            
            if (indicator) {
                if (i < step) {
                    indicator.classList.add('completed');
                    indicator.classList.remove('active');
                } else if (i === step) {
                    indicator.classList.add('active');
                    indicator.classList.remove('completed');
                } else {
                    indicator.classList.remove('active', 'completed');
                }
            }
            
            if (progress && i < step) {
                progress.style.background = 'linear-gradient(135deg, #d4af37, #8b6914)';
            }
        }
    }
    
    function updateBookingSummary() {
        const summaryContainer = document.getElementById('booking-summary');
        const totalPriceElement = document.getElementById('total-price');
        
        if (summaryContainer && bookingData.service && bookingData.barber) {
            summaryContainer.innerHTML = `
                <div class="flex justify-between">
                    <span>Service:</span>
                    <span class="font-semibold">${bookingData.service.name}</span>
                </div>
                <div class="flex justify-between">
                    <span>Duration:</span>
                    <span>${bookingData.service.duration}</span>
                </div>
                <div class="flex justify-between">
                    <span>Barber:</span>
                    <span class="font-semibold">${bookingData.barber.name}</span>
                </div>
                <div class="flex justify-between">
                    <span>Date:</span>
                    <span>${bookingData.date ? bookingData.date.toLocaleDateString() : 'Not selected'}</span>
                </div>
                <div class="flex justify-between">
                    <span>Time:</span>
                    <span>${bookingData.time || 'Not selected'}</span>
                </div>
            `;
            
            totalPriceElement.textContent = `$${bookingData.service.price}`;
        }
    }
    
    // Form submission
    document.getElementById('booking-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect client info
        bookingData.clientInfo = {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            requests: document.getElementById('special-requests').value
        };
        
        // Show success step
        showBookingConfirmation();
    });
    
    function showBookingConfirmation() {
        document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
        document.getElementById('success-step').classList.add('active');
        
        // Update confirmation details
        const confirmationDetails = document.getElementById('confirmation-details');
        if (confirmationDetails) {
            confirmationDetails.innerHTML = `
                <h4 class="font-semibold mb-4 text-antique-gold">Appointment Confirmed</h4>
                <div class="space-y-2 text-sm">
                    <div><strong>Service:</strong> ${bookingData.service.name}</div>
                    <div><strong>Barber:</strong> ${bookingData.barber.name}</div>
                    <div><strong>Date:</strong> ${bookingData.date.toLocaleDateString()}</div>
                    <div><strong>Time:</strong> ${bookingData.time}</div>
                    <div><strong>Client:</strong> ${bookingData.clientInfo.name}</div>
                    <div><strong>Email:</strong> ${bookingData.clientInfo.email}</div>
                    <div><strong>Total:</strong> $${bookingData.service.price}</div>
                </div>
            `;
        }
    }
    
    // Initialize booking system
    generateCalendar();
}

// Barber Profiles (Barbers Page)
function initBarberProfiles() {
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const barberCards = document.querySelectorAll('.barber-card[data-category]');
    const portfolioBtns = document.querySelectorAll('.view-portfolio');
    const bookBarberBtns = document.querySelectorAll('.book-barber');
    
    // Filter barbers
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            });
            this.classList.add('active');
            this.classList.remove('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            
            // Filter barbers
            barberCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    anime({
                        targets: card,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 500,
                        easing: 'easeOutQuad'
                    });
                } else {
                    anime({
                        targets: card,
                        opacity: 0,
                        translateY: 20,
                        duration: 300,
                        easing: 'easeInQuad',
                        complete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });
    
    // Portfolio modal
    portfolioBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const barberId = this.getAttribute('data-barber');
            showPortfolioModal(barberId);
        });
    });
    
    // Book barber buttons
    bookBarberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const barberId = this.getAttribute('data-barber');
            window.location.href = `booking.html?barber=${barberId}`;
        });
    });
     
    function showPortfolioModal(barberId) {
        const modal = document.getElementById('portfolio-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        // Portfolio data for each barber
        const portfolios = {
            marcus: {
                name: 'Marcus Rodriguez',
                works: [
                    { title: 'Classic Gentleman Cut', image: 'resources/service-haircut.jpg', description: 'Traditional scissor work with modern styling' },
                    { title: 'Hot Towel Shave', image: 'resources/service-shave.jpg', description: 'Luxury straight razor experience' },
                    { title: 'Beard Masterpiece', image: 'resources/service-beard.jpg', description: 'Precision beard sculpting' }
                ]
            },
            alex: {
                name: 'Alex Chen',
                works: [
                    { title: 'Modern Fade', image: 'resources/interior-1.jpg', description: 'Contemporary fade with sharp lines' },
                    { title: 'Textured Crop', image: 'resources/barber-2.jpg', description: 'Trendy textured styling' },
                    { title: 'Skin Fade', image: 'resources/service-haircut.jpg', description: 'Perfect skin fade execution' }
                ]
            },
            james: {
                name: 'James Thompson',
                works: [
                    { title: 'Traditional Cut', image: 'resources/barber-3.jpg', description: 'Classic gentlemen\'s haircut' },
                    { title: 'Royal Shave', image: 'resources/service-shave.jpg', description: 'Traditional hot towel shave' },
                    { title: 'Beard Trim', image: 'resources/service-beard.jpg', description: 'Classic beard maintenance' }
                ]
            },
            ryan: {
                name: 'Ryan Mitchell',
                works: [
                    { title: 'Creative Styling', image: 'resources/barber-4.jpg', description: 'Artistic approach to men\'s hair' },
                    { title: 'Beard Sculpting', image: 'resources/service-beard.jpg', description: 'Modern beard design' },
                    { title: 'Color Service', image: 'resources/interior-3.jpg', description: 'Premium hair coloring' }
                ]
            }
        };
        
        const portfolio = portfolios[barberId];
        if (portfolio) {
            modalTitle.textContent = `${portfolio.name} - Portfolio`;
            
            modalContent.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${portfolio.works.map(work => `
                        <div class="bg-warm-beige bg-opacity-10 rounded-lg overflow-hidden">
                            <img src="${work.image}" alt="${work.title}" class="w-full h-48 object-cover">
                            <div class="p-4">
                                <h4 class="font-semibold mb-2">${work.title}</h4>
                                <p class="text-sm text-warm-beige">${work.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            modal.classList.add('active');
        }
    }
    
    // Close modal
    document.getElementById('close-modal')?.addEventListener('click', function() {
        document.getElementById('portfolio-modal').classList.remove('active');
    });
    
    // Close modal on background click
    document.getElementById('portfolio-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// Gallery (Gallery Page)
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const galleryItems = document.querySelectorAll('.gallery-item[data-category]');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            });
            this.classList.add('active');
            this.classList.remove('text-antique-gold', 'hover:bg-antique-gold', 'hover:text-charcoal');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    anime({
                        targets: item,
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        duration: 500,
                        easing: 'easeOutQuad'
                    });
                } else {
                    anime({
                        targets: item,
                        opacity: 0,
                        scale: 0.8,
                        duration: 300,
                        easing: 'easeInQuad',
                        complete: () => {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        });
    });
}

// Lightbox functionality
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentImageIndex = 0;
    let galleryImages = [];
    
    // Collect all gallery images
    function updateGalleryImages() {
        galleryImages = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"]) img'));
    }
    
    // Open lightbox
    document.addEventListener('click', function(e) {
        if (e.target.closest('.gallery-item')) {
            e.preventDefault();
            updateGalleryImages();
            const clickedImage = e.target.closest('.gallery-item').querySelector('img');
            currentImageIndex = galleryImages.indexOf(clickedImage);
            showLightboxImage();
            lightbox.classList.add('active');
        }
    });
    
    // Close lightbox
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // Navigation
    lightboxPrev?.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        showLightboxImage();
    });
    
    lightboxNext?.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        showLightboxImage();
    });
    
    function showLightboxImage() {
        if (galleryImages[currentImageIndex]) {
            lightboxImage.src = galleryImages[currentImageIndex].src;
            lightboxImage.alt = galleryImages[currentImageIndex].alt;
        }
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                lightboxPrev.click();
            } else if (e.key === 'ArrowRight') {
                lightboxNext.click();
            }
        }
    });
}

// Contact Form (Contact Page)
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Show success message
            showContactSuccess();
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    function showContactSuccess() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'bg-antique-gold text-charcoal p-4 rounded-lg mt-4 font-semibold text-center';
        successDiv.innerHTML = `
            <div class="flex items-center justify-center">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.415L8 9.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Message sent successfully! We'll get back to you soon.
            </div>
        `;
        
        contactForm.appendChild(successDiv);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Map (Contact Page)
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Initialize Leaflet map
    const map = L.map('map').setView([40.7128, -74.0060], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add marker for barbershop
    const marker = L.marker([40.7128, -74.0060]).addTo(map);
    marker.bindPopup('<b>The Artisan\'s Chair</b><br>123 Premium Avenue<br>Downtown District').openPopup();
}

// Testimonial Slider (Homepage)
function initTestimonialSlider() {
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (testimonialSlider) {
        new Splide(testimonialSlider, {
            type: 'loop',
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            arrows: false,
            pagination: true
        }).mount();
    }
}

// Initialize testimonial slider
initTestimonialSlider();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add to calendar functionality
document.getElementById('add-to-calendar')?.addEventListener('click', function() {
    // Create calendar event data
    const eventData = {
        title: `Appointment at The Artisan's Chair`,
        start: new Date(), // This would be the actual appointment date
        duration: 60, // minutes
        description: 'Premium grooming appointment'
    };
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(eventData.description)}`;
    
    window.open(googleCalendarUrl, '_blank');
});

// Quick book buttons
document.querySelectorAll('.book-service').forEach(btn => {
    btn.addEventListener('click', function() {
        const service = this.getAttribute('data-service');
        const price = this.getAttribute('data-price');
        window.location.href = `booking.html?service=${encodeURIComponent(service)}&price=${price}`;
    });
});

// Quick call button for mobile
document.querySelector('.quick-call-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'tel:+1234567890';
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

console.log('The Artisan\'s Chair website loaded successfully!');
