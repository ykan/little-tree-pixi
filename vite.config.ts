import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    assetsDir: 'js_css',
    rollupOptions: {
      input: {
        main: './index.html',
        heapDemo: '/heap-demo.html',
      },
    },
  },
  // server: {
  //   hmr: false,
  // },
})
