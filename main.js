import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./node_modules/three/examples/jsm/loaders/RGBELoader.js";
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
const scene = new THREE.Scene();
const canvas = document.querySelector("#canvas");

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


function isMobile() {
    return window.innerWidth <= 768;
}


let lastIsMobile = isMobile();


function handleScreenTransition() {
    const currentIsMobile = isMobile();
    
    
    if (currentIsMobile !== lastIsMobile) {
       
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.style.display = 'flex';
            loaderElement.style.opacity = '1';
        }
    
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }
    
    lastIsMobile = currentIsMobile;
}


const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';


const textureCache = new Map();
function loadTexture(path) {
    if (textureCache.has(path)) {
        return Promise.resolve(textureCache.get(path));
    }
    return new Promise((resolve, reject) => {
        textureLoader.load(path, 
            texture => {
                textureCache.set(path, texture);
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

function loadBackground() {
    const texturePath = isMobile() 
        ? './assets/env.jpg'  
        : './assets/mists1.png';    

    loadTexture(texturePath).then(texture => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        texture.needsUpdate = true;
        scene.background = texture;
    }).catch(error => {
        console.error('Error loading background texture:', error);
    });
}

loadBackground();

window.addEventListener("resize", function() {
  
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        handleScreenTransition();
        
        if (lastIsMobile === isMobile()) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            
         
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
    }, 250); 
});

const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/rainforest_trail_1k.hdrsc',
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }
);

const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 90);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

if (isMobile()) {
    controls.enabled = false;
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x00ff00, 0.2);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);


const clock = new THREE.Clock();
let mixer;


const loader = new GLTFLoader();

let birds = [];
let character;
let characterMixer;
const birdPaths = [
    './assets/bird.glb', 
];

let totalModelsToLoad = 0;
let loadedModels = 0;

function updateTotalLoadingProgress() {
    loadedModels++;
    const progress = (loadedModels / totalModelsToLoad) * 100;
    updateLoadingProgress(progress);
    
    if (loadedModels === totalModelsToLoad) {
        const loaderElement = document.getElementById('loader');
        loaderElement.style.opacity = "0";
        setTimeout(() => {
            loaderElement.style.display = 'none';
            startTextAnimation();
        }, 500);
    }
}

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
            resolve(); 
        }
    });
}
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
                 
                    bird.traverse((child) => {
                        if (child.isMesh) {
                            child.material.depthTest = true;
                            child.material.depthWrite = true;
                            child.renderOrder = 0;
                        }
                    });
                    
                    bird.position.set(
                        Math.random() * 100 - 50,
                        Math.random() * 30 + 10,
                        Math.random() * 100 - 20
                    );
                    
               
                    bird.scale.set(0.2, 0.2, 0.2);
                    
              
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

totalModelsToLoad = isMobile() ? 2 : 3; 

loader.load(
    isMobile() ? './assets/ballon.glb' : './assets/mobile_home.glb',
    function (gltf) {
        const model = gltf.scene;
        
     
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        if (isMobile()) {
            model.position.set(-6, -45, -45.3);
            model.scale.set(0.018,0.018, 0.018);
            camera.position.set(10, -50,100); 
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
                0, 
                THREE.MathUtils.degToRad(87), 
                0   
            );
        }

  
        mixer = new THREE.AnimationMixer(model);
        
        
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        
        scene.add(model);
        updateTotalLoadingProgress();

     
        Promise.all([
            createBirds(),
            createCharacter()
        ]).catch(error => {
            console.error('Error loading additional models:', error);
            updateTotalLoadingProgress(); 
        });
    },

    function (xhr) {
       
        const percentComplete = (xhr.loaded / xhr.total) * 100 / totalModelsToLoad;
        updateLoadingProgress(percentComplete);
    },

    function (error) {
        console.error('Error loading model:', error);
        updateTotalLoadingProgress(); 
    }
);

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }
    
    
    if (characterMixer) {
        characterMixer.update(delta);
    }
    birds.forEach((bird, index) => {
        if(bird.mixer) {
            bird.mixer.update(delta);
        }
        
     
        const time = Date.now() * 0.001;
        const radius = 30;
        
        bird.model.position.x = bird.initialPosition.x + Math.sin(time + bird.phase) * radius;
        bird.model.position.z = bird.initialPosition.z + Math.cos(time + bird.phase) * radius;
        bird.model.position.y = bird.initialPosition.y + Math.sin(time * 2 + bird.phase) * 5;
        
      
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