import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // External dependencies that shouldn't be bundled
      external: ["@pdftron/webviewer"],
      output: {
        // Global variables to use for externalized dependencies
        globals: {
          "@pdftron/webviewer": "WebViewer",
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Optimize build speed
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
