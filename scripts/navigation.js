// Page navigation and animations
import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.25.0/+esm";

// Default gradient colors
const DEFAULT_COLORS = [0xF5E6D3, 0xD4A574, 0xC9A882, 0x8B6F47];

let currentPageIndex = 0;
const pages = document.querySelectorAll('.page');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Animate text on initial page load
function animatePageText(page) {
    const textElements = page.querySelectorAll('.animate-text');

    // Separate number-stat elements from regular text
    const regularTextElements = [];
    const numberStatElements = [];

    textElements.forEach(el => {
        if (el.classList.contains('number-stat')) {
            numberStatElements.push(el);
        } else {
            regularTextElements.push(el);
        }
    });

    // Animate all text elements (including number-stats)
    const textAnimation = animate(
        textElements,
        {
            opacity: [0, 0.9],
            y: [30, 0]
        },
        {
            duration: 0.8,
            delay: stagger(0.2),
            easing: [0.22, 1, 0.36, 1]
        }
    );

    // Start number animation for each number-stat when its text animation finishes
    numberStatElements.forEach((element, index) => {
        const delay = index * 200; // Match stagger delay (0.2s)
        const animationDelay = 800; // Match text animation duration

        setTimeout(() => {
            animateNumber(element);
        }, delay + animationDelay);
    });
}

// Animate a single number element counting up
function animateNumber(element) {
    const dataValue = element.getAttribute('data-value') || element.textContent;
    // Remove commas before parsing
    const targetValue = parseFloat(dataValue.toString().replace(/,/g, ''));

    if (isNaN(targetValue)) return;

    const isDecimal = targetValue % 1 !== 0;

    // Use requestAnimationFrame for number animation
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentValue = easedProgress * targetValue;

        if (isDecimal) {
            element.textContent = currentValue.toFixed(1);
        } else {
            const rounded = Math.floor(currentValue);
            element.textContent = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// Legacy function for backward compatibility
function animateNumbers(page) {
    const numberElements = page.querySelectorAll('.number-stat');
    numberElements.forEach(element => animateNumber(element));
}

// Animate first page on load
setTimeout(() => {
    animatePageText(pages[0]);
}, 300);

// Navigate to a specific page
function goToPage(newIndex) {
    if (newIndex < 0 || newIndex >= pages.length || newIndex === currentPageIndex) {
        return;
    }

    const currentPage = pages[currentPageIndex];
    const newPage = pages[newIndex];
    const direction = newIndex > currentPageIndex ? 1 : -1;

    // Check if we need to change audio
    const currentAudio = currentPage.getAttribute('data-audio');
    const newAudio = newPage.getAttribute('data-audio');

    // Start fading out current audio immediately when page starts changing
    if (currentAudio) {
        if (window.fadeOutCurrentTrack) {
            window.fadeOutCurrentTrack(500);
        }
    }

    // Change gradient colors - use page colors or default
    const colorsAttr = newPage.getAttribute('data-colors');
    let colors = DEFAULT_COLORS;

    if (colorsAttr) {
        const parsed = colorsAttr.split(',').map(c => parseInt(c, 16));
        if (parsed.length === 4) {
            colors = parsed;
        }
    }

    if (window.setColors) {
        window.setColors(colors[0], colors[1], colors[2], colors[3], 1000);
    }

    // Animate out current page
    animate(
        currentPage,
        {
            opacity: [1, 0],
            x: [0, -50 * direction]
        },
        {
            duration: 0.5,
            easing: [0.22, 1, 0.36, 1]
        }
    ).finished.then(() => {
        currentPage.classList.remove('active');

        // Reset number-stat elements to 0
        const numberStats = currentPage.querySelectorAll('.number-stat');
        numberStats.forEach(el => {
            el.textContent = '0';
        });
    });

    // Animate in new page
    newPage.classList.add('active');
    newPage.style.opacity = 0;

    // Reset text animations
    const textElements = newPage.querySelectorAll('.animate-text');
    textElements.forEach(el => {
        el.style.opacity = 0;
    });

    animate(
        newPage,
        {
            opacity: [0, 1],
            x: [50 * direction, 0]
        },
        {
            duration: 0.5,
            easing: [0.22, 1, 0.36, 1]
        }
    ).finished.then(() => {
        animatePageText(newPage);

        // Start fading in new audio after page loads
        if (newAudio) {
            if (window.fadeInTrack) {
                window.fadeInTrack(newAudio, 1000);
            }
        } else if (currentAudio) {
            // If leaving a music page for a non-music page, fade in main track
            if (window.fadeInMainTrack) {
                window.fadeInMainTrack(1000);
            }
        }
    });

    // Update current page index
    currentPageIndex = newIndex;

    // Update URL
    const url = newIndex === 0 ? '/' : `/#page-${newIndex + 1}`;
    history.pushState({ page: newIndex }, '', url);

    // Update button states
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === pages.length - 1;
}

// Navigation button handlers
prevBtn.addEventListener('click', () => {
    goToPage(currentPageIndex - 1);
});

nextBtn.addEventListener('click', () => {
    goToPage(currentPageIndex + 1);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        goToPage(currentPageIndex - 1);
    } else if (e.key === 'ArrowRight') {
        goToPage(currentPageIndex + 1);
    }
});

// Swipe/wheel navigation
let touchStartX = 0;
let touchEndX = 0;
let touchStartElement = null;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartElement = e.target;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    // Don't handle swipe if it started on a card stack or photo stack element
    if (touchStartElement && (
        touchStartElement.closest('#card-stack') ||
        touchStartElement.closest('.prompt-card') ||
        touchStartElement.closest('#photo-stack') ||
        touchStartElement.closest('.photo-card') ||
        touchStartElement.closest('#game-stack') ||
        touchStartElement.closest('.game-card')
    )) {
        return;
    }

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - go to next page
            goToPage(currentPageIndex + 1);
        } else {
            // Swipe right - go to previous page
            goToPage(currentPageIndex - 1);
        }
    }
}

