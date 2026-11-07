import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),
      "@hooks": path.resolve(import.meta.dirname, "./src/hooks"),
      "@pages": path.resolve(import.meta.dirname, "./src/pages"),
      "@providers": path.resolve(import.meta.dirname, "./src/providers"),
      "@layouts": path.resolve(import.meta.dirname, "./src/layouts"), 
    },
  },
  server: {
    port: 5000,
  },
});
