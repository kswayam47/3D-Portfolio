document.addEventListener('DOMContentLoaded', () => {
    initializeScrollAnimations();
});

function initializeScrollAnimations() {
    // Initial setup for cards
    gsap.set('.project-card', { 
        opacity: 0,
        scale: 0.95,
        transformOrigin: 'center center'
    });

    // Animate each project card
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        // Create scroll trigger animation
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                end: 'top center',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 0.75)'
        });

        // Get card elements
        const content = card.querySelector('.project-content');
        const image = card.querySelector('.project-image-container');
        const title = card.querySelector('.project-title');
        const description = card.querySelector('.project-description');
        const techStack = card.querySelector('.tech-stack');
        const githubLink = card.querySelector('.github-link');

        // Function to play hover animation
        const playHoverAnimation = () => {
            const tl = gsap.timeline();
            
            tl.to(card, {
                y: -15,
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                duration: 0.4,
                ease: 'power2.out'
            })
            .to(image, {
                scale: 1.05,
                duration: 0.5,
                ease: 'power2.out'
            }, '-=0.4')
            .to(content, {
                x: index % 2 === 0 ? 10 : -10,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.4')
            .to(techStack.children, {
                scale: 1.1,
                stagger: 0.05,
                duration: 0.2,
                ease: 'back.out(1.7)'
            }, '-=0.3')
            .to(title, {
                backgroundSize: '200%',
                backgroundPosition: '100%',
                duration: 0.4
            }, '-=0.4');

            createParticles(card);
            return tl;
        };

        // Function to reverse hover animation
        const reverseHoverAnimation = () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.to(image, {
                scale: 1,
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.to(content, {
                x: 0,
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.to(techStack.children, {
                scale: 1,
                duration: 0.3,
                ease: 'power3.out'
            });

            gsap.to(title, {
                backgroundPosition: '0%',
                duration: 0.4
            });
        };

        // Check if it's a mobile device
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            // For mobile devices, create a continuous animation loop
            const loopAnimation = () => {
                const tl = gsap.timeline({
                    repeat: -1,
                    yoyo: true,
                    repeatDelay: 1
                });
                
                tl.add(playHoverAnimation());
                
                // Add continuous particle animation
                const particleInterval = setInterval(() => {
                    createParticles(card);
                }, 2000); // Create particles every 2 seconds (1s animation + 1s break)

                // Cleanup interval when card is out of view
                ScrollTrigger.create({
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    onLeave: () => {
                        clearInterval(particleInterval);
                        gsap.killTweensOf(card);
                    },
                    onLeaveBack: () => {
                        clearInterval(particleInterval);
                        gsap.killTweensOf(card);
                    }
                });

                return tl;
            };

            // Start the loop animation when the card becomes visible
            ScrollTrigger.create({
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                onEnter: () => loopAnimation(),
                onEnterBack: () => loopAnimation()
            });
        } else {
            // For desktop, keep the hover events
            card.addEventListener('mouseenter', playHoverAnimation);
            card.addEventListener('mouseleave', reverseHoverAnimation);
        }
    });
}

// Create floating particles effect
function createParticles(card) {
    const particles = 24; // Increased from 12 to 24
    const colors = ['#FFFFFF', '#60A5FA', '#34D399', '#818CF8']; // Added white as first color
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        card.appendChild(particle);

        // Random starting position around the card
        const startX = gsap.utils.random(-50, card.offsetWidth + 50);
        const startY = gsap.utils.random(-50, card.offsetHeight + 50);
        
        // Random size for each particle
        const size = gsap.utils.random(4, 12); // Varied sizes from 4px to 12px

        gsap.set(particle, {
            x: startX,
            y: startY,
            scale: 0,
            width: size,
            height: size,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            opacity: gsap.utils.random(0.3, 1) // Random initial opacity
        });

        // More varied animation for each particle
        gsap.to(particle, {
            y: startY - gsap.utils.random(100, 200),
            x: startX + gsap.utils.random(-50, 50),
            scale: gsap.utils.random(0.5, 1.5),
            opacity: 0,
            duration: gsap.utils.random(1, 2.5),
            ease: 'power1.out',
            onComplete: () => particle.remove()
        });
    }
} 