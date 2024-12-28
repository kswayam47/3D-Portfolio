document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    
    document.querySelectorAll('.form-group').forEach((group, index) => {
        group.style.setProperty('--index', index);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        
        if (!validateForm()) {
            showErrorMessage('Please fill in all required fields correctly');
            return;
        }

    
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            description: document.getElementById('message').value.trim()
        };

        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Server error occurred');
            }

            if (result.success) {
                showSuccessMessage();
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage(error.message || 'Failed to send message. Please try again later.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
});

function showSuccessMessage() {
    
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = 'Message sent successfully!';
    document.body.appendChild(message);

    
    setTimeout(() => message.classList.add('show'), 100);

    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function showErrorMessage(errorText) {
    
    const message = document.createElement('div');
    message.className = 'success-message error';
    message.textContent = errorText;
    document.body.appendChild(message);

    
    setTimeout(() => message.classList.add('show'), 100);

    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}


function validateForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    let isValid = true;

    if (!name.value.trim()) {
        highlightError(name);
        isValid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
        highlightError(email);
        isValid = false;
    }

    if (!message.value.trim()) {
        highlightError(message);
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function highlightError(element) {
    element.classList.add('error');
    element.addEventListener('input', () => {
        element.classList.remove('error');
    }, { once: true });
}


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Scene3D {
    constructor() {
        this.container = document.getElementById('3d-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'mediump'
        });
        
        this.init();
    }

    init() {
    
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        
        this.camera.position.set(0, 1, 5);

    
        this.controls = new OrbitControls(this.camera, this.container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;
        this.controls.enableZoom = false;  


        
        this.addLights();

   
        this.showLoadingIndicator();

        this.loadModel();

        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        loader.load(
            '/assets/source/robot.glb',
            (gltf) => {
                this.model = gltf.scene;
                
                
                this.model.scale.setScalar(1);
                this.model.position.set(0, 0, 0);

               
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.needsUpdate = true;
                        }
                    }
                });

              
                this.scene.add(this.model);

                
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = this.camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                cameraZ *= 1.5; 

                this.camera.position.z = cameraZ;
                this.camera.lookAt(center);
                this.camera.updateProjectionMatrix();

           
                this.controls.target.copy(center);
                this.controls.update();

                this.hideLoadingIndicator();
            },
    
            (xhr) => {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                console.log('Loading progress:', percentComplete + '%');
                this.updateLoadingProgress(percentComplete);
            },
        
            (error) => {
                console.error('An error occurred loading the model:', error);
                this.hideLoadingIndicator();
                this.showErrorMessage('Failed to load 3D model');
            }
        );
    }

    addLights() {
     
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

       
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

      
        const pointLight1 = new THREE.PointLight(0x2194ce, 1);
        pointLight1.position.set(5, 3, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x34D399, 1);
        pointLight2.position.set(-5, -3, -5);
        this.scene.add(pointLight2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

       
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'model-loader';
        loadingDiv.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">Loading 3D Model...</div>
                <div class="loader-progress">0%</div>
            </div>
        `;
        this.container.parentElement.appendChild(loadingDiv);
    }

    updateLoadingProgress(progress) {
        const progressElement = document.querySelector('#model-loader .loader-progress');
        if (progressElement) {
            progressElement.textContent = `${Math.round(progress)}%`;
        }
    }

    hideLoadingIndicator() {
        const loadingDiv = document.getElementById('model-loader');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'model-error';
        errorDiv.innerHTML = message;
        this.container.parentElement.appendChild(errorDiv);
    }

    onWindowResize() {
     
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();

        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  
    initializeForm();
    
   
    new Scene3D();
});

function initializeForm() {
    
}