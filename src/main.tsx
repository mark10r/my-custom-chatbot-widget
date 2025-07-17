// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// --- THIS IS THE CRITICAL CHANGE ---
const rootElement = document.getElementById('optinbot-chatbot-container'); // <--- CHANGE 'root' to 'optinbot-chatbot-container'

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("OptInBot Widget: Root element found and React app rendered successfully.");
} else {
  // This error will show in your browser's console if the container div isn't found.
  console.error("OptInBot Widget Error: Could not find the '#optinbot-chatbot-container' element to mount the chatbot. Please ensure your website's embedding code creates this div correctly.");
}