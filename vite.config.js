import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: true, // allow external access
    allowedHosts: [
      "outlaw-golf.vercel.app", // your ngrok URL
    ],
  },

  resolve: {
    alias: {
      process: resolve(__dirname, "node_modules/process/browser.js"),
      buffer: resolve(__dirname, "node_modules/buffer/index.js"),
      stream: resolve(__dirname, "node_modules/stream-browserify/index.js"),
      util: resolve(__dirname, "node_modules/util/util.js"),
    },
  },

  define: {
    global: "globalThis",
    "process.env": {},
  },

  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify", "util"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
});