// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Your widget's global CSS
import App from './App.tsx'; // Your main App component

// @ts-ignore  <-- THIS LINE IS CRITICAL
const forceCssInclusion = import.meta.glob('./index.css', { eager: true });

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