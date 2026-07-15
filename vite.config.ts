import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { nitro } from "nitro/vite"; // 1. Import Nitro

export default defineConfig({
  plugins: [
    tanstackStart(), // Router compilation MUST come first!
    nitro(),         // 2. Add Nitro plugin for Vercel routing
    react(),         // JSX transformation comes next
    tailwindcss(),   // CSS processing
  ],
  resolve: {
    tsconfigPaths: true, // Replaces 'vite-tsconfig-paths' natively to clean up the warning
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
  },
});