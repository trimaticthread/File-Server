import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PDF.js ve güvenlik uyarılarını bastır
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('SecurityError') ||
    message.includes('pdf.js') ||
    message.includes('mozilla.github.io') ||
    message.includes('cross-origin') ||
    message.includes('CORS policy') ||
    message.includes('webviewer')
  ) {
    return; // Bu uyarıları bastır
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('pdf.js') ||
    message.includes('mozilla.github.io') ||
    message.includes('webviewer')
  ) {
    return; // Bu uyarıları bastır
  }
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
