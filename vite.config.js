import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from "@tailwindcss/vite";
import { nodeResolve } from '@rollup/plugin-node-resolve'; // resolves bare module imports with firebase

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    nodeResolve(), // ensure firebase imports are correctly resolved
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json', // copy manifest for extension
          dest: '.',
        },
        {
          src: 'public/offscreen.html', // copy offscreen doc, if needed
          dest: '.'
        },
        {
          src: 'public/offscreen.js', // copy offscreen script, if needed
          dest: '.'
        },
        {
          src: 'contentScript.js',
          dest: '.'
        }
      ],
    }),
  ],
  build: {
    outDir: 'build', // final build output folder
    rollupOptions: {
      input: {
        main: './index.html',          // main popup page
        sidepanel: './sidepanel.html', // side panel page
        background: './src/background.js'  // background service worker
      },
      output: {
        entryFileNames: '[name].js' // make sure output file match entry name
      }
    },
  },
});
