import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, type Connect, type Plugin } from 'vite';
import {
  handleLocalFetchRequest,
  handleLocalStreamRequest,
} from './graveyard/lumentv/server/relay';

function attachLocalRelayMiddleware(middlewares: Connect.Server): void {
  middlewares.use('/__local_fetch', (req, res) => {
    void handleLocalFetchRequest(req, res);
  });

  middlewares.use('/__local_stream', (req, res) => {
    void handleLocalStreamRequest(req, res);
  });
}

function lumenLocalRelayPlugin(): Plugin {
  return {
    name: 'lumentv-local-relay',
    configureServer(server) {
      attachLocalRelayMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachLocalRelayMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), lumenLocalRelayPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          'graveyard/asteroid-through-time/index': path.resolve(
            __dirname,
            'graveyard/asteroid-through-time/index.html'
          ),
          'graveyard/lumentv/index': path.resolve(
            __dirname,
            'graveyard/lumentv/index.html'
          ),
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
