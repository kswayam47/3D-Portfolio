import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./node_modules/three/examples/jsm/loaders/RGBELoader.js";
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
const scene = new THREE.Scene();
const canvas = document.querySelector("#canvas");

// Loading functionality
function startTextAnimation() {
    const hiElement = document.querySelector("#hi");
    const nameElement = document.querySelector("#name");
    const descriptionElement = document.querySelector("#description");
    
    hiElement.style.opacity = "1";
    nameElement.style.opacity = "1";
    descriptionElement.style.opacity = "1";
}

function updateLoadingProgress(progress) {
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    
    if (loadingBar && loadingPercent) {
        loadingBar.style.width = `${progress}%`;
        loadingPercent.textContent = `${Math.round(progress)}%`;
    }
}

// Add this new function to check if it's a mobile device
function isMobile() {
    return window.innerWidth <= 768;
}

// Add this at the top of your file with other global variables
let lastIsMobile = isMobile(); // Store initial mobile state

// Add this function to handle screen transition
function handleScreenTransition() {
    const currentIsMobile = isMobile();
    
    // Check if mobile state has changed
    if (currentIsMobile !== lastIsMobile) {
        // Show loading screen before reload
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.style.display = 'flex';
            loaderElement.style.opacity = '1';
        }
        
        // Small delay to ensure loading screen is visible
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }
    
    lastIsMobile = currentIsMobile;
}

// Modify the background texture setup
const textureLoader = new THREE.TextureLoader();
function loadBackground() {
    const texturePath = isMobile() 
        ? './assets/env.jpg'  // Mobile background
        : './assets/mists1.png';     // Desktop background

    textureLoader.load(
        texturePath,
        function (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            texture.needsUpdate = true;
            scene.background = texture;
        },
        undefined,
        function (error) {
            console.error('Error loading background texture:', error);
        }
    );
}

// Call loadBackground initially
loadBackground();

// Update the resize event listener
window.addEventListener("resize", function() {
    // Debounce the resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        handleScreenTransition();
        
        // Only run these updates if we haven't triggered a reload
        if (lastIsMobile === isMobile()) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Existing resize code for model positions
            const model = scene.getObjectByProperty('type', 'Group');
            if (model) {
                if (isMobile()) {
                    model.position.set(-6, -45, -45.3);
                    model.scale.set(0.8, 0.8, 0.8);
                } else {
                    model.position.set(-3.84, -15, -21.3);
                    model.scale.set(2, 2, 2);
                }
            }
        }
    }, 250); // 250ms debounce time
});

// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/rainforest_trail_1k.hdrsc',
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }
);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Camera setup with perfect position
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 90);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add this code to disable controls on mobile
if (isMobile()) {
    controls.enabled = false;
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x00ff00, 0.2);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

// Animation setup
const clock = new THREE.Clock();
let mixer;

// Load the model
const loader = new GLTFLoader();

// Add these new variables at the top
let birds = [];
let character;
let characterMixer;
const birdPaths = [
    './assets/bird.glb', // You'll need to download a bird model
];

// Add these variables at the top
let totalModelsToLoad = 0;
let loadedModels = 0;

// Create a function to update loading progress based on all models
function updateTotalLoadingProgress() {
    loadedModels++;
    const progress = (loadedModels / totalModelsToLoad) * 100;
    updateLoadingProgress(progress);
    
    // Only hide loader when all models are loaded
    if (loadedModels === totalModelsToLoad) {
        const loaderElement = document.getElementById('loader');
        loaderElement.style.opacity = "0";
        setTimeout(() => {
            loaderElement.style.display = 'none';
            startTextAnimation();
        }, 500);
    }
}

// Modify createCharacter function to return a Promise
function createCharacter() {
    return new Promise((resolve, reject) => {
        if (!isMobile()) {
            const characterLoader = new FBXLoader();
            characterLoader.load(
                './assets/Waving.fbx', 
                (fbx) => {
                    character = fbx;
                    character.position.set(-55, -3, -7);
                    character.scale.set(0.11, 0.11, 0.11);
                    
                    // Setup character animation
                    characterMixer = new THREE.AnimationMixer(character);
                    if(character.animations.length) {
                        const waveAction = characterMixer.clipAction(character.animations[0]);
                        waveAction.play();
                    }
                    
                    const characterLight = new THREE.PointLight(0x7928CA, 1, 10);
                    characterLight.position.copy(character.position);
                    
                    scene.add(character);
                    scene.add(characterLight);
                    updateTotalLoadingProgress();
                    resolve();
                },
                undefined,
                reject
            );
        } else {
            resolve(); // Resolve immediately for mobile
        }
    });
}

