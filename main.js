import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./node_modules/three/examples/jsm/loaders/RGBELoader.js";
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

// Scene setup
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

// Modify the background texture setup
const textureLoader = new THREE.TextureLoader();
function loadBackground() {
    const texturePath = isMobile() 
        ? './assets/env.jpg'  // Mobile background
        : './assets/mists.png';     // Desktop background

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

// Update the resize event listener to handle background changes
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Reload background when screen size changes between mobile and desktop
    loadBackground();
    
    // Update model position when screen size changes
    const model = scene.getObjectByProperty('type', 'Group'); // Get the loaded model
    if (model) {
        if (isMobile()) {
            model.position.setY(-50);
            model.scale.set(0.8, 0.8, 0.8); // Update scale on resize for mobile
        } else {
            model.position.setY(-15);
            model.scale.set(2, 2, 2); // Update scale on resize for desktop
        }
    }

    // Update character position when screen size changes
    if (character) {
        if (isMobile()) {
            character.position.set(-25, -30, -7);
            character.scale.set(0.07, 0.07, 0.07);
        } else {
            character.position.set(-55, -3, -7);
            character.scale.set(0.11, 0.11, 0.11);
        }
    }
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

// Add this function to create birds
function createBirds() {
    const birdLoader = new GLTFLoader();
    
    for(let i = 0; i < 5; i++) {
        birdLoader.load(birdPaths[0], (gltf) => {
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
        });
    }
}

// Add this function to create the waving character
function createCharacter() {
    const characterLoader = new FBXLoader();
    characterLoader.load('./assets/Waving.fbx', (fbx) => {
        character = fbx;
        
        // Set position and scale based on screen size
        if (isMobile()) {
            character.position.set(-26, -35, -15); // Adjusted position for mobile
            character.scale.set(0.04, 0.04, 0.04); // Smaller scale for mobile
        } else {
            character.position.set(-55, -3, -7); // Original desktop position
            character.scale.set(0.11, 0.11, 0.11); // Original desktop scale
        }
        
        // Rotate to face towards the center/camera
        
        // Setup character animation
        characterMixer = new THREE.AnimationMixer(character);
        if(character.animations.length) {
            const waveAction = characterMixer.clipAction(character.animations[0]);
            waveAction.play();
        }
        
        // Remove cloud effect and just add a subtle glow
        const characterLight = new THREE.PointLight(0x7928CA, 1, 10);
        characterLight.position.copy(character.position);
        
        scene.add(character);
        scene.add(characterLight);
    });
}

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

// Call these functions after your main model is loaded
loader.load(
    './assets/mobile_home.glb',
    function (gltf) {
        // Hide loader when model is ready
        const loaderElement = document.getElementById('loader');
        loaderElement.style.opacity = "0";
        setTimeout(() => {
            loaderElement.style.display = 'none';
            startTextAnimation();
        }, 500);

        const model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Set position and scale based on screen size
        if (isMobile()) {
            model.position.set(-6, -45, -45.3);
            model.scale.set(1, 1, 1); // Smaller scale for mobile
        } else {
            model.position.set(-3.84, -15, -21.3);
            model.scale.set(2, 2, 2); // Original scale for desktop
            model.rotation.set(0, 0, 0);
        }

        if(isMobile()) {
            camera.position.set(0, -20, 90);
        }

        // Set perfect rotation (y = 87 degrees)
        model.rotation.set(
            0,  // X rotation
            THREE.MathUtils.degToRad(87), // Y rotation
            0   // Z rotation
        );
        
        // Setup animations
        mixer = new THREE.AnimationMixer(model);
        
        // Play all animations
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        
        // Add these lines after the model is loaded
        createBirds();
        createCharacter();
        
        scene.add(model);
    },
    // Progress callback
    function (xhr) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        updateLoadingProgress(percentComplete);
    },
    // Error callback
    function (error) {
        console.error('Error loading model:', error);
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.style.opacity = "0";
            setTimeout(() => {
                loaderElement.style.display = 'none';
                startTextAnimation();
            }, 500);
        }
    }
);

animate();

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e);
});