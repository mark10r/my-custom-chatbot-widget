// src/App.tsx

import ChatWidget from './ChatWidget';
// Removed the import './index.css'; from here. main.tsx handles it.

// Define the interface for your configuration
interface ChatbotConfig {
  n8nWebhookUrl: string;
  theme: {
    primaryColor: string;
    buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    welcomeMessage: string;
    customIconUrl: string;
    headerTitle: string;
    headerIconUrl: string;
    userBubbleColor: string;
    botBubbleColor: string;
    inputPlaceholder: string;
    openAfterDelay?: boolean; // If true, opens after delay
    openDelaySeconds?: number; // Delay in seconds
    openOnScroll?: boolean;   // If true, opens on scroll
    openOnScrollThreshold?: number; // Scroll percentage (0-100)
    showWelcomeBubble?: boolean; // If true, displays the mini bubble
    welcomeBubbleText?: string; // Custom text for the mini bubble (defaults to welcomeMessage if not set)
    welcomeBubbleColor?: string; // Background color of the mini bubble
    welcomeBubbleTextColor?: string; // Text color of the mini bubble
    welcomeBubbleDelaySeconds?: number; // Delay before mini bubble appears
    poweredByText?: string; // e.g., "Powered by OptInBot.io"
    poweredByUrl?: string;   // e.g., "https://optinbot.io"
    showPoweredByBranding?: boolean; // Controls visibility of branding
  };
  clientId: string;
}

function App() {
  // Define your test config for local development fallback
  const testConfig: ChatbotConfig = {
    n8nWebhookUrl: 'http://localhost:5678/webhook/8519b6d0-d4c2-481e-b064-e99b8251ba0d/chat', // YOUR N8N WEBHOOK URL HERE
    theme: {
      primaryColor: '#08788bff',
      buttonPosition: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you? 👋',
      customIconUrl: 'https://www.svgrepo.com/show/339963/chat-bot.svg',
      headerTitle: 'OptInBot Chatbot',
      headerIconUrl: 'https://optinbot.io/wp-content/uploads/2025/03/cropped-Untitled-design-17.png',
      userBubbleColor: '#d2f2f7ff',
      botBubbleColor: '#e4e2e2ff',
      inputPlaceholder: 'Type your message here...',
      openAfterDelay: false,      // Set to `true` to test opening after a delay
      openDelaySeconds: 0,        // Example: 5 seconds delay
      openOnScroll: true,         // Set to `true` to test opening on scroll
      openOnScrollThreshold: 50,  // Example: 20% scroll down the page
      showWelcomeBubble: true,    // Set to true to display the mini bubble
      welcomeBubbleColor: '#dbdbdbff', // Matching primary color
      welcomeBubbleTextColor: '#302f2fff', // White text
      welcomeBubbleDelaySeconds: 3, // Appears after 2 seconds
      poweredByText: 'Powered by OptInBot.io', // Your brand text
      poweredByUrl: 'https://optinbot.io',     // Your brand URL
      showPoweredByBranding: true, // Set to true or false for your testing default
    },
    clientId: 'dev-client-123',
  };

  // Determine the final configuration to use
  const currentConfig: ChatbotConfig = (window as any).myCustomChatbotConfig || testConfig;

  return (
    // Only return the ChatWidget here.
    // The other dev page content should be in public/index.html or not deployed.
    <ChatWidget
      n8nWebhookUrl={currentConfig.n8nWebhookUrl}
      theme={currentConfig.theme}
      clientId={currentConfig.clientId}
    />
  );
}

export default App;