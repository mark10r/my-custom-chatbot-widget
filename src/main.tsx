// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // This is the standard way Vite handles CSS

import App from './App.tsx'; // Your main App component

// REMOVED: @ts-ignore and const forceCssInclusion = import.meta.glob('./index.css', { eager: true });
// This line is no longer needed and might be interfering.

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
  console.error("OptInBot Widget Error: '#optinbot-chatbot-container' element not found. Cannot mount React app.");
}