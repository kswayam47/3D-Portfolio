// Update import paths
import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js';

// Rest of the code remains the same

// Scene setup
const canvas = document.querySelector('#canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Initial camera position
camera.position.set(0, 0, 51.2);
camera.rotation.set(-0.7853, 0, 0);
camera.fov = 45;
camera.updateProjectionMatrix();

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.5;
controls.maxDistance = 180;
controls.minDistance = 10;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;
controls.enableSmoothing = true;
controls.smoothTime = 1.0;

// Load HDRI environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_sunrise_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// Create sphere
const textureLoader = new THREE.TextureLoader();
const sphereGeometry = new THREE.SphereGeometry(200, 64, 64);
const sphereTexture = textureLoader.load('./assets/sky2.jpg');
sphereTexture.wrapS = THREE.RepeatWrapping;
sphereTexture.wrapT = THREE.RepeatWrapping;
sphereTexture.repeat.set(4, 2);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 1,
    roughness: 0.1,
    transmission: 0.2,
    thickness: 0.5,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    map: sphereTexture,
    envMapIntensity: 1.5,
    side: THREE.BackSide,
    metalness: 0.1,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Load 3D Model
const loader = new GLTFLoader();
let loadedModel;

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

// Create separate controls for the model
let modelControls = null;

loader.load('./assets/scene3.glb', 
    // Success callback
    (gltf) => {
        const loaderElement = document.getElementById('loader');
        loaderElement.style.opacity = "0";
        setTimeout(() => {
            loaderElement.style.display = 'none';
            startTextAnimation();
        }, 500);
        
        loadedModel = gltf.scene;
        const model = loadedModel;
        
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 30 / maxDimension;
        model.scale.setScalar(scale);
        
        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        function updateModelPosition() {
            if (window.innerWidth < 768) {
                model.position.set(9, -30, 1.84);
                const mobileScale = 20 / maxDimension;
                model.scale.setScalar(mobileScale);
                
                // Setup mobile controls
                if (!modelControls) {
                    modelControls = new OrbitControls(camera, canvas);
                    modelControls.enableDamping = true;
                    modelControls.dampingFactor = 0.1;
                    modelControls.rotateSpeed = 1.5;
                    modelControls.enableZoom = false;
                    modelControls.enablePan = false;
                    
                    // Lock vertical rotation
                    modelControls.minPolarAngle = Math.PI / 2;
                    modelControls.maxPolarAngle = Math.PI / 2;
                    
                    // Limit horizontal rotation
                    modelControls.minAzimuthAngle = -Infinity;
                    modelControls.maxAzimuthAngle = Infinity;
                    
                    // Set the target to the model's position
                    modelControls.target.set(5, -15, 1.84);
                }
                modelControls.enabled = true;
            } else {
                model.position.set(25, -6.2, 1.84);
                const scale = 30 / maxDimension;
                model.scale.setScalar(scale);
                
                // Disable controls on desktop
                if (modelControls) {
                    modelControls.enabled = false;
                }
            }
        }
        
        scene.add(model);
        updateModelPosition();
        window.addEventListener('resize', updateModelPosition);
    },
    // Progress callback
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        updateLoadingProgress(percentComplete);
    },
    // Error callback
    (error) => {
        console.error('An error occurred loading the model:', error);
        // Hide loader and show content even if model fails to load
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

// Disable the original controls
controls.enabled = false;

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

// Update the model positioning function
function updateModelPosition() {
    if (window.innerWidth < 768) { // md breakpoint
        model.position.set(0, -10, 1.84); // Centered and adjusted height for mobile
    } else {
        model.position.set(25, -6.2, 1.84); // Original position for md and up
    }
}

// Update camera position for mobile
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (window.innerWidth < 768) {
        camera.position.set(0, -10, 65); // Adjusted for better mobile view
    } else {
        camera.position.set(0, 0, 51.2); // Original position
    }
    camera.updateProjectionMatrix();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Only update model controls if they exist and are enabled
    if (modelControls && modelControls.enabled) {
        modelControls.update();
    }
    
    renderer.render(scene, camera);
}
animate();

