import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "RideMate - College Ridesharing",
        short_name: "RideMate",
        description: "RideMate is the ultimate college ridesharing platform. Connect with fellow students and college authorized Auto Drivers, find safe and reliable rides, and save money on your daily commute. Features include real-time tracking, secure chat, and student-verified profiles.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        icons: [
          {
            src: "/icons8-auto-rickshaw-94.png",
            sizes: "94x94",
            type: "image/png",
          },
          {
            src: "/icons8-auto-rickshaw-94.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons8-auto-rickshaw-94.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/screenshot.jpeg",
            sizes: "1024x1024",
            type: "image/jpeg",
            form_factor: "wide",
            label: "RideMate HomePage"
          },
          {
            src: "/s1.jpeg",
            sizes: "1024x1024",
            type: "image/jpeg",
            label: "Drivers Contact Info"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
  ],
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
