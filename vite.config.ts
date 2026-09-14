import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://booking-com15.p.rapidapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-rapidapi-host', 'booking-com15.p.rapidapi.com');
            proxyReq.setHeader('x-rapidapi-key', '966b45ce4amsh9f60e9942569079p12d9bejsn6fc77036cb01');
          });
        },
      },
    },
  },
});
