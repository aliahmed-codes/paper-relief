import { resolve } from "node:path";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import pugPlugin from "vite-plugin-pug";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    pugPlugin({ pretty: true, localImports: true }),
    imagetools(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],

  build: {
    assetsInlineLimit: 0,
    outDir: "dist",
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
      },
    },
  },
});