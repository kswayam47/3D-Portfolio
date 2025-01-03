import * as THREE from 'three';
import { Text } from 'troika-three-text';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import  CustomShaderMaterial  from 'three-custom-shader-material';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let isanimating=false;
let currentindex=0;

const textureLoader = new THREE.TextureLoader();


let isScrollLocked = false;
const ANIMATION_DURATION = 1000; 

const blobs = [
    {
        name: 'GSAP',
        background: '#0B1D15',
        config: { "uPositionFrequency": 0.28, "uPositionStrength": 0.62, "uSmallWavePositionFrequency": .59,"uSmallWavePositionStrength": 0.94,uSmallWaveTimeFrequency:"0", "roughness": 1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "imaginarium" },
    },
    {
        name: 'FRONT-END',
        background: '#0D0A2E',
        config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "deep-ocean" },
    },
    
    {
        name: 'THREE JS',
        background: '#111111',
        config: { "uPositionFrequency": 0.3, "uPositionStrength": 1., "uSmallWavePositionFrequency": 2 ,"uSmallWavePositionStrength": 0.1, "roughness": 1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "imaginarium" },
    },
 

    {
        name: 'MERN STACK',
        background: '#130707',
        config: { "uPositionFrequency": 1.022, "uPositionStrength": 1.04, "uSmallWavePositionFrequency": 0.378, "uSmallWavePositionStrength": 0.541, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "sunset-vibes" },
    },
    {
        name: 'OOP',
        background: '#4B4D10',
        config: { "uPositionFrequency": 0.16, "uPositionStrength": 1.53, "uSmallWavePositionFrequency": 1.42, "uSmallWavePositionStrength": 0.3, "roughness": 0.3, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "pink-floyd" },
    },
 
    {
        name: 'JAVA',
        background: '#0B1D15',
        config: { "uPositionFrequency": 0.16, "uPositionStrength": 0, "uSmallWavePositionFrequency": 1.71,"uSmallWaveTimeFrequency":0.5, "uSmallWavePositionStrength": 0.1, "roughness": .1, "metalness": 1, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cd" },
    },
    {
        name: 'DSA',
        background: '#130707',
        config: { "uPositionStrength": 0.92, "uTimeFrequency": 1.14, "uPositionFrequency": 0.57, "uSmallWavePositionFrequency": 0.23, "uSmallWavePositionStrength": 0.43, "uSmallWaveTimeFrequency": 1.51, "roughness": 0.1, "metalness": 0.9, "envMapIntensity": 1.2, "clearcoat": 1.0, "clearcoatRoughness": 0.1, "transmission": 0, "flatShading": false, "wireframe": false, "map": "imaginarium" },
    },
  

]


//const customFont = 'https://fonts.gstatic.com/s/syncopate/v19/pe0sMIuPIYBCpEV5eFdCBfe5.woff2'; // Syncopate font

 //const customFont = 'https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pb0EPOqeeHkkbIxyyg.woff2'; // Rajdhani
 //const customFont = 'https://fonts.gstatic.com/s/chakrapetch/v9/cIf6MapbsEk7TDLdtEz1BwkWi6pgeL4.woff2'; // Chakra Petch
const customFont = 'https://fonts.gstatic.com/s/audiowide/v16/l7gdbjpo0cum0ckerWCdlg_O.woff2'; // Audiowide
// const customFont = 'https://fonts.gstatic.com/s/exo2/v20/7cH1v4okm5zmbvwkAx_sfcEuiD8jvvKsN9C_.woff2'; // Exo 2


document.head.appendChild(
    Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap"
    })
);


let loadingScreen, progressBar, progressText;


const TOUCH_THRESHOLD = 50; 
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;


