// Existing JavaScript...

// Disable zooming on mobile devices
document.addEventListener('touchstart', function (event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Prevent zoom on pinch
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // Prevent double-tap zoom
    }
    lastTouchEnd = now;
}, false);