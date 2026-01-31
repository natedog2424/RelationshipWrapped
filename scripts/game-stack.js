// Game stack for top video games
// Similar structure to card-stack.js

const gameData = [
    {
        title: "Stardew Valley",
        playtime: "108 hours played",
        image: "photos/games/stardew.png"
    },
    {
        title: "Overcooked",
        playtime: "6.5 hours played",
        image: "photos/games/overcooked.png"
    },
    {
        title: "A Little to the Left",
        playtime: "3.5 hours played",
        image: "photos/games/littletotheleft.png"
    }
];

let gameCards = [];
let gameCardOrder = [];
let currentGameHandlers = null;
let isGameAnimating = false;

function createGameCard(game, index) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="game-card-image">
        <div class="game-card-overlay">
            <div class="game-card-title">${game.title}</div>
            <div class="game-card-playtime">${game.playtime}</div>
        </div>
    `;
    return card;
}

function initializeGameStack() {
    const container = document.getElementById('game-stack');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';
    gameCards = [];
    gameCardOrder = [];

    // Create cards in reverse order so first card is on top
    for (let i = gameData.length - 1; i >= 0; i--) {
        const card = createGameCard(gameData[i], i);
        container.appendChild(card);
        gameCards.push(card);
        gameCardOrder.push(i);
    }

    // Reverse arrays so index 0 is the top card
    gameCards.reverse();
    gameCardOrder.reverse();

    // Position cards in stack
    updateGameCardPositions(true);

    // Add drag handlers to top card
    if (gameCards.length > 0) {
        addGameDragHandlers(gameCards[0], 0);
    }
}

function updateGameCardPositions(skipTransitionOnTop = false) {
    gameCards.forEach((card, index) => {
        const scale = 1 - (index * 0.05);
        const yOffset = index * 10;
        const zIndex = gameCards.length - index;
        const randomRotation = (Math.random() - 0.5) * 4; // Random rotation between -2 and 2 degrees

        card.style.transform = `translateY(${yOffset}px) scale(${scale}) rotate(${randomRotation}deg)`;
        card.style.transformOrigin = 'center center';
        card.style.zIndex = zIndex;
        card.style.opacity = 1;
        card.style.pointerEvents = index === 0 ? 'auto' : 'none';
        // Smooth transition for all cards, unless specifically disabled for top card during initial setup
        card.style.transition = (index === 0 && skipTransitionOnTop) ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
}

function addGameDragHandlers(card, cardIndex) {
    if (!card) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;

    const handleStart = (e) => {
        if (isGameAnimating) return;
        isDragging = true;
        card.style.cursor = 'grabbing';
        card.style.transition = 'none'; // Disable transitions during drag

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        startX = clientX - currentX;
        startY = clientY - currentY;
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        currentX = clientX - startX;
        currentY = clientY - startY;

        const rotation = currentX * 0.1;
        const scale = 1 - (Math.abs(currentX) / 1000);

        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg) scale(${Math.max(scale, 0.8)})`;
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        card.style.cursor = 'grab';

        const threshold = 100;

        if (Math.abs(currentX) > threshold) {
            dismissGameCard(card, cardIndex, currentX > 0 ? 1 : -1);
        } else {
            // Reset position
            card.style.transition = 'transform 0.3s ease-out';
            card.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
            currentX = 0;
            currentY = 0;
        }
    };

    // Remove old handlers if they exist
    if (currentGameHandlers) {
        const { card: oldCard, handlers } = currentGameHandlers;
        oldCard.removeEventListener('mousedown', handlers.mousedown);
        document.removeEventListener('mousemove', handlers.mousemove);
        document.removeEventListener('mouseup', handlers.mouseup);
        oldCard.removeEventListener('touchstart', handlers.touchstart);
        document.removeEventListener('touchmove', handlers.touchmove);
        document.removeEventListener('touchend', handlers.touchend);
    }

    // Store handlers for cleanup
    currentGameHandlers = {
        card,
        handlers: {
            mousedown: handleStart,
            mousemove: handleMove,
            mouseup: handleEnd,
            touchstart: handleStart,
            touchmove: handleMove,
            touchend: handleEnd
        }
    };

    card.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    card.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
}

function dismissGameCard(card, cardIndex, direction) {
    if (isGameAnimating) return;
    isGameAnimating = true;

    const exitX = direction * window.innerWidth;
    const exitRotation = direction * 30;

    card.style.transition = 'transform 0.3s ease-out';
    card.style.transform = `translate(${exitX}px, 0px) rotate(${exitRotation}deg) scale(0.8)`;

    setTimeout(() => {
        // Move dismissed card to back of array
        gameCards.shift();
        gameCards.push(card);

        // Reset card position
        card.style.transition = 'none';
        card.style.transform = '';

        // Update all positions
        updateGameCardPositions();

        // Add handlers to new top card
        if (gameCards.length > 0) {
            addGameDragHandlers(gameCards[0], 0);
        }

        isGameAnimating = false;
    }, 300);
}

// Initialize when DOM is ready and page becomes visible
function initOnPageVisible() {
    const gamesPage = document.querySelector('[data-page="11"]');
    if (!gamesPage) {
        // Fallback: initialize immediately if page not found
        initializeGameStack();
        return;
    }

    // Only initialize when games page becomes visible
    const observer = new MutationObserver(() => {
        if (gamesPage.classList.contains('active') && gameCards.length === 0) {
            initializeGameStack();
        }
    });

    observer.observe(gamesPage, { attributes: true, attributeFilter: ['class'] });

    // Also check if already active
    if (gamesPage.classList.contains('active')) {
        initializeGameStack();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnPageVisible);
} else {
    initOnPageVisible();
}
