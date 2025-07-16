// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css'; // Assuming your CSS is here

// Define the interfaces for your props (matching App.tsx's ChatbotConfig.theme)
interface ChatTheme {
  primaryColor: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcomeMessage: string;
  customIconUrl: string;
  headerTitle: string;
  headerIconUrl: string;
  userBubbleColor: string;
  botBubbleColor: string;
  inputPlaceholder: string;
  // --- NEW PROPERTIES FOR AUTO-OPEN ---
  openAfterDelay?: boolean;
  openDelaySeconds?: number;
  openOnScroll?: boolean;
  openOnScrollThreshold?: number;
  showWelcomeBubble?: boolean;
  welcomeBubbleColor?: string;
  welcomeBubbleTextColor?: string;
  welcomeBubbleDelaySeconds?: number;
  poweredByText?: string;
  poweredByUrl?: string;
  showPoweredByBranding?: boolean;
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
    // --- NEW: Ref to track if auto-open has already occurred ---
  const autoOpenTriggeredRef = useRef(false);
  // --- NEW: State and Ref for Mini Welcome Bubble ---
  const [showMiniBubble, setShowMiniBubble] = useState(false);
  const miniBubbleTriggeredRef = useRef(false); // To ensure mini bubble only appears once

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

  // --- NEW EFFECT: Auto-open after a delay ---
 useEffect(() => {
 // Only proceed if delay auto-open is enabled, a delay is specified,
// the widget is currently closed, and it hasn't been auto-opened yet.
if (theme.openAfterDelay && theme.openDelaySeconds !== undefined && !isOpen && !autoOpenTriggeredRef.current) {
const timer = setTimeout(() => {
setIsOpen(true);
autoOpenTriggeredRef.current = true; // Mark as triggered for this session
}, theme.openDelaySeconds * 1000); // Convert seconds to milliseconds

// Cleanup function: Clear the timer if the component unmounts
 // or if dependencies change (e.g., if `isOpen` becomes true manually)
return () => clearTimeout(timer);
}
}, [theme.openAfterDelay, theme.openDelaySeconds, isOpen]); // Re-run if these theme props or isOpen state changes

// --- NEW EFFECT: Mini Welcome Bubble Auto-display ---
useEffect(() => {
// Only show if enabled, not already triggered, and main chat is closed
if (theme.showWelcomeBubble && !miniBubbleTriggeredRef.current && !isOpen) {
const delay = theme.welcomeBubbleDelaySeconds !== undefined ? theme.welcomeBubbleDelaySeconds : 1; // Default to 1 second if not set
const timer = setTimeout(() => {
setShowMiniBubble(true);
miniBubbleTriggeredRef.current = true; // Mark as triggered
}, delay * 1000);

return () => clearTimeout(timer);
}
// Hide mini bubble if main chat opens
if (isOpen && showMiniBubble) {
setShowMiniBubble(false);
}
}, [theme.showWelcomeBubble, theme.welcomeBubbleDelaySeconds, isOpen, showMiniBubble]); // Depend on isOpen to hide it

// --- NEW EFFECT: Auto-open on scroll threshold ---
useEffect(() => {
// Only proceed if scroll auto-open is enabled, a threshold is specified,
// the widget is currently closed, and it hasn't been auto-opened yet.
if (theme.openOnScroll && theme.openOnScrollThreshold !== undefined && !isOpen && !autoOpenTriggeredRef.current) {
const handleScroll = () => {
// Calculate scroll percentage
const scrollHeight = document.documentElement.scrollHeight; // Total height of the scrollable content
const clientHeight = document.documentElement.clientHeight; // Height of the viewport
const scrollTop = window.scrollY; // Current scroll position from the top

// Avoid division by zero if the content is not scrollable
const totalScrollableHeight = scrollHeight - clientHeight;
if (totalScrollableHeight <= 0) return;

const scrollPercentage = (scrollTop / totalScrollableHeight) * 100;

// If scroll threshold is met/exceeded and not yet triggered
if (scrollPercentage >= (theme.openOnScrollThreshold || 0) && !autoOpenTriggeredRef.current) {
setIsOpen(true);
autoOpenTriggeredRef.current = true; // Mark as triggered
window.removeEventListener('scroll', handleScroll); // Remove listener once triggered to prevent re-triggering
}
};

// Add the scroll event listener when the component mounts or dependencies change
window.addEventListener('scroll', handleScroll);

// Cleanup function: Remove the event listener when the component unmounts
return () => {
window.removeEventListener('scroll', handleScroll);
};
}
}, [theme.openOnScroll, theme.openOnScrollThreshold, isOpen]); // Re-run if these theme props or isOpen state changes

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // If it's about to open
      setShowMiniBubble(false);
    }
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
      {/* --- NEW: Mini Welcome Bubble --- */}
      {showMiniBubble && (
        <div
          className="mini-welcome-bubble"
          onClick={toggleChat} // Clicking it opens the main chat
          style={{
            backgroundColor: theme.welcomeBubbleColor || theme.primaryColor, // Use custom color or primary
            color: theme.welcomeBubbleTextColor || '#ffffff', // Use custom text color or white
          }}
        >
          {theme.welcomeMessage} {/* Always use welcomeMessage for the mini bubble */}
        </div>
      )}
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
            {/* --- NEW: Header Avatar Image --- */}
            {theme.headerIconUrl && (
              <img src={theme.headerIconUrl} className="header-avatar" />
            )}
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

{/* --- NEW: Powered By Branding --- */}
{theme.showPoweredByBranding && theme.poweredByText && ( // NEW conditional rendering
  <div className="chat-powered-by">
    {theme.poweredByUrl ? (
      <a href={theme.poweredByUrl} target="_blank" rel="noopener noreferrer">
        {theme.poweredByText}
      </a>
    ) : (
      <span>{theme.poweredByText}</span>
    )}
  </div>
)}
       </div> {/* This closing div tag for chat-window should be here */}
    </div>
  );
};

export default ChatWidget;