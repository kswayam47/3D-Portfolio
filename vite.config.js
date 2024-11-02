import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  assetsInclude: ['**/*.fbx', '**/*.glsl'],
  resolve: {
    alias: {
      'three': '/node_modules/three',
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        contact: './contact.html'
      }
    }
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript'
    }
  }
});