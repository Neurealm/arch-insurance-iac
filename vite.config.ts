import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  // maplibre-gl ships its own web worker; pre-bundling breaks the worker URL.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      maxParallelFileOps: 2,
      cache: false,
      output: {
        // Route-level React.lazy in src/App.tsx does the application splitting.
        // Only heavy third-party libraries are pinned to their own chunks so
        // they are not duplicated across route chunks.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/maplibre-gl/.test(id)) return "vendor-maplibre";
          if (/three|@react-three/.test(id)) return "vendor-three";
          if (/recharts|d3-/.test(id)) return "vendor-charts";
          if (/react-dom|react-router|@tanstack/.test(id)) return "vendor-react";
          return "vendor";
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core", "d3-selection", "d3-zoom", "d3-drag", "three", "@react-three/fiber", "@react-three/drei"],
  },
}));
