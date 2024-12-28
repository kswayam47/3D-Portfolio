document.addEventListener('DOMContentLoaded', () => {
    initializeScrollAnimations();
});

function initializeScrollAnimations() {

    gsap.set('.project-card', { 
        opacity: 0,
        scale: 0.95,
        transformOrigin: 'center center'
    });

    
    gsap.utils.toArray('.project-card').forEach((card, index) => {
    
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

    
        const content = card.querySelector('.project-content');
        const image = card.querySelector('.project-image-container');
        const title = card.querySelector('.project-title');
        const description = card.querySelector('.project-description');
        const techStack = card.querySelector('.tech-stack');
        const githubLink = card.querySelector('.github-link');

        
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

       
        const isMobile = window.matchMedia('(max-width: 768px)').matches;


if (isMobile) {
  
    ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
            
            const particleInterval = setInterval(() => {
                createParticles(card);
            }, 2000);

            card.dataset.particleInterval = particleInterval;
        },
        onLeave: () => {
            
            if (card.dataset.particleInterval) {
                clearInterval(card.dataset.particleInterval);
            }
        },
        onEnterBack: () => {
           
            const particleInterval = setInterval(() => {
                createParticles(card);
            }, 2000);
            card.dataset.particleInterval = particleInterval;
        },
        onLeaveBack: () => {
         
            if (card.dataset.particleInterval) {
                clearInterval(card.dataset.particleInterval);
            }
        }
    });


    gsap.to(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            end: 'top center',
            toggleActions: 'play none none reverse'
        },
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
    });
} else {
    
    card.addEventListener('mouseenter', playHoverAnimation);
    card.addEventListener('mouseleave', reverseHoverAnimation);
}
    });
}

function createParticles(card) {
    const particles = 24; 
    const colors = ['#FFFFFF', '#60A5FA', '#34D399', '#818CF8']; 
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        card.appendChild(particle);

        
        const startX = gsap.utils.random(-50, card.offsetWidth + 50);
        const startY = gsap.utils.random(-50, card.offsetHeight + 50);
        
    
        const size = gsap.utils.random(4, 12); 

        gsap.set(particle, {
            x: startX,
            y: startY,
            scale: 0,
            width: size,
            height: size,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            opacity: gsap.utils.random(0.3, 1) 
        });

        
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