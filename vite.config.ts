import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart(), // 1. Router compilation MUST come first!
    react(),         // 2. JSX transformation comes second
    tailwindcss(),   // 3. CSS processing
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