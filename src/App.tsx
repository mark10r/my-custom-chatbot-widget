// src/App.tsx
import ChatWidget from './ChatWidget';
import './index.css'; // Keep global styles for the dev page

// 1. Define the interface for your configuration
interface ChatbotConfig {
  n8nWebhookUrl: string;
  theme: {
    primaryColor: string;
    buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    welcomeMessage: string;
    customIconUrl: string;
    headerTitle: string;
    userBubbleColor: string;
    botBubbleColor: string;
    inputPlaceholder: string;
  };
  clientId: string;
}

function App() {
  // 2. Define your test config for local development fallback
  const testConfig: ChatbotConfig = {
    n8nWebhookUrl: 'http://localhost:5678/webhook/8519b6d0-d4c2-481e-b064-e99b8251ba0d/chat', // YOUR N8N WEBHOOK URL HERE
    theme: {
      primaryColor: '#6a0dad',
      buttonPosition: 'bottom-right',
      welcomeMessage: 'Welcome to our custom chatbot for development! How can I help you?',
      customIconUrl: 'https://www.svgrepo.com/show/339963/chat-bot.svg',
      headerTitle: 'Dev Lead Gen Bot',
      userBubbleColor: '#e0f7fa',
      botBubbleColor: '#f5f5f5',
      inputPlaceholder: 'Type your message here...',
    },
    clientId: 'dev-client-123',
  };

  // 3. Determine the final configuration to use
  // In production, (window as any).myCustomChatbotConfig will be set by Softr.
  // Locally, it will be undefined, so we'll use testConfig.
  const currentConfig: ChatbotConfig = (window as any).myCustomChatbotConfig || testConfig;


  return (
    <div>
      {/* This content is part of your local development page.
          It will also be embedded if clients use your full bundle directly,
          but they would typically hide or remove it. */}
      <h1>My Custom Chatbot Development Page</h1>
      <p>This page is for testing your chatbot widget locally.</p>
      <p>Scroll down to see the floating chat icon.</p>
      <div style={{ height: '1000px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <p>This is some content on your mock website to demonstrate the floating widget.</p>
        <p>Keep scrolling...</p>
        <p>...almost there!</p>
      </div>

      {/* This is your actual custom chatbot widget */}
      <ChatWidget
        n8nWebhookUrl={currentConfig.n8nWebhookUrl}
        theme={currentConfig.theme}
        clientId={currentConfig.clientId}
      />
    </div>
  );
}

export default App;