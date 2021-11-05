import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    // minify: false,
    polyfillModulePreload: false,
  },
  // server: {
  //   hmr: false,
  // },
})
