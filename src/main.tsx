// src/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget.tsx';
import './index.css';

// Define a default configuration
export const defaultConfig = {
    n8nWebhookUrl: 'https://hooks.optinbot.io/webhook/a03b69ea-a7c1-4391-877d-8be85c84e7e0/chat',
    theme: {
        primaryColor: '#08788bff',
        userBubbleColor: '#d2f2f7ff',
        botBubbleColor: '#e4e2e2ff',
        buttonPosition: 'bottom-right',
        welcomeMessage: 'Hello! How can I help you? 👋',
        customIconUrl: 'https://res.cloudinary.com/dlasog0p4/image/upload/v1771024412/tt4niyw5bwyif5x26f96.svg',
        headerTitle: 'AI Assistant',
        showOnlineStatus: true,
        headerIconUrl: 'https://www.svgrepo.com/show/474732/assistant.svg',
        inputPlaceholder: 'Type your message...',
        suggestedMessages: [
            'What are your pricing plans?',
            'How does the chatbot work?',
            'Can I customize the widget?',
            'Talk to a human'
        ],
        openAfterDelay: false,
        openDelaySeconds: 5,
        openOnScroll: false,
        openOnScrollThreshold: 50,
        showWelcomeBubble: true,
        welcomeBubbleText: 'Need help?',
        welcomeBubbleColor: '#f0f0f0',
        welcomeBubbleTextColor: '#333',
        welcomeBubbleDelaySeconds: 1,
        poweredByText: 'Powered by OptInBot',
        poweredByUrl: 'https://optinbot.io',
        showPoweredByBranding: true,
        chatWindowBgColor: '#ffffff',
    },
    clientId: 'client_224c8vvrto',
};

// --- MOVED TO TOP LEVEL (FIX) ---
declare global {
    interface Window {
        optinbotConfig?: typeof defaultConfig;
    }
}

// Function to check membership status from your n8n workflow with Session Caching
const getMembershipStatus = async (clientId: string): Promise<'active' | 'inactive'> => {
    // --- NEW: SESSION CACHE CHECK ---
    const cacheKey = `optinbot_status_${clientId}`;
    const cachedStatus = sessionStorage.getItem(cacheKey);

    if (cachedStatus === 'active' || cachedStatus === 'inactive') {
        console.log(`OptInBot: Using cached status [${cachedStatus}] for client [${clientId}]`);
        return cachedStatus as 'active' | 'inactive';
    }

    try {
        const response = await fetch(
            'https://hooks.optinbot.io/webhook/7e99a537-9bd6-4eb6-8a56-4c80471f1988',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            }
        );

        if (!response.ok) {
            console.error('OptInBot: Could not verify membership status.');
            return 'inactive';
        }

        const data = await response.json();

        // --- FIX: normalize status and treat "trial" same as "active" ---
        const normalized = (data.status || '').trim().toLowerCase();
        console.log('OptInBot: Raw membership status from webhook →', data.status);

        const statusResult = (normalized === 'active' || normalized === 'trial') ? 'active' : 'inactive';

        // --- NEW: SAVE TO SESSION CACHE ---
        sessionStorage.setItem(cacheKey, statusResult);

        return statusResult;
    } catch (error) {
        console.error('OptInBot: Error checking membership status:', error);
        return 'inactive';
    }
};

// Initialize chatbot
const initializeChatbot = async () => {
    const finalConfig = {
        ...defaultConfig,
        ...window.optinbotConfig,
        theme: {
            ...defaultConfig.theme,
            ...window.optinbotConfig?.theme,
        },
    };

    const container = document.getElementById('optinbot-chatbot-container');
    if (!container) {
        console.error('OptInBot: Chatbot container #optinbot-chatbot-container not found.');
        return;
    }

    const membershipStatus = await getMembershipStatus(finalConfig.clientId);

    /**
     * --- NEW: PREVIEW MODE DETECTION ---
     * Checks if the widget is running on your dashboard domain or localhost.
     */
    const isPreviewMode = window.location.hostname === 'app.optinbot.io' || 
                          window.location.hostname === 'localhost';

    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ChatWidget
                n8nWebhookUrl={finalConfig.n8nWebhookUrl}
                theme={finalConfig.theme}
                clientId={finalConfig.clientId}
                membershipStatus={membershipStatus}
                isPreview={isPreviewMode} 
            />
        </React.StrictMode>
    );
};

initializeChatbot();