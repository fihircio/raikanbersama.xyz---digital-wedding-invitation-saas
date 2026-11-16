import path from 'path';
import { execSync } from 'node:child_process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Stamped into index.html so any build (dev server, preview, production) can be
// identified objectively. Fixture content cannot be used to tell environments
// apart, because fixtures are the same code in every environment.
const resolveBuildStamp = (): string => {
  let sha = 'nogit';
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    // git unavailable (e.g. production build from a tarball)
  }
  return `${sha}@${new Date().toISOString()}`;
};
const BUILD_STAMP = resolveBuildStamp();

const injectBuildStamp = () => ({
  name: 'inject-build-stamp',
  transformIndexHtml(html: string): string {
    const tag = `<meta name="build-stamp" content="${BUILD_STAMP}" />`;
    return html.replace('</head>', `  ${tag}\n</head>`);
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    plugins: [react(), injectBuildStamp()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
  };
});
