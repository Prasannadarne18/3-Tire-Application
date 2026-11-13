import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to Spring Boot during local dev
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
