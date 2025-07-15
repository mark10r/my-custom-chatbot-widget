// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css'; // Assuming your CSS is here

// Define the interfaces for your props (matching App.tsx's ChatbotConfig.theme)
interface ChatTheme {
  primaryColor: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'; // Matching string literal types
  welcomeMessage: string;
  customIconUrl: string;
  headerTitle: string;
  userBubbleColor: string;
  botBubbleColor: string;
  inputPlaceholder: string;
}

interface ChatWidgetProps {
  n8nWebhookUrl: string;
  theme: ChatTheme; // Use the ChatTheme interface
  clientId: string;
}


const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookUrl, theme, clientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session ID logic (this was the last successful addition)
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [sessionId]);


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
    if (input.trim() === '' || !sessionId) return;

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
          sessionId: sessionId
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
      {/* Chat Bubble Button */}
      <button
        className="chat-bubble-button"
        onClick={toggleChat}
        style={{ backgroundColor: theme.primaryColor }}
      >
        <img src={theme.customIconUrl} alt="Chat Icon" className="chat-icon" />
      </button>

      {/* Chat Window */}
        <div className={`chat-window ${isOpen ? 'is-open' : 'is-closed'}`} style={{ borderColor: theme.primaryColor }}>
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
        </div> {/* This closing div tag for chat-window should be here */}
    </div>
  );
};

export default ChatWidget;