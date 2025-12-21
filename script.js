document.addEventListener('DOMContentLoaded', () => {
    const glow = document.getElementById('cursor-glow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    // Smooth easing for the glow (Linear/Apple style)
    const animateGlow = () => {
        const speed = 0.08; // Lower = smoother/slower
        glowX += (mouseX - glowX) * speed;
        glowY += (mouseY - glowY) * speed;
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;
        requestAnimationFrame(animateGlow);
    };

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    animateGlow();

    // MAGNETIC HOVER LOGIC
    const magneticElements = document.querySelectorAll('.btn, .nav-links a, .tag');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Apply subtle magnetic attraction (max 4px) and 1.02 scale
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px) scale(1)`;
        });
    });
});