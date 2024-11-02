import * as THREE from 'three';

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure GSAP and ScrollTrigger are available
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded');
        return;
    }

    // Initialize mobile menu elements
    initializeMobileMenu();
    
    // Initialize Three.js scene
    await initializeThreeJS();

    initializeScrollAnimations();
});

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    hamburgerBtn?.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
    });
    
    closeBtn?.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
    });

    // Close menu when clicking a link
    const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
    mobileMenuLinks?.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
    });
}

// Three.js initialization
async function initializeThreeJS() {
    // Load shaders
    const vertexShader = await fetch('./shaders/vertexShader.glsl')
        .then(response => response.text());
    const fragmentShader = await fetch('./shaders/fragmentShader.glsl')
        .then(response => response.text());

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#about-canvas'),
        antialias: true,
        alpha: true
    });

    // Adjust renderer size based on screen size
    if (window.innerWidth < 768) {
        renderer.setSize(window.innerWidth, window.innerHeight * 0.4); // 40vh for mobile
    } else {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create geometry and material
    const geometry = new THREE.IcosahedronGeometry(2, 50, 50);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uColorChange: { value: 0 },
            uOpacity: { value: 1.0 }
        },
        transparent: true
    });

    // Create and add mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    

    // Position camera
    camera.position.z = 3;
    if (window.innerWidth < 768) {
        mesh.position.set(0, -3, -11); // Centered position for mobile
    } else {
        mesh.position.y = -2.5; // Original position for desktop
    }

    // Create ScrollTrigger for the landing section
    ScrollTrigger.create({
        trigger: ".landing",
        start: "top center",
        onEnter: () => {
            // Make mesh visible immediately
            mesh.visible = true;
            
            // Start animation after 1.5 seconds
            setTimeout(() => {
                if (window.innerWidth >= 768) {
                    gsap.to(mesh.position, {
                        y: 0,
                        z: -2,
                        duration: 2,
                        ease: "power2.inOut",
                        onComplete: () => {
                            gsap.to(".landing h1", {
                                opacity: 0,
                                duration: 1,
                                onComplete: () => {
                                    gsap.to(".landing p", {
                                        opacity: 1,
                                        duration: 0.8,
                                        ease: "power2.inOut"
                                    });
                                }
                            });
                        }
                    });

                    // Color and opacity changes
                    gsap.to(material.uniforms.uColorChange, {
                        value: 1,
                        duration: 2,
                        ease: "power2.inOut"
                    });
                    gsap.to(material.uniforms.uOpacity, {
                        value: 0.3,
                        duration: 2,
                        ease: "power2.inOut"
                    });
                }
            }, 1500); // 1.5 second delay for animation start
        },
        onLeaveBack: () => {
            // Hide when scrolling back up
            mesh.visible = false;
        }
    });

    // Animation loop
    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerWidth < 768 ? window.innerHeight * 0.4 : window.innerHeight);
        camera.updateProjectionMatrix();
        
        if (window.innerWidth < 768) {
            renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
        } else {
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

// Add after initializeMobileMenu()
function initializeScrollAnimations() {
    // Optimize journey cards animation
    gsap.utils.toArray('.journey-item').forEach((item, index) => {
        const card = item.querySelector('.journey-card');
        const yearLabel = item.querySelector('.year-label');
        const dot = item.querySelector('.journey-dot');

        // Add loading state
        card.classList.add('journey-card-loading');

        // Create timeline with optimized settings
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top center+=100",
                end: "top center-=100",
                toggleActions: "play none none reverse",
                fastScrollEnd: true,
                preventOverlaps: true,
                anticipatePin: 1,
                onEnter: () => {
                    // Remove loading state when animation starts
                    setTimeout(() => {
                        card.classList.remove('journey-card-loading');
                    }, 300); // Small delay to ensure smooth transition
                }
            },
            defaults: {
                ease: "power2.out"
            }
        });

        // Streamlined animations with reduced duration
        tl.fromTo(yearLabel, 
            { 
                opacity: 0, 
                y: -20,
                scale: 0.8 
            },
            { 
                opacity: 1, 
                y: 0,
                scale: 1,
                duration: 0.3
            }
        ).fromTo(dot,
            { 
                scale: 0, 
                opacity: 0 
            },
            { 
                scale: 1, 
                opacity: 1, 
                duration: 0.2
            },
            "-=0.1" // Slight overlap for smoother animation
        ).fromTo(card,
            { 
                y: 30, // Reduced distance
                opacity: 0,
                scale: 0.98 // Smaller scale change
            },
            { 
                y: 0, 
                opacity: 1,
                scale: 1,
                duration: 0.4
            },
            "-=0.2" // Slight overlap
        );

        // Optimize hover animations
        const hoverTl = gsap.timeline({ paused: true });
        hoverTl.to(card, {
            y: -5,
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
        });

        // Use event listeners with debouncing
        let timeout;
        card.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            hoverTl.play();
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                hoverTl.reverse();
            }, 50);
        });
    });

    // Optimize timeline line animation
    gsap.from('.journey-timeline > div:first-child', {
        scrollTrigger: {
            trigger: '.journey-timeline',
            start: "top center",
            end: "bottom center",
            scrub: 1, // Smoother scrubbing
            fastScrollEnd: true,
            preventOverlaps: true
        },
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none" // Remove easing for smoother scrubbing
    });

    // Batch similar animations together
    gsap.utils.toArray('.experience-card, .approach-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                toggleActions: "play none none reverse",
                // Add optimization settings
                fastScrollEnd: true,
                preventOverlaps: true
            },
            y: 30, // Reduced distance
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}
