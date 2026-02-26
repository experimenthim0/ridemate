import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "::1",
      "*.vercel.app",
      "www.nikhim.me",
      "*.nikhim.me",
      "10.249.157.110"
    ],
  },
});