// Modify createBirds function to return a Promise
function createBirds() {
    return new Promise((resolve, reject) => {
        const birdLoader = new GLTFLoader();
        let loadedBirds = 0;
        const totalBirds = 5;

        for(let i = 0; i < totalBirds; i++) {
            birdLoader.load(
                birdPaths[0],
                (gltf) => {
                    const bird = gltf.scene;
                    
                    // Add these lines to ensure proper depth rendering
                    bird.traverse((child) => {
                        if (child.isMesh) {
                            child.material.depthTest = true;
                            child.material.depthWrite = true;
                            child.renderOrder = 0; // Ensure default render order
                        }
                    });
                    
                    // Random position around the main model
                    bird.position.set(
                        Math.random() * 100 - 50,
                        Math.random() * 30 + 10,
                        Math.random() * 100 - 20
                    );
                    
                    // Scale the bird appropriately
                    bird.scale.set(0.2, 0.2, 0.2);
                    
                    // Setup bird animation
                    const birdMixer = new THREE.AnimationMixer(bird);
                    if(gltf.animations.length) {
                        const flyAction = birdMixer.clipAction(gltf.animations[0]);
                        flyAction.play();
                    }
                    
                    birds.push({
                        model: bird,
                        mixer: birdMixer,
                        initialPosition: bird.position.clone(),
                        phase: Math.random() * Math.PI * 2
                    });
                    
                    scene.add(bird);
                    loadedBirds++;
                    if (loadedBirds === totalBirds) {
                        updateTotalLoadingProgress();
                        resolve();
                    }
                },
                undefined,
                reject
            );
        }
    });
}

// Modify the main model loading section
totalModelsToLoad = isMobile() ? 2 : 3; // Main model + birds (+ character for desktop)

loader.load(
    isMobile() ? './assets/ballon.glb' : './assets/mobile_home.glb',
    function (gltf) {
        const model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Set position and scale based on screen size
        if (isMobile()) {
            model.position.set(-6, -45, -45.3);
            model.scale.set(0.018,0.018, 0.018);
            camera.position.set(10, -50,100); // Adjusted camera position for mobile
            model.rotation.set(0,  THREE.MathUtils.degToRad(0), 0);
            document.addEventListener('touchmove', function(e) {
                e.preventDefault();
            }, { passive: false });
            
            document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
            });
            
            document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
            });
            
            
        } else {
            model.position.set(-3.84, -15, -21.3);
            model.scale.set(2, 2, 2);
            model.rotation.set(0, 0, 0);
            model.rotation.set(
                0,  // X rotation
                THREE.MathUtils.degToRad(87), // Y rotation
                0   // Z rotation
            );
        }

        // Set perfect rotation (y = 87 degrees)
    
        
        // Setup animations
        mixer = new THREE.AnimationMixer(model);
        
        // Play all animations
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        
        scene.add(model);
        updateTotalLoadingProgress();

        // Load birds and character simultaneously
        Promise.all([
            createBirds(),
            createCharacter()
        ]).catch(error => {
            console.error('Error loading additional models:', error);
            updateTotalLoadingProgress(); // Ensure loader hides even if some models fail
        });
    },
    // Progress callback
    function (xhr) {
        // This now only represents the main model's loading progress
        const percentComplete = (xhr.loaded / xhr.total) * 100 / totalModelsToLoad;
        updateLoadingProgress(percentComplete);
    },
    // Error callback
    function (error) {
        console.error('Error loading model:', error);
        updateTotalLoadingProgress(); // Ensure loader hides even if main model fails
    }
);

// Modify your existing animate function
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update main model mixer
    if (mixer) {
        mixer.update(delta);
    }
    
    // Update character mixer
    if (characterMixer) {
        characterMixer.update(delta);
    }
    
    // Animate birds
    birds.forEach((bird, index) => {
        if(bird.mixer) {
            bird.mixer.update(delta);
        }
        
        // Flying motion
        const time = Date.now() * 0.001;
        const radius = 30;
        
        bird.model.position.x = bird.initialPosition.x + Math.sin(time + bird.phase) * radius;
        bird.model.position.z = bird.initialPosition.z + Math.cos(time + bird.phase) * radius;
        bird.model.position.y = bird.initialPosition.y + Math.sin(time * 2 + bird.phase) * 5;
        
        // Rotate bird in flying direction
        const angle = Math.atan2(
            bird.model.position.x - bird.model.position.prevX || 0,
            bird.model.position.z - bird.model.position.prevZ || 0
        );
        bird.model.rotation.y = angle;
        
        bird.model.position.prevX = bird.model.position.x;
        bird.model.position.prevZ = bird.model.position.z;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e);
});