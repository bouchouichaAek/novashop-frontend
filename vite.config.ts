import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.REACT_APP_BACKEND_URL || 'http://localhost:8000'; // Fallback for dev if not set

  return {
    define: {
      "process.env.REACT_APP_ENVIRONMENT": JSON.stringify(
        env.REACT_APP_ENVIRONMENT
      ),
      "process.env.REACT_APP_BACKEND_URL": JSON.stringify(
        env.REACT_APP_BACKEND_URL
      ),
      "process.env.REACT_APP_WEB_SOCKET_URL": JSON.stringify(
        env.REACT_APP_WEB_SOCKET_URL
      ),
      "process.env.REACT_APP_FIREBASE_API_KEY": JSON.stringify(
        env.REACT_APP_FIREBASE_API_KEY
      ),
      "process.env.REACT_APP_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        env.REACT_APP_FIREBASE_AUTH_DOMAIN
      ),
      "process.env.REACT_APP_FIREBASE_PROJECT_ID": JSON.stringify(
        env.REACT_APP_FIREBASE_PROJECT_ID
      ),
      "process.env.REACT_APP_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        env.REACT_APP_FIREBASE_STORAGE_BUCKET
      ),
      "process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.REACT_APP_FIREBASE_APP_ID": JSON.stringify(
        env.REACT_APP_FIREBASE_APP_ID
      ),
      "process.env.REACT_APP_FIREBASE_MEASUREMENT_ID": JSON.stringify(
        env.REACT_APP_FIREBASE_MEASUREMENT_ID
      ),
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/auth': {
          target: backendUrl,
          changeOrigin: true,
          secure: true, // If backend is HTTP; set to true for HTTPS
        },
        '/users': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
        '/products': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
        '/order': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
        '/payment': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
        // Add more proxies if needed for other paths
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});