// Card stack for candle prompts
// Based on Motion.dev card stack tutorial

const cardData = [
    {
        prompt: "What's a weird future milestone you're secretly excited for us to hit together?",
        response1: "like buying a big piece of furniture",
        response2: "having known each other longer than not knowing each other"
    },
    {
        prompt: "You can tell a lot about someone by how they ____.",
        response1: "treat others",
        response2: "treat others"
    },
    {
        prompt: "If you could replace their shampoo with something else, what would it be?",
        response1: "lotion",
        response2: "diamonds"
    },
    {
        prompt: "If they were an ornament on a tree, what would they be & where would you put them?",
        response1: "you would be a cute teddy bear ornament on the front of the tree",
        response2: "you'd be the star ond you'd be on top of the tree of course"
    },
    {
        prompt: "What is one eperience you with you could relive for the first time with them?",
        response1: "probabally my first kiss",
        response2: "stargazing in fountain hills"
    },
    {
        prompt: "If they became a vampire, would you let them bite you so you two could live eternally?",
        response1: "Yes",
        response2: "Yes"
    },
    {
        prompt: "What's an argument you two will probably still be having in 20 years?",
        response1: "turning the fan on",
        response2: "who loves the other more"
    },
    {
        prompt: "If we had to wear matching outfits for a day, I'd pick ____.",
        response1: "hotdog costume",
        response2: "cool track suits"
    },
    {
        prompt: "What's one of your partner's quirks that you find endearing?",
        response1: "you nerding out about something",
        response2: "your funny phrases you use"
    },
    {
        prompt: "What's a job apart from their own, that you think they'd be really good at?",
        response1: "carpenter",
        response2: "professor"
    },
    {
        prompt: "We should wear matching outfits more often.",
        response1: "Yes",
        response2: "Yes"
    }
];

let cards = [];
let cardOrder = []; // Track the current order of cards
let currentHandlers = null; // Track current event handlers for cleanup
let isAnimating = false; // Prevent interactions during animation

function createCard(data, index) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.cardIndex = index; // Store original data index
    card.innerHTML = `
        <div class="prompt-question">${data.prompt}</div>
        <div class="prompt-responses">
            <div class="message-bubble message-left">${data.response1}</div>
            <div class="message-bubble message-right">${data.response2}</div>
        </div>
    `;

    return card;
}

function initCardStack() {
    const container = document.getElementById('card-stack');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';
    cards = [];
    cardOrder = [];

    // Create all cards
    cardData.forEach((data, index) => {
        const card = createCard(data, index);
        cards.push(card);
        cardOrder.push(index);
        container.appendChild(card);
    });

    // Position all cards in stack
    updateCardPositions();

    // Make top card draggable
    if (cards.length > 0) {
        makeCardDraggable(cards[0]);
    }
}

function updateCardPositions() {
    cards.forEach((card, index) => {
        const randomRotation = (Math.random() - 0.5) * 4; // Random rotation between -2 and 2 degrees
        card.style.zIndex = cards.length - index;
        card.style.transform = `translateY(${index * -4}px) scale(${1 - index * 0.05}) rotate(${randomRotation}deg)`;
        card.style.opacity = index < 3 ? 1 : 0;
        card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    });
}

function makeCardDraggable(card) {
    // Remove previous handlers if they exist
    if (currentHandlers) {
        document.removeEventListener('mousemove', currentHandlers.onMove);
        document.removeEventListener('mouseup', currentHandlers.onEnd);
        document.removeEventListener('touchmove', currentHandlers.onMove);
        document.removeEventListener('touchend', currentHandlers.onEnd);
    }

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;

    function onStart(e) {
        if (isAnimating) {
            return;
        }
        isDragging = true;
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        card.style.transition = 'none';
    }

    function onMove(e) {
        if (!isDragging || isAnimating) return;

        e.preventDefault();
        const point = e.touches ? e.touches[0] : e;
        currentX = point.clientX - startX;
        currentY = point.clientY - startY;

        const rotation = currentX / 20;
        const opacity = 1 - Math.abs(currentX) / 300;

        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
        card.style.opacity = opacity;
    }

    function onEnd(e) {
        if (!isDragging || isAnimating) return;
        isDragging = false;

        const threshold = 80;

        if (Math.abs(currentX) > threshold) {
            // Set animating flag
            isAnimating = true;

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
            card.style.transform = `translate(${direction * 500}px, ${currentY}px) rotate(${direction * 30}deg)`;
            card.style.opacity = 0;

            setTimeout(() => {
                // Move the swiped card to the end of the array
                const swipedCard = cards.shift();
                cards.push(swipedCard);

                // Reset swiped card and move to back
                swipedCard.style.transition = 'none';
                swipedCard.style.transform = 'translate(0, 0) rotate(0deg)';
                swipedCard.style.opacity = 0;

                // Update all card positions
                updateCardPositions();

                // Make new top card draggable after animation completes
                setTimeout(() => {
                    isAnimating = false;
                    makeCardDraggable(cards[0]);
                }, 250);
            }, 200);
        } else {
            // Return to center
            card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'translate(0, 0) rotate(0deg)';
            card.style.opacity = 1;
        }

        currentX = 0;
        currentY = 0;
    }

    // Store handlers for cleanup
    currentHandlers = { onMove, onEnd };

    // Mouse events
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch events
    card.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}


// Initialize when page loads
window.addEventListener('load', () => {
    setTimeout(initCardStack, 500);
});

// Reset cards when navigating back to this page
window.addEventListener('pagechange', (e) => {
    if (e.detail && e.detail.page === 5) {
        cards = [];
        cardOrder = [];
        initCardStack();
    }
});
