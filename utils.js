// Modern UI Utility Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Subtle mouse move effect on cards (depth effect)
    const cards = document.querySelectorAll('.card, .dashboard-content');
    
    // Mouse hover tilt effect removed as requested
    
    // Button micro-interactions
    const btns = document.querySelectorAll('button');
    btns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            // Can add more subtle effects here
        });
    });
});
