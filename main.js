import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./node_modules/three/examples/jsm/loaders/RGBELoader.js";

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
            model.position.setY(-75);
            model.scale.set(1, 1, 1); // Update scale on resize for mobile
        } else {
            model.position.setY(-15);
            model.scale.set(2, 2, 2); // Update scale on resize for desktop
        }
    }
});

// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dark_forest_1k.hdr',
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
            model.position.set(-3.0, -45, -25.3);
            model.scale.set(1, 1, 1); // Smaller scale for mobile
        } else {
            model.position.set(-3.84, -15, -21.3);
            model.scale.set(2, 2, 2); // Original scale for desktop
            model.rotation.set(0, 0, 0);
        }

        if(isMobile()) {
            camera.position.set(0, 2, 90);
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e);
});