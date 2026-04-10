/* ===================================================================
 * Glint - Main JS (Vanilla JavaScript)
 *
 * ------------------------------------------------------------------- */

(function() {

    "use strict";

    var cfg = {
        scrollDuration : 800, // smoothscroll duration
        mailChimpURL   : ''   // Insert your live mailchimp form action here later
    };


   /* Preloader
    * -------------------------------------------------- */
    var clPreloader = function() {

        document.documentElement.classList.add('cl-preload');

        window.addEventListener('load', function() {
            var loader = document.getElementById('loader');
            var preloader = document.getElementById('preloader');

            // Fade out the loader first
            loader.classList.add('fade-out');

            // After loader fades, fade out the preloader
            setTimeout(function() {
                preloader.classList.add('fade-out');
            }, 300);

            // For hero content animations
            document.documentElement.classList.remove('cl-preload');
            document.documentElement.classList.add('cl-loaded');
        });
    };


   /* Menu on Scrolldown
    * ------------------------------------------------------ */
    var clMenuOnScrolldown = function() {

        var menuTrigger = document.querySelector('.header-menu-toggle');
        if (!menuTrigger) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 150) {
                menuTrigger.classList.add('opaque');
            } else {
                menuTrigger.classList.remove('opaque');
            }
        });
    };


   /* OffCanvas Menu
    * ------------------------------------------------------ */
    var clOffCanvas = function() {

        var menuTrigger = document.querySelector('.header-menu-toggle');
        var nav = document.querySelector('.header-nav');
        var closeButton = nav ? nav.querySelector('.header-nav__close') : null;

        if (!menuTrigger || !nav) return;

        // open-close menu by clicking on the menu icon
        menuTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('menu-is-open');
        });

        // close menu by clicking the close button
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                document.body.classList.remove('menu-is-open');
            });
        }

        // close menu clicking outside the menu itself
        document.body.addEventListener('click', function(e) {
            var target = e.target;
            var isMenuElement = target.closest('.header-nav') ||
                               target.closest('.header-menu-toggle');
            if (!isMenuElement) {
                document.body.classList.remove('menu-is-open');
            }
        });

    };


   /* photoswipe
    * ----------------------------------------------------- */
    var clPhotoswipe = function() {
        // PhotoSwipe 5.x initialization
        var lightbox = new PhotoSwipeLightbox({
            gallery: '.works-content',
            children: '.thumb-link',
            pswpModule: PhotoSwipe,

            // UI options
            bgOpacity: 1,
            showHideAnimationType: 'fade',

            // padding
            paddingFn: function(viewportSize) {
                return { top: 30, bottom: 30, left: 70, right: 70 };
            }
        });

        // Add caption from data attributes
        lightbox.on('uiRegister', function() {
            lightbox.pswp.ui.registerElement({
                name: 'caption',
                order: 9,
                isButton: false,
                appendTo: 'root',
                html: '',
                onInit: function(el, pswp) {
                    lightbox.pswp.on('change', function() {
                        var currSlideElement = lightbox.pswp.currSlide.data.element;
                        if (currSlideElement) {
                            var folio = currSlideElement.closest('.item-folio');
                            var titleEl = folio ? folio.querySelector('.item-folio__title') : null;
                            var captionEl = folio ? folio.querySelector('.item-folio__caption') : null;
                            var title = titleEl ? titleEl.textContent.trim() : '';
                            var caption = captionEl ? captionEl.innerHTML : '';
                            el.innerHTML = '<div class="pswp__caption__center"><h4>' + title + '</h4>' + caption + '</div>';
                        }
                    });
                }
            });
        });

        lightbox.init();
    };
    

   /* Stat Counter (Intersection Observer)
    * Replaces Waypoints.js with native browser API
    * ------------------------------------------------------ */
    var clStatCount = function() {

        var statSection = document.querySelector('.about-stats');
        var stats = document.querySelectorAll('.stats__count');

        if (!statSection || !stats.length) return;

        // Animation function using requestAnimationFrame
        function animateCounter(element, target) {
            var start = 0;
            var duration = 4000;
            var startTime = null;

            function easeOutQuad(t) {
                return t * (2 - t);
            }

            function step(currentTime) {
                if (!startTime) startTime = currentTime;
                var progress = Math.min((currentTime - startTime) / duration, 1);
                var easedProgress = easeOutQuad(progress);
                var current = Math.ceil(easedProgress * target);
                element.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        }

        // Use Intersection Observer to trigger animation
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    stats.forEach(function(stat) {
                        var target = parseInt(stat.textContent, 10);
                        animateCounter(stat, target);
                    });
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        observer.observe(statSection);
    };



   /* Smooth Scrolling (native CSS scroll-behavior)
    * Handles menu closing when clicking nav links
    * ------------------------------------------------------ */
    var clSmoothScroll = function() {

        var smoothLinks = document.querySelectorAll('.smoothscroll');

        smoothLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var target = this.getAttribute('href');

                // Close menu if open
                if (document.body.classList.contains('menu-is-open')) {
                    document.body.classList.remove('menu-is-open');
                }
            });
        });

    };


   /* Contact Form
    * Native validation + fetch API
    * ------------------------------------------------------ */
    var clContactForm = function() {

        var sLoader = document.querySelector('.submit-loader');
        var msgWarning = document.querySelector('.message-warning');
        var msgSuccess = document.querySelector('.message-success');
        var contactForm = document.getElementById('contactForm');

        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Use native HTML5 validation
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            // Show loader
            sLoader.classList.add('is-visible');

            // Send via fetch
            var formData = new FormData(contactForm);

            fetch('inc/sendEmail.php', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.text();
            })
            .then(function(msg) {
                // Message was sent
                if (msg === 'OK') {
                    sLoader.classList.remove('is-visible');
                    msgWarning.classList.remove('is-visible');
                    contactForm.classList.add('fade-out');
                    msgSuccess.classList.add('is-visible');
                }
                // There was an error
                else {
                    sLoader.classList.remove('is-visible');
                    msgWarning.innerHTML = msg;
                    msgWarning.classList.add('is-visible');
                }
            })
            .catch(function() {
                sLoader.classList.remove('is-visible');
                msgWarning.innerHTML = "Something went wrong. Please try again.";
                msgWarning.classList.add('is-visible');
            });
        });
    };


   /* Scroll Animations (Intersection Observer)
    * Replaces AOS.js with native browser API
    * ------------------------------------------------------ */
    var clScrollAnimations = function() {

        var animatedElements = document.querySelectorAll('[data-animate]');

        if (!animatedElements.length) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animatedElements.forEach(function(el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        animatedElements.forEach(function(el) {
            observer.observe(el);
        });

    };


   /* Newsletter Subscription (Laravel API)
    * ------------------------------------------------------ */
    var clMailchimpSubscribe = function() {

        var form = document.getElementById('mc-form');
        var messageEl = form ? form.querySelector('.subscribe-message') : null;
        var submitBtn = form ? form.querySelector('input[type="submit"]') : null;

        if (!form || !messageEl || !submitBtn) return;

        // Response messages
        var messages = {
            submitting: 'Submitting...',
            success: '<i class="fa-solid fa-check"></i> Thanks! You are on the waitlist.',
            error: '<i class="fa-solid fa-triangle-exclamation"></i> Network error. Please try again later.',
            invalidEmail: '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a valid e-mail address.'
        };

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            var emailInput = form.querySelector('input[type="email"]');
            var email = emailInput ? emailInput.value : '';

            // Basic email validation
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                messageEl.style.color = '#ff6163';
                messageEl.innerHTML = messages.invalidEmail;
                return;
            }

            messageEl.style.color = '#26A69A';
            messageEl.innerHTML = messages.submitting;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';

            try {
                var payload = { email: email };
                var isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
                var endpoint = isLocal ? 'http://127.0.0.1:8000/api/newsletter-waitlist' : 'https://mediadmin.debuglabdigital.com/api/newsletter-waitlist';

                var response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                var data = await response.json();

                if (data.status === 'success') {
                    messageEl.style.color = '#26A69A';
                    messageEl.innerHTML = messages.success;
                    emailInput.value = '';
                } else {
                    messageEl.style.color = '#ff6163';
                    messageEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + (data.message || 'Error subscribing.');
                }
            } catch (err) {
                messageEl.style.color = '#ff6163';
                messageEl.innerHTML = messages.error;
            } finally {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });

    };


   /* Back to Top
    * ------------------------------------------------------ */
    var clBackToTop = function() {

        var pxShow = 500;
        var goTopButton = document.querySelector('.go-top');

        // Show or hide the sticky footer button
        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                goTopButton.classList.add('is-visible');
            } else {
                goTopButton.classList.remove('is-visible');
            }
        });
    };


   /* Testimonials Slider
    * ------------------------------------------------------ */
    var clTestimonials = function() {

        var container = document.querySelector('.testimonials');
        var slides = document.querySelectorAll('.testimonials__slide');
        var dots = document.querySelectorAll('.testimonials__dot');
        var prevBtn = document.querySelector('.testimonials__nav--prev');
        var nextBtn = document.querySelector('.testimonials__nav--next');
        var currentIndex = 0;

        if (!slides.length) return;

        function showSlide(index) {
            // Wrap around
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;

            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === currentIndex);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === currentIndex);
            });
        }

        // Dot navigation
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var slideIndex = parseInt(this.getAttribute('data-slide'), 10);
                showSlide(slideIndex);
            });
        });

        // Arrow navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                showSlide(currentIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                showSlide(currentIndex + 1);
            });
        }

        // Touch/swipe support for testimonials
        var touchStartX = 0;
        var touchEndX = 0;

        container.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    showSlide(currentIndex + 1); // Swipe left = next
                } else {
                    showSlide(currentIndex - 1); // Swipe right = prev
                }
            }
        }, { passive: true });

    };


   /* Clients Logo Carousel
    * CSS animation with drag/swipe support
    * ------------------------------------------------------ */
    var clClientsCarousel = function() {

        var container = document.querySelector('.clients');
        if (!container) return;

        var isDragging = false;
        var startX = 0;
        var currentX = 0;
        var dragOffset = 0;
        var animationOffset = 0;
        var halfWidth = 0;

        // Calculate half width for infinite loop
        function updateHalfWidth() {
            halfWidth = container.scrollWidth / 2;
        }
        updateHalfWidth();

        // Get current translateX from the animation
        function getCurrentTranslateX() {
            var style = window.getComputedStyle(container);
            var matrix = style.transform;
            if (matrix === 'none') return 0;
            var values = matrix.match(/matrix.*\((.+)\)/);
            if (values) {
                var parts = values[1].split(', ');
                return parseFloat(parts[4]) || 0;
            }
            return 0;
        }

        // Apply manual transform
        function setTransform(x) {
            // Wrap around for infinite effect
            while (x < -halfWidth) x += halfWidth;
            while (x > 0) x -= halfWidth;
            container.style.transform = 'translateX(' + x + 'px)';
        }

        // Start drag
        function startDrag(clientX) {
            isDragging = true;
            startX = clientX;
            animationOffset = getCurrentTranslateX();
            container.style.animation = 'none';
            container.classList.add('is-dragging');
        }

        // During drag
        function onDrag(clientX) {
            if (!isDragging) return;
            currentX = clientX;
            dragOffset = currentX - startX;
            setTransform(animationOffset + dragOffset);
        }

        // End drag
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            container.classList.remove('is-dragging');

            // Calculate where we are as a percentage of the animation
            var currentPos = animationOffset + dragOffset;
            // Normalize to 0 to -halfWidth range
            while (currentPos < -halfWidth) currentPos += halfWidth;
            while (currentPos > 0) currentPos -= halfWidth;

            var percentage = Math.abs(currentPos / halfWidth) * 100;

            // Resume CSS animation from current position
            container.style.transform = '';
            container.style.animation = 'clients-scroll 20s linear infinite';
            container.style.animationDelay = '-' + (percentage * 0.2) + 's';
        }

        // Mouse events
        container.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startDrag(e.clientX);
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                e.preventDefault();
                onDrag(e.clientX);
            }
        });

        document.addEventListener('mouseup', function() {
            endDrag();
        });

        // Touch events
        container.addEventListener('touchstart', function(e) {
            startDrag(e.touches[0].clientX);
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            onDrag(e.touches[0].clientX);
        }, { passive: true });

        container.addEventListener('touchend', function() {
            endDrag();
        }, { passive: true });

        // Recalculate on resize
        window.addEventListener('resize', updateHalfWidth);

    };


    /* Update Copyright Year
    * ------------------------------------------------------ */
    var clUpdateYear = function() {
        var yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };

   /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        clPreloader();
        clMenuOnScrolldown();
        clOffCanvas();
        clPhotoswipe();
        clStatCount();
        clSmoothScroll();
        clContactForm();
        clScrollAnimations();
        clMailchimpSubscribe();
        clBackToTop();
        clTestimonials();
        clClientsCarousel();
        clUpdateYear();

    })();

})();