// Photo stack for memories
// Based on card-stack.js

// Photo filenames - add your photos to the photos/stack folder
const photoFiles = [
    'P1.jpeg',
    'P2.jpeg',
    'P3.jpeg',
    'P4.jpeg',
    'P5.jpeg',
    'P6.jpeg',
    'P7.jpeg',
    'P8.jpeg',
    'P9.jpeg',
    'P10.jpeg',
    'P11.jpeg',
    'P12.jpeg',
    'P13.jpeg',
    'P14.jpeg',
    'P15.jpeg',
    'P16.jpeg',
    'P17.jpeg',
    'P18.jpeg',
    'P19.jpeg',
];

let photoCards = [];
let photoOrder = [];
let currentPhotoHandlers = null;
let isPhotoAnimating = false;

function createPhotoCard(filename, index) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.cardIndex = index;

    const img = document.createElement('img');
    img.src = `photos/stack/${filename}`;
    img.alt = 'Memory';

    card.appendChild(img);
    return card;
}

function initPhotoStack() {
    const container = document.getElementById('photo-stack');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';
    photoCards = [];
    photoOrder = [];

    // Create all photo cards
    photoFiles.forEach((filename, index) => {
        const card = createPhotoCard(filename, index);
        photoCards.push(card);
        photoOrder.push(index);
        container.appendChild(card);
    });

    // Position all cards in stack
    updatePhotoCardPositions();

    // Make top card draggable
    if (photoCards.length > 0) {
        makePhotoCardDraggable(photoCards[0]);
    }
}

function updatePhotoCardPositions() {
    photoCards.forEach((card, index) => {
        const randomRotation = (Math.random() - 0.5) * 4;
        card.style.zIndex = photoCards.length - index;
        card.style.transform = `translate(-50%, calc(-50% + ${index * -4}px)) scale(${1 - index * 0.05}) rotate(${randomRotation}deg)`;
        card.style.opacity = index < 3 ? 1 : 0;
        card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    });
}

function makePhotoCardDraggable(card) {
    // Remove previous handlers if they exist
    if (currentPhotoHandlers) {
        document.removeEventListener('mousemove', currentPhotoHandlers.onMove);
        document.removeEventListener('mouseup', currentPhotoHandlers.onEnd);
        document.removeEventListener('touchmove', currentPhotoHandlers.onMove);
        document.removeEventListener('touchend', currentPhotoHandlers.onEnd);
    }

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;

    function onStart(e) {
        if (isPhotoAnimating) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        isDragging = true;
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        card.style.transition = 'none';
    }

    function onMove(e) {
        if (!isDragging || isPhotoAnimating) return;

        e.preventDefault();
        e.stopPropagation();
        const point = e.touches ? e.touches[0] : e;
        currentX = point.clientX - startX;
        currentY = point.clientY - startY;

        const rotation = currentX / 20;
        const opacity = 1 - Math.abs(currentX) / 300;

        card.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${rotation}deg)`;
        card.style.opacity = opacity;
    }

    function onEnd(e) {
        if (!isDragging || isPhotoAnimating) return;
        e.stopPropagation();
        isDragging = false;

        const threshold = 80;

        if (Math.abs(currentX) > threshold) {
            // Set animating flag
            isPhotoAnimating = true;

            // Remove event listeners before swiping
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            card.removeEventListener('mousedown', onStart);
            card.removeEventListener('touchstart', onStart);

            // Swipe card away
            const direction = currentX > 0 ? 1 : -1;
            card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = `translate(calc(-50% + ${direction * 500}px), calc(-50% + ${currentY}px)) rotate(${direction * 30}deg)`;
            card.style.opacity = 0;

            setTimeout(() => {
                // Move the swiped card to the end of the array
                const swipedCard = photoCards.shift();
                photoCards.push(swipedCard);

                // Reset swiped card and move to back
                swipedCard.style.transition = 'none';
                swipedCard.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                swipedCard.style.opacity = 0;

                // Use requestAnimationFrame to ensure transition is removed before repositioning
                requestAnimationFrame(() => {
                    // Update all card positions
                    updatePhotoCardPositions();

                    // Make new top card draggable after animation completes
                    setTimeout(() => {
                        isPhotoAnimating = false;
                        makePhotoCardDraggable(photoCards[0]);
                    }, 250);
                });
            }, 200);
        } else {
            // Return to center
            card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            card.style.opacity = 1;
        }

        currentX = 0;
        currentY = 0;
    }

    // Store handlers for cleanup
    currentPhotoHandlers = { onMove, onEnd };

    // Mouse events
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch events
    card.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    card.addEventListener('touchend', onEnd);
}

// Initialize when page loads
window.addEventListener('load', () => {
    setTimeout(initPhotoStack, 500);
});

// Reset cards when navigating back to this page
window.addEventListener('pagechange', (e) => {
    if (e.detail && e.detail.page === 7) {
        photoCards = [];
        photoOrder = [];
        initPhotoStack();
    }
});
