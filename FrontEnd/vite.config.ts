import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,  // Port 8081'e güncellendi
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('🔀 Proxy rewrite:', path, '→', path);
          return path;
        }
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Console uyarılarını bastır
      onwarn(warning, warn) {
        // PDF.js ve güvenlik uyarılarını filtrele
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.message.includes('pdf.js')) return;
        if (warning.message.includes('SecurityError')) return;
        if (warning.message.includes('mozilla.github.io')) return;
        warn(warning);
      }
    }
  },
  // Geliştirme sırasında console uyarılarını bastır
  define: {
    __SUPPRESS_PDF_WARNINGS__: true,
  }
}));