function isMobile() {
    return window.innerWidth <= 768;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        
        loadingScreen = document.querySelector('.loading-screen');
        progressBar = document.querySelector('.progress-bar');
        progressText = document.querySelector('.progress-text');
        
        document.body.classList.add('loading');


        const loadingManager = new THREE.LoadingManager();
        
        
        const rgbeLoader = new RGBELoader(loadingManager);
        const textureLoader = new THREE.TextureLoader(loadingManager);

        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal * 100).toFixed(0);
            if (progressBar && progressText) {
            
                gsap.to(progressBar, {
                    width: `${progress}%`,
                    duration: 0.5,
                    ease: "power1.out"
                });

                
                gsap.to(progressText, {
                    innerHTML: progress,
                    duration: 0.5,
                    snap: {
                        innerHTML: 1
                    },
                    onUpdate: function() {
                        progressText.innerHTML = Math.round(this.targets()[0].innerHTML) + '%';
                    }
                });
            }
            console.log(`Loading progress: ${progress}% (${itemsLoaded}/${itemsTotal})`);
        };

    
        loadingManager.onLoad = () => {
            console.log('Loading complete!');
            
            
            function animate() {
                requestAnimationFrame(animate);
                uniforms.uTime.value = performance.now() / 1000;
                renderer.render(scene, camera);
            }
            animate();

            
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    document.body.classList.remove('loading');
                    
                    gsap.to(['#skillscanvas', '.static-heading', '.scroll-indicator'], {
                        opacity: 1,
                        duration: 1,
                        stagger: 0.2,
                        ease: "power2.out"
                    });
                    
          
                }
            });
        };

        loadingManager.onError = (url) => {
            console.error('Error loading:', url);
        };

    
        const vertexShader = await fetch('./shaders/skillvertex.glsl').then(r => r.text());
        const fragmentShader = await fetch('./shaders/skillfragment.glsl').then(r => r.text());
        const textvertexShader = await fetch('./shaders/textvertexshader.glsl').then(r => r.text());

        const skillscanvas = document.getElementById('skillscanvas');
        if (!skillscanvas) {
            throw new Error('Canvas element not found');
        }

        
        const renderer = new THREE.WebGLRenderer({ 
            canvas: skillscanvas,
            antialias: true 
        });
        
        if (!renderer) {
            throw new Error('Failed to initialize WebGL renderer');
        }

        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        scene.background=new THREE.Color('#130707');
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer.setSize(window.innerWidth, window.innerHeight);
    
      
        const texture = await rgbeLoader.loadAsync('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr');
       // const texture = await rgbeLoader.loadAsync('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/klippad_dawn_2_1k.hdr');
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        
        
      
        camera.position.z = 5;
        const geometry = new THREE.IcosahedronGeometry(
            isMobile() ? 1.2 : 1.4, 
            isMobile() ? 35 : 70    
        );
