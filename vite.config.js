import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        watch: {
            usePolling: true,
            interval: 500,
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
});