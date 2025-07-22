// src/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget.tsx';
import './index.css';
import './App.css'; // Assuming you still have App.css for global styles

// Define a default configuration
export const defaultConfig = {
    n8nWebhookUrl: 'YOUR_N8N_WEBHOOK_URL_HERE', // Placeholder, replace with your actual URL
    theme: {
        primaryColor: '#08788bff', // Default teal/green (will be pink in your example override)
        userBubbleColor: '#d2f2f7ff', // Default light blue/green
        botBubbleColor: '#e4e2e2ff', // Default light grey
        buttonPosition: 'bottom-right',
        welcomeMessage: 'Hello! How can I help you? 👋',
        customIconUrl: 'https://www.svgrepo.com/show/339963/chat-bot.svg', // Default chat icon
        headerTitle: 'AI Assistant',
        showOnlineStatus: true,
        headerIconUrl: 'https://optinbot.io/wp-content/uploads/2025/03/cropped-Untitled-design-17.png', // Default header icon
        inputPlaceholder: 'Type your message...',
        openAfterDelay: false,
        openDelaySeconds: 5,
        openOnScroll: false,
        openOnScrollThreshold: 50, // Percentage scrolled
        showWelcomeBubble: true,
        welcomeBubbleText: 'Need help?',
        welcomeBubbleColor: '#f0f0f0', // Default light grey for welcome bubble
        welcomeBubbleTextColor: '#333', // Default dark text for welcome bubble
        welcomeBubbleDelaySeconds: 1,
        poweredByText: 'Powered by OptInBot',
        poweredByUrl: 'https://optinbot.io',
        showPoweredByBranding: true,
        // Removed: chatInputAreaBgColor and poweredByBgColor as they will be hardcoded white
        chatWindowBgColor: '#ffffff', // Explicitly setting chat window background to white by default
    },
    clientId: 'default-client-id',
};

// Check for a custom configuration defined by the client
declare global {
    interface Window {
        optinbotConfig?: typeof defaultConfig;
    }
}

// Merge default config with client's custom config
const finalConfig = {
    ...defaultConfig,
    ...window.optinbotConfig,
    theme: {
        ...defaultConfig.theme,
        ...window.optinbotConfig?.theme,
    },
};

// Find the container element
const container = document.getElementById('optinbot-chatbot-container');

// If the container exists, render the widget
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ChatWidget
                n8nWebhookUrl={finalConfig.n8nWebhookUrl}
                theme={finalConfig.theme}
                clientId={finalConfig.clientId}
            />
        </React.StrictMode>
    );
} else {
    console.error('OptInBot: Chatbot container #optinbot-chatbot-container not found.');
}