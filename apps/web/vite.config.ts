import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cesiumImport from "vite-plugin-cesium";

type CesiumPlugin = (options?: {
  cesiumBuildRootPath?: string;
  cesiumBuildPath?: string;
}) => import("vite").PluginOption;

// Handle CJS/ESM interop: the default export may be nested under `default`.
const cesium = ((cesiumImport as unknown as { default?: CesiumPlugin })
  .default ?? cesiumImport) as unknown as CesiumPlugin;

// npm workspaces hoist cesium to the repository root
const cesiumBuild = path.resolve(
  import.meta.dirname,
  "../../node_modules/cesium/Build",
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cesium({
      cesiumBuildRootPath: cesiumBuild,
      cesiumBuildPath: path.join(cesiumBuild, "Cesium"),
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),
      "@hooks": path.resolve(import.meta.dirname, "./src/hooks"),
      "@pages": path.resolve(import.meta.dirname, "./src/pages"),
      "@providers": path.resolve(import.meta.dirname, "./src/providers"),
      "@layouts": path.resolve(import.meta.dirname, "./src/layouts"),
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
    },
  },
  server: {
    port: 5000,
  },
});