const uniforms={
    uTime:{value:0},
    uPositionStrength:{value:blobs[currentindex].config.uPositionStrength || 0},
    uTimeFrequency:{value:blobs[currentindex].config.uTimeFrequency || 0.77},
    uPositionFrequency:{value:blobs[currentindex].config.uPositionFrequency || 0.16},
    uSmallWavePositionFrequency:{value:blobs[currentindex].config.uSmallWavePositionFrequency || 1.36},
    uSmallWavePositionStrength:{value:blobs[currentindex].config.uSmallWavePositionStrength || 0.21},
    uSmallWaveTimeFrequency:{value:blobs[currentindex].config.uSmallWaveTimeFrequency || 0.47},
}
        
        const material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            map: textureLoader.load(`./assets/gradients/${blobs[currentindex].config.map}.png`),
            metalness: 0.1,
            roughness: 1,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        uniforms,
        });
         const mergedgeometry=mergeVertices(geometry);
        mergedgeometry.computeTangents();
        console.log(mergedgeometry);
        // Create mesh and add to scene
        const sphere = new THREE.Mesh(mergedgeometry, material);
        scene.add(sphere);
        sphere.position.set(0,-1,0);
        const textMaterial = new THREE.ShaderMaterial({
            vertexShader: `
            uniform float progress;
uniform float direction;

#define PI 3.1415926538

vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
    return mix(dot(axis, p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}

void main() {
    vec3 pos = position;

    float twirlPeriod = sin(progress * PI * 2.);

    float rotateAngle = -direction * pow(sin(progress * PI), 1.5) * PI * 2.;

    float twirlAngle = -sin(uv.x - .5) * pow(twirlPeriod, 2.0) * -4.;

    float twirlRotate = rotateAngle + twirlAngle;

    pos = rotateAxis(pos, vec3(1., 0., 0.), twirlRotate);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
            `,
            fragmentShader: `
                varying vec2 vUv;
                
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms:{
                progress:{value:0},
                  direction:{value:1}

            }
        });
         const texts = blobs.map((blob, index) => {
           const mytext = new Text();
           mytext.text = blob.name;
           mytext.fontURL = customFont;
           mytext.anchorX = 'center';
           mytext.anchorY = 'middle';
           mytext.material = textMaterial;
           mytext.position.set(0, 0.6, 3);
           mytext.scale.set(0.5, 0.5, 0.5);
           if(index != 0) {
               mytext.scale.set(0, 0, 0);
           }
           mytext.letterSpacing = 0;
           mytext.fontSize = window.innerWidth <= 768 ? 
               Math.min(window.innerWidth/1200, 0.8) : 
               Math.min(window.innerWidth/4500, 0.35);  
           mytext.glyphGeometryDetail = 32;
           mytext.fontWeight = 700;
           if(isMobile){
           mytext.letterSpacing =window.innerWidth <= 768 ? 0.08 :2;}
        
           mytext.sync();

           scene.add(mytext);
           return mytext;
         });
         const bg=new THREE.Color(blobs[currentindex].background);
        
    
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator && scrollIndicator.style.display !== 'none') {
                gsap.to(scrollIndicator, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        scrollIndicator.style.display = 'none';
                    }
                });
            }
            
            
            if (isanimating || isScrollLocked) return;
            
    
            isScrollLocked = true;
            isanimating = true;
            
    
            let direction;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                direction = Math.sign(e.deltaX);
            } else {
                
                direction = Math.sign(e.deltaY);
            }
            
            let next = (currentindex + direction + blobs.length) % blobs.length;
            
            texts[next].scale.set(0.5, 0.5, 0.5);
            texts[next].position.x = direction * 3.5;
            
            
            textMaterial.uniforms.direction.value = direction;
            
            gsap.to(textMaterial.uniforms.progress, {
                value: 0.5,
                duration: 1,
                ease: 'power2.inOut',
                onComplete: () => {
                    textMaterial.uniforms.progress.value = 0;
                    texts[currentindex].scale.set(0, 0, 0);
                    currentindex = next;
                    isanimating = false;
                    
                    
                    setTimeout(() => {
                        isScrollLocked = false;
                    }, 100); 
                }
            });
            
            
            gsap.to(texts[currentindex].position, {
                x: -direction * 5,
                duration: 1,
                ease: 'power2.inOut',
            });
            
            gsap.to(sphere.rotation, {
                y: sphere.rotation.y + Math.PI * 4 * -direction,
                duration: 1,
                ease: 'power2.inOut',
            });
            
            gsap.to(texts[next].position, {
                x: 0,
                duration: 1,
                ease: 'power2.inOut',
            });
            
            const bg = new THREE.Color(blobs[next].background);
            gsap.to(scene.background, {
                r: bg.r,
                g: bg.g,
                b: bg.b,
                duration: 1,
                ease: 'linear',
            });
            
            updateBlob(blobs[next].config);
        }, { passive: false });

        function updateBlob(config) {
            if (config.uPositionFrequency !== undefined) gsap.to(material.uniforms.uPositionFrequency, { value: config.uPositionFrequency, duration: 1, ease: 'power2.inOut' });
            if (config.uPositionStrength !== undefined) gsap.to(material.uniforms.uPositionStrength, { value: config.uPositionStrength, duration: 1, ease: 'power2.inOut' });
            if (config.uSmallWavePositionFrequency !== undefined) gsap.to(material.uniforms.uSmallWavePositionFrequency, { value: config.uSmallWavePositionFrequency, duration: 1, ease: 'power2.inOut' });
            if (config.uSmallWavePositionStrength !== undefined) gsap.to(material.uniforms.uSmallWavePositionStrength, { value: config.uSmallWavePositionStrength, duration: 1, ease: 'power2.inOut' });
            if (config.uSmallWaveTimeFrequency !== undefined) gsap.to(material.uniforms.uSmallWaveTimeFrequency, { value: config.uSmallWaveTimeFrequency, duration: 1, ease: 'power2.inOut' });
            if (config.map !== undefined) {
                const newTexture = textureLoader.load(`./assets/gradients/${config.map}.png`);
                material.map = newTexture;
                material.needsUpdate = true;
            }
            if (config.roughness !== undefined) gsap.to(material, { roughness: config.roughness, duration: 1, ease: 'power2.inOut' });
            if (config.metalness !== undefined) gsap.to(material, { metalness: config.metalness, duration: 1, ease: 'power2.inOut' });
            if (config.envMapIntensity !== undefined) gsap.to(material, { envMapIntensity: config.envMapIntensity, duration: 1, ease: 'power2.inOut' });
            if (config.clearcoat !== undefined) gsap.to(material, { clearcoat: config.clearcoat, duration: 1, ease: 'power2.inOut' });
            if (config.clearcoatRoughness !== undefined) gsap.to(material, { clearcoatRoughness: config.clearcoatRoughness, duration: 1, ease: 'power2.inOut' });
            if (config.transmission !== undefined) gsap.to(material, { transmission: config.transmission, duration: 1, ease: 'power2.inOut' });
            if (config.flatShading !== undefined) gsap.to(material, { flatShading: config.flatShading, duration: 1, ease: 'power2.inOut' });
            if (config.wireframe !== undefined) gsap.to(material, { wireframe: config.wireframe, duration: 1, ease: 'power2.inOut' });
        }
          
    

        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        
        window.addEventListener('resize', () => {
            texts.forEach(text => {
                text.fontSize = window.innerWidth <= 768 ? 
                    Math.min(window.innerWidth/1200, 0.8) : 
                    Math.min(window.innerWidth/4500, 0.35);  
                text.sync();
            });
        });

        
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (isanimating || isScrollLocked) return;

    
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator && scrollIndicator.style.display !== 'none') {
                gsap.to(scrollIndicator, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        scrollIndicator.style.display = 'none';
                    }
                });
            }

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;
            const timeDiff = touchEndTime - touchStartTime;
            
            
            if (timeDiff < 300 && (Math.abs(deltaX) > TOUCH_THRESHOLD || Math.abs(deltaY) > TOUCH_THRESHOLD)) {
            
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    
                    const wheelEvent = new WheelEvent('wheel', {
                        deltaX: deltaX * 2,
                        deltaY: 0,
                        bubbles: true
                    });
                    window.dispatchEvent(wheelEvent);
                }
            }
        }, { passive: false });

        
        window.removeEventListener('touchmove', null);

        
        function animateBlob() {
            const time = performance.now() / 1000;
            sphere.rotation.y = time * 0.1; 
            sphere.position.y = Math.sin(time * 0.5) * 0.1 - 1; 
        }

        function animate() {
            requestAnimationFrame(animate);
            uniforms.uTime.value = performance.now() / 1000;
            animateBlob();
            renderer.render(scene, camera);
        }

        function createParticleBackground() {
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = 200;
            
            const positions = new Float32Array(particleCount * 3);
            for(let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 10;
                positions[i + 1] = (Math.random() - 0.5) * 10;
                positions[i + 2] = (Math.random() - 0.5) * 10;
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const particleMaterial = new THREE.PointsMaterial({
                size: 0.02,
                color: 0xffffff,
                transparent: true,
                opacity: 0.5
            });
            
            const particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);
            
            return particles;
        }

        const backgroundParticles = createParticleBackground();

    } catch (error) {
        console.error('Failed to initialize Three.js:', error);
    }
});
