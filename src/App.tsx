// src/App.tsx
import ChatWidget from './ChatWidget';
import './index.css'; // Keep global styles for the dev page

function App() {
  // For local development, hardcode your test config here
  // This object simulates what Softr will dynamically provide in production
  const testConfig = {
    n8nWebhookUrl: 'http://localhost:5678/webhook/8519b6d0-d4c2-481e-b064-e99b8251ba0d/chat', // YOUR N8N WEBHOOK URL HERE
    theme: {
      primaryColor: '#6a0dad', // Example: Purple primary color
      buttonPosition: 'bottom-right' as 'bottom-right', // Type assertion for string literal
      welcomeMessage: 'Welcome to our custom chatbot for development! How can I help you?',
      customIconUrl: 'https://www.svgrepo.com/show/339963/chat-bot.svg', // Default icon for dev
      headerTitle: 'Dev Lead Gen Bot',
      userBubbleColor: '#e0f7fa', // Light blue for user messages
      botBubbleColor: '#f5f5f5',   // Light grey for bot messages
      inputPlaceholder: 'Type your message here...',
    },
    clientId: 'dev-client-123' // A static client ID for development purposes
  };

  return (
    <div>
      {/* This is just content for your local development page.
          It won't be part of the final embedded widget. */}
      <h1>My Custom Chatbot Development Page</h1>
      <p>This page is for testing your chatbot widget locally.</p>
      <p>Scroll down to see the floating chat icon.</p>
      <div style={{ height: '1000px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        {/* Added some height and background to make scrolling obvious */}
        <p>This is some content on your mock website to demonstrate the floating widget.</p>
        <p>Keep scrolling...</p>
        <p>...almost there!</p>
      </div>

      {/* This is your actual custom chatbot widget */}
      <ChatWidget
        n8nWebhookUrl={testConfig.n8nWebhookUrl}
        theme={testConfig.theme}
        clientId={testConfig.clientId}
      />
    </div>
  );
}

export default App;