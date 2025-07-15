// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

// (Keep your ChatTheme and ChatWidgetProps interfaces here as before)
interface ChatTheme {
  primaryColor: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcomeMessage: string;
  customIconUrl: string;
  headerTitle: string;
  userBubbleColor: string;
  botBubbleColor: string;
  inputPlaceholder: string;
}

interface ChatWidgetProps {
  n8nWebhookUrl: string;
  theme: ChatTheme;
  clientId: string; // This is the client account ID
}


const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookUrl, theme, clientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- NEW: State for sessionId ---
  const [sessionId, setSessionId] = useState<string | null>(null);

  // --- NEW: Generate sessionId on initial load or when chat opens for the first time ---
  useEffect(() => {
    if (!sessionId) {
      // Generate a simple unique ID (e.g., using current time + random number)
      // For a more robust solution, consider a library like 'uuid'
      setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [sessionId]); // Run once to set the session ID


  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Set initial welcome message when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && theme.welcomeMessage) {
      setMessages([{ type: 'bot', text: theme.welcomeMessage }]);
    }
  }, [isOpen, messages.length, theme.welcomeMessage]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !sessionId) return; // Ensure sessionId exists

    const userMessage = input.trim();
    setMessages((prevMessages) => [...prevMessages, { type: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage,
          clientId: clientId,
          sessionId: sessionId // --- NEW: Include sessionId here ---
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data from n8n:', data);

      const botResponseText = data.output || 'Sorry, I could not process your request. (N8n response format issue, check N8n output tab)';

      setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: botResponseText }]);
    } catch (error) {
      console.error('Error sending message to n8n or processing response:', error);
      setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-widget-container ${theme.buttonPosition}`}>
      <button
        className="chat-bubble-button"
        onClick={toggleChat}
        style={{ backgroundColor: theme.primaryColor }}
      >
        <img src={theme.customIconUrl} alt="Chat Icon" className="chat-icon" />
      </button>

      {isOpen && (
        <div className="chat-window" style={{ borderColor: theme.primaryColor }}>
          <div className="chat-header" style={{ backgroundColor: theme.primaryColor }}>
            <h3>{theme.headerTitle}</h3>
            <button className="close-button" onClick={toggleChat}>
              &times;
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div
                  className={`message-bubble ${msg.type}`}
                  style={{
                    backgroundColor: msg.type === 'user' ? theme.userBubbleColor : theme.botBubbleColor,
                    color: msg.type === 'user' ? 'black' : 'black',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={theme.inputPlaceholder}
            />
            <button onClick={handleSendMessage} style={{ backgroundColor: theme.primaryColor }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;