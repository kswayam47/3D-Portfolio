import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

class PreloadManager {
    constructor() {
        this.cache = new Map();
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.rgbeLoader = new RGBELoader(this.loadingManager);
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        // Initialize loaders and cache
        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            console.log(`Background loading: ${Math.round(progress)}%`);
        };

        this.initialized = true;
    }

    async preloadSkillsPage() {
        await this.init();
        
        try {
            // Preload shaders
            const shaderPromises = [
                fetch('/shaders/skillvertex.glsl').then(r => r.text()),
                fetch('/shaders/skillfragment.glsl').then(r => r.text())
            ];

            // Preload textures
            const texturePromises = [
                'imaginarium',
                'purple-Rain',
                'sunset-vibes',
                'pink-floyd',
                'passion'
            ].map(name => 
                new Promise((resolve) => {
                    this.textureLoader.load(
                        `/assets/gradients/${name}.png`,
                        (texture) => {
                            this.cache.set(`texture_${name}`, texture);
                            resolve(texture);
                        }
                    );
                })
            );

            // Wait for all resources to load
            const [vertexShader, fragmentShader] = await Promise.all([
                ...shaderPromises,
                ...texturePromises
            ]);

            // Cache shaders
            this.cache.set('skillsVertexShader', vertexShader);
            this.cache.set('skillsFragmentShader', fragmentShader);

            console.log('Skills page resources preloaded successfully');
            return true;
        } catch (error) {
            console.error('Error preloading skills page:', error);
            return false;
        }
    }

    getResource(key) {
        return this.cache.get(key);
    }
}

// Create and expose the preload manager globally
window.preloadManager = new PreloadManager();

// Add navigation listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start preloading after main content is loaded
    setTimeout(() => {
        window.preloadManager.preloadSkillsPage();
    }, 2000);

    // Add hover preload triggers
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            const path = link.getAttribute('href');
            if (path === '/skills') {
                window.preloadManager.preloadSkillsPage();
            }
        });
    });
});