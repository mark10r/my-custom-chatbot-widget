// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Your widget's global CSS
import App from './App.tsx'; // Your main App component

// IMPORTANT: This ID must match the div ID in your embedding script.
const rootElement = document.getElementById('optinbot-chatbot-container');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("OptInBot Widget: React app successfully mounted to '#optinbot-chatbot-container'.");
} else {
  // This error will appear in your browser's console if the container div is missing.
  console.error("OptInBot Widget Error: '#optinbot-chatbot-container' element not found. Cannot mount React app.");
}