// Mouse wheel navigation (with throttle)
let wheelTimeout;
document.addEventListener('wheel', (e) => {
    if (wheelTimeout) return;

    wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
    }, 800);

    if (e.deltaY > 0) {
        goToPage(currentPageIndex + 1);
    } else if (e.deltaY < 0) {
        goToPage(currentPageIndex - 1);
    }
});

// Make page navigation available globally
window.goToPage = goToPage;

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page !== undefined) {
        const targetPage = e.state.page;
        if (targetPage !== currentPageIndex) {
            goToPageWithoutHistory(targetPage);
        }
    }
});

// Navigate without adding to history (for popstate)
function goToPageWithoutHistory(newIndex) {
    if (newIndex < 0 || newIndex >= pages.length || newIndex === currentPageIndex) {
        return;
    }

    const currentPage = pages[currentPageIndex];
    const newPage = pages[newIndex];
    const direction = newIndex > currentPageIndex ? 1 : -1;

    // Check if we need to change audio
    const currentAudio = currentPage.getAttribute('data-audio');
    const newAudio = newPage.getAttribute('data-audio');

    // Start fading out current audio immediately when page starts changing
    if (currentAudio) {
        if (window.fadeOutCurrentTrack) {
            window.fadeOutCurrentTrack(500);
        }
    }

    // Change gradient colors
    const colorsAttr = newPage.getAttribute('data-colors');
    let colors = DEFAULT_COLORS;

    if (colorsAttr) {
        const parsed = colorsAttr.split(',').map(c => parseInt(c, 16));
        if (parsed.length === 4) {
            colors = parsed;
        }
    }

    if (window.setColors) {
        window.setColors(colors[0], colors[1], colors[2], colors[3], 1000);
    }

    // Animate out current page
    animate(
        currentPage,
        {
            opacity: [1, 0],
            x: [0, -50 * direction]
        },
        {
            duration: 0.5,
            easing: [0.22, 1, 0.36, 1]
        }
    ).finished.then(() => {
        currentPage.classList.remove('active');

        // Reset number-stat elements to 0
        const numberStats = currentPage.querySelectorAll('.number-stat');
        numberStats.forEach(el => {
            el.textContent = '0';
        });
    });

    // Animate in new page
    newPage.classList.add('active');
    newPage.style.opacity = 0;

    // Reset text animations
    const textElements = newPage.querySelectorAll('.animate-text');
    textElements.forEach(el => {
        el.style.opacity = 0;
    });

    animate(
        newPage,
        {
            opacity: [0, 1],
            x: [50 * direction, 0]
        },
        {
            duration: 0.5,
            easing: [0.22, 1, 0.36, 1]
        }
    ).finished.then(() => {
        animatePageText(newPage);

        // Start fading in new audio after page loads
        if (newAudio) {
            if (window.fadeInTrack) {
                window.fadeInTrack(newAudio, 1000);
            }
        } else if (currentAudio) {
            // If leaving a music page for a non-music page, fade in main track
            if (window.fadeInMainTrack) {
                window.fadeInMainTrack(1000);
            }
        }
    });

    // Update current page index
    currentPageIndex = newIndex;

    // Update button states
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === pages.length - 1;
}

// Check URL on page load and navigate to correct page
function initializePageFromURL() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#page-')) {
        const pageNum = parseInt(hash.replace('#page-', ''), 10);
        const pageIndex = pageNum - 1;
        if (pageIndex > 0 && pageIndex < pages.length) {
            // Skip animation for initial load
            pages[0].classList.remove('active');
            pages[pageIndex].classList.add('active');
            currentPageIndex = pageIndex;

            // Update button states
            prevBtn.disabled = currentPageIndex === 0;
            nextBtn.disabled = currentPageIndex === pages.length - 1;

            // Animate the current page
            setTimeout(() => {
                animatePageText(pages[pageIndex]);

                // Set gradient colors
                const colorsAttr = pages[pageIndex].getAttribute('data-colors');
                let colors = DEFAULT_COLORS;
                if (colorsAttr) {
                    const parsed = colorsAttr.split(',').map(c => parseInt(c, 16));
                    if (parsed.length === 4) {
                        colors = parsed;
                    }
                }
                if (window.setColors) {
                    window.setColors(colors[0], colors[1], colors[2], colors[3], 0);
                }
            }, 300);

            return;
        }
    }
    // If no valid hash, ensure we're on page 1
    history.replaceState({ page: 0 }, '', '/');
}

// Initialize from URL
initializePageFromURL();
