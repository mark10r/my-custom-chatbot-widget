// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // This is the standard way Vite handles CSS

import App from './App.tsx'; // Your main App component

// Define a default configuration.
// IMPORTANT: The default colors here should match the look you want
// if no client-specific config is provided.
export const defaultConfig = {
    n8nWebhookUrl: 'YOUR_DEFAULT_N8N_WEBHOOK_URL_HERE', // IMPORTANT: Provide a default N8N URL
    theme: {
        primaryColor: '#08788bff', // Default to teal, matching your screenshots.
        buttonPosition: 'bottom-right',
        welcomeMessage: 'Hi! How can I help you? 👋',
        customIconUrl: 'https://www.svgrepo.com/show/339963/chat-bot.svg', // Default chat icon
        headerTitle: 'AI Assistant',
        headerIconUrl: 'https://optinbot.io/wp-content/uploads/2025/03/cropped-Untitled-design-17.png', // Default header avatar
        userBubbleColor: '#d2f2f7ff',
        botBubbleColor: '#e4e2e2ff',
        inputPlaceholder: 'Type your message here...',
        openAfterDelay: false,
        openDelaySeconds: 0,
        openOnScroll: false,
        openOnScrollThreshold: 50,
        showWelcomeBubble: true,
        welcomeBubbleColor: '#dbdbdbff', // Matching your screenshots
        welcomeBubbleTextColor: '#302f2fff', // Matching your screenshots
        welcomeBubbleDelaySeconds: 3,
        poweredByText: 'Powered by OptInBot.io',
        poweredByUrl: 'https://optinbot.io',
        showPoweredByBranding: true,
        // Add any other theme properties here with their default values
    },
    clientId: 'default-client-id', // Default client ID
};

// Define the type for the external configuration on the window object
declare global {
    interface Window {
        optinbotConfig?: typeof defaultConfig; // Clients will set this
    }
}

// FIX: Explicitly type clientConfig as Partial<typeof defaultConfig>
const clientConfig: Partial<typeof defaultConfig> = window.optinbotConfig || {};

// Create the final configuration object by deep merging theme properties
export const finalConfig = {
    ...defaultConfig,
    ...clientConfig,
    theme: {
        ...defaultConfig.theme,
        ...(clientConfig.theme || {}) // Merge theme properties deeply
    }
};

// IMPORTANT: This ID must match the div ID in your embedding script (e.g., in index.html)
const rootElement = document.getElementById('optinbot-chatbot-container');

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            {/* Pass the finalConfig to your App component */}
            <App config={finalConfig} />
        </StrictMode>,
    );
    console.log("OptInBot Widget: React app successfully mounted to '#optinbot-chatbot-container'.");
} else {
    console.error("OptInBot Widget Error: '#optinbot-chatbot-container' element not found. Cannot mount React app.");
}