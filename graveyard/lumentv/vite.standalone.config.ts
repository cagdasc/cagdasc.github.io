import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, '../../dist-lumentv/web'),
    emptyOutDir: true,
  },
});
