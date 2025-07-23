// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';

// Define the interfaces for your props.
import { defaultConfig } from './main.tsx'; // Import defaultConfig for typing

interface ChatWidgetProps {
    n8nWebhookUrl: string;
    theme: typeof defaultConfig.theme;
    clientId: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookUrl, theme, clientId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Session ID logic
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Ref to track if auto-open has already occurred
    const autoOpenTriggeredRef = useRef(false);

    // State and Ref for Mini Welcome Bubble
    const [showMiniBubble, setShowMiniBubble] = useState(false);
    const miniBubbleTriggeredRef = useRef(false);

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

    // --- CRITICAL EFFECT FOR COLORS: Apply dynamic CSS variables ---
    useEffect(() => {
        const chatWidgetContainer = document.getElementById('optinbot-chatbot-container');

        if (chatWidgetContainer) {
            console.log("ChatWidget: Applying theme to CSS variables. Received theme:", theme);

            // Set primary and bubble colors directly
            chatWidgetContainer.style.setProperty('--primary-color', theme.primaryColor);
            chatWidgetContainer.style.setProperty('--user-bubble-color', theme.userBubbleColor);
            chatWidgetContainer.style.setProperty('--bot-bubble-color', theme.botBubbleColor);

            // Welcome bubble colors with fallbacks
            chatWidgetContainer.style.setProperty('--welcome-bubble-color', theme.welcomeBubbleColor || theme.primaryColor);
            chatWidgetContainer.style.setProperty('--welcome-bubble-text-color', theme.welcomeBubbleTextColor || '#ffffff');

            // Set other colors that might be needed in CSS (e.g., text colors for header/close button)
            chatWidgetContainer.style.setProperty('--header-text-color', 'white'); // Assuming header text is always white
            chatWidgetContainer.style.setProperty('--close-button-color', 'white'); // Assuming close button is always white
            chatWidgetContainer.style.setProperty('--send-button-text-color', 'white'); // Assuming send button text is always white

            // Set other dynamic properties
            chatWidgetContainer.style.setProperty('--input-placeholder-color', theme.inputPlaceholder);
           
            // Powered by branding colors
            chatWidgetContainer.style.setProperty('--powered-by-text-color', '#aaaaaa'); // Default gray for powered by text
            chatWidgetContainer.style.setProperty('--powered-by-link-color', theme.primaryColor); // Link color for branding, defaults to primary

            // Set chat window background (if you want this to be configurable)
            chatWidgetContainer.style.setProperty('--chat-window-bg-color', theme.chatWindowBgColor);

            // Removed: chatInputAreaBgColor and poweredByBgColor from here as they are hardcoded white in CSS
            // sendButtonBgColor is handled by --primary-color in CSS.

            // Log the values that were just set
            console.log("ChatWidget: CSS Variables set:");
            console.log("--primary-color:", chatWidgetContainer.style.getPropertyValue('--primary-color'));
            console.log("--user-bubble-color:", chatWidgetContainer.style.getPropertyValue('--user-bubble-color'));
            console.log("--bot-bubble-color:", chatWidgetContainer.style.getPropertyValue('--bot-bubble-color'));
            console.log("--welcome-bubble-color:", chatWidgetContainer.style.getPropertyValue('--welcome-bubble-color'));
            console.log("--welcome-bubble-text-color:", chatWidgetContainer.style.getPropertyValue('--welcome-bubble-text-color'));
            console.log("--chat-window-bg-color:", chatWidgetContainer.style.getPropertyValue('--chat-window-bg-color'));
            console.log("ChatWidget: Theme application complete. (Hash Test 12345)"); // Changed text
        } else {
            console.error("ChatWidget: '#optinbot-chatbot-container' not found when trying to apply theme variables.");
        }
    }, [theme]); // Re-run this effect if the 'theme' prop changes

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
            {showMiniBubble && (
                <div
                    className="mini-welcome-bubble"
                    onClick={toggleChat}
                >
                    <span>{theme.welcomeBubbleText}</span> {/* Changed to welcomeBubbleText */}
                </div>
            )}
            {/* Chat Bubble Button */}
            <button
                className="chat-bubble-button"
                onClick={toggleChat}
            >
                <img src={theme.customIconUrl} alt="Chat Icon" className="chat-icon" />
            </button>

            {/* Chat Window */}
            <div
                className={`chat-window ${isOpen ? 'is-open' : 'is-closed'}`}
                style={{ borderColor: 'var(--primary-color)' }}
            >
                <div
                    className="chat-header"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    {theme.headerIconUrl && (
                        <img src={theme.headerIconUrl} className="header-avatar" />
                    )}
                    <div className="header-info">
        <h3>{theme.headerTitle}</h3>
        {theme.showOnlineStatus && (
            <div className="header-status">
                <span className="online-dot"></span>
                <span>Online</span>
            </div>
        )}
    </div>
                    <button className="close-button" onClick={toggleChat}
                        style={{ color: 'var(--close-button-color)' }}
                    >
                        &times;
                    </button>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type}`}>
                            <div
                                className={`message-bubble ${msg.type}`}
                                style={{
                                    backgroundColor: msg.type === 'user' ? 'var(--user-bubble-color)' : 'var(--bot-bubble-color)',
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
                        style={{ borderColor: 'var(--input-border-color)' }}
                    />
                    <button onClick={handleSendMessage}
                        style={{ backgroundColor: 'var(--primary-color)', color: 'var(--send-button-text-color)' }}
                    >
                        Send
                    </button>
                </div>

                {theme.showPoweredByBranding && theme.poweredByText && (
                    <div className="chat-powered-by">
                        {theme.poweredByUrl ? (
                            <a href={theme.poweredByUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: 'var(--powered-by-link-color)' }}
                            >
                                {theme.poweredByText}
                            </a>
                        ) : (
                            <span style={{ color: 'var(--powered-by-text-color)' }}>{theme.poweredByText}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;