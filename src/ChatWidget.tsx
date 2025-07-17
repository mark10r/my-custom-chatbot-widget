// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';

// Define the interfaces for your props.
// We can directly use the type from defaultConfig in main.tsx for consistency.
import { defaultConfig } from './main.tsx';

// The ChatWidgetProps interface will now be a subset of defaultConfig,
// specifically the parts it receives from App.tsx.
// Or, simply type it to match the main config if App.tsx passes the whole thing.
interface ChatWidgetProps {
    n8nWebhookUrl: string;
    theme: typeof defaultConfig.theme; // Use the theme part of defaultConfig
    clientId: string;
}

// Helper to convert camelCase to kebab-case for CSS variables
function kebabCase(string: string): string {
    return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookUrl, theme, clientId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const autoOpenTriggeredRef = useRef(false);
    const [showMiniBubble, setShowMiniBubble] = useState(false);
    const miniBubbleTriggeredRef = useRef(false);

    // --- NEW EFFECT: Apply dynamic CSS variables ---
    // This runs AFTER the component has mounted and rendered its initial HTML,
    // ensuring the chat-widget-container element exists.
    useEffect(() => {
        const chatWidgetContainer = document.getElementById('optinbot-chatbot-container');

        if (chatWidgetContainer) {
            // Apply CSS Variables based on theme object passed via props
            for (const [key, value] of Object.entries(theme)) {
                // Only apply if the value is a string and represents a color or URL, or input placeholder
                if (typeof value === 'string' && (key.endsWith('Color') || key.endsWith('Url') || key === 'inputPlaceholder')) {
                    if (key.endsWith('Url')) {
                        // For URLs, set as 'url(...)'
                        chatWidgetContainer.style.setProperty(`--${kebabCase(key)}`, `url('${value}')`);
                    } else {
                        // For colors and placeholder text (which becomes a CSS var)
                        chatWidgetContainer.style.setProperty(`--${kebabCase(key)}`, value);
                    }
                }
            }
            // Explicitly set specific CSS variables if they are not covered by the loop
            // (e.g., if theme object names don't perfectly match kebab-cased CSS var names)
            chatWidgetContainer.style.setProperty('--primary-color', theme.primaryColor);
            chatWidgetContainer.style.setProperty('--user-bubble-color', theme.userBubbleColor);
            chatWidgetContainer.style.setProperty('--bot-bubble-color', theme.botBubbleColor);
            chatWidgetContainer.style.setProperty('--welcome-bubble-color', theme.welcomeBubbleColor || theme.primaryColor); // Fallback to primary
            chatWidgetContainer.style.setProperty('--welcome-bubble-text-color', theme.welcomeBubbleTextColor || '#ffffff'); // Fallback to white
            // Ensure headerTextColor is set
            // chatWidgetContainer.style.setProperty('--header-text-color', theme.headerTextColor || 'white'); // Assuming headerTextColor exists in theme
            chatWidgetContainer.style.setProperty('--input-placeholder-color', theme.inputPlaceholder);
            chatWidgetContainer.style.setProperty('--powered-by-text-color', theme.poweredByText); // Assuming this is a color variable now
            chatWidgetContainer.style.setProperty('--powered-by-bg-color', theme.poweredByText); // Assuming this needs a background variable
            chatWidgetContainer.style.setProperty('--input-border-color', theme.botBubbleColor); // Using botBubbleColor for input border, adjust if different
            chatWidgetContainer.style.setProperty('--chat-window-bg-color', 'white'); // Assuming this is always white
            chatWidgetContainer.style.setProperty('--send-button-text-color', 'white'); // Assuming this is always white

            // Apply position class
            chatWidgetContainer.className = `chat-widget-container ${theme.buttonPosition}`;
            
            // For elements whose content (text or src) needs to be updated,
            // we do it directly here using querySelector.
            // Header Title
            const headerTitleElement = chatWidgetContainer.querySelector('.chat-header h3');
            if (headerTitleElement) {
                headerTitleElement.textContent = theme.headerTitle;
            }

            // Header Avatar (src attribute)
            const headerAvatarElement = chatWidgetContainer.querySelector('.header-avatar') as HTMLImageElement | null;
            if (headerAvatarElement) {
                headerAvatarElement.src = theme.headerIconUrl;
                headerAvatarElement.alt = `${theme.headerTitle} Avatar`; // Add alt text
            }

            // Main Chat Button Icon (src attribute)
            const chatIconElement = chatWidgetContainer.querySelector('.chat-icon') as HTMLImageElement | null;
            if (chatIconElement) {
                chatIconElement.src = theme.customIconUrl;
            }

            // Welcome Bubble Text (content)
            const welcomeBubbleSpan = chatWidgetContainer.querySelector('.mini-welcome-bubble span');
            if (welcomeBubbleSpan) {
                welcomeBubbleSpan.textContent = theme.welcomeMessage;
            }
            
            // Input Placeholder (attribute)
            const chatInputElement = chatWidgetContainer.querySelector('.chat-input-area input') as HTMLInputElement | null;
            if (chatInputElement) {
                chatInputElement.placeholder = theme.inputPlaceholder;
            }

            // Powered By Branding
            const poweredByDiv = chatWidgetContainer.querySelector('.chat-powered-by') as HTMLElement | null;
            if (poweredByDiv) {
                if (theme.showPoweredByBranding) {
                    poweredByDiv.style.display = 'block'; // Ensure it's visible
                    poweredByDiv.innerHTML = ''; // Clear existing content
                    const span = document.createElement('span');
                    span.textContent = theme.poweredByText;
                    poweredByDiv.appendChild(span);

                    if (theme.poweredByUrl) {
                        const link = document.createElement('a');
                        link.href = theme.poweredByUrl;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.textContent = ' (Learn More)';
                        poweredByDiv.appendChild(link);
                    }
                } else {
                    poweredByDiv.style.display = 'none'; // Hide if branding is off
                }
            }
        }
    }, [theme]); // Re-run this effect if the 'theme' prop changes

    // Existing useEffect hooks for sessionId, messagesEndRef, initial welcome message
    useEffect(() => {
        if (!sessionId) {
            setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
        }
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0 && theme.welcomeMessage) {
            setMessages([{ type: 'bot', text: theme.welcomeMessage }]);
        }
    }, [isOpen, messages.length, theme.welcomeMessage]);

    // Existing useEffect for auto-open after delay
    useEffect(() => {
        if (theme.openAfterDelay && theme.openDelaySeconds !== undefined && !isOpen && !autoOpenTriggeredRef.current) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                autoOpenTriggeredRef.current = true;
            }, theme.openDelaySeconds * 1000);
            return () => clearTimeout(timer);
        }
    }, [theme.openAfterDelay, theme.openDelaySeconds, isOpen]);

    // Existing useEffect for mini welcome bubble auto-display
    useEffect(() => {
        if (theme.showWelcomeBubble && !miniBubbleTriggeredRef.current && !isOpen) {
            const delay = theme.welcomeBubbleDelaySeconds !== undefined ? theme.welcomeBubbleDelaySeconds : 1;
            const timer = setTimeout(() => {
                setShowMiniBubble(true);
                miniBubbleTriggeredRef.current = true;
            }, delay * 1000);
            return () => clearTimeout(timer);
        }
        if (isOpen && showMiniBubble) {
            setShowMiniBubble(false);
        }
    }, [theme.showWelcomeBubble, theme.welcomeBubbleDelaySeconds, isOpen, showMiniBubble]);

    // Existing useEffect for auto-open on scroll threshold
    useEffect(() => {
        if (theme.openOnScroll && theme.openOnScrollThreshold !== undefined && !isOpen && !autoOpenTriggeredRef.current) {
            const handleScroll = () => {
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                const scrollTop = window.scrollY;
                const totalScrollableHeight = scrollHeight - clientHeight;
                if (totalScrollableHeight <= 0) return;
                const scrollPercentage = (scrollTop / totalScrollableHeight) * 100;

                if (scrollPercentage >= (theme.openOnScrollThreshold || 0) && !autoOpenTriggeredRef.current) {
                    setIsOpen(true);
                    autoOpenTriggeredRef.current = true;
                    window.removeEventListener('scroll', handleScroll);
                }
            };
            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, [theme.openOnScroll, theme.openOnScrollThreshold, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
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
        // The main container div's class name and position are handled by the useEffect above
        <div className={`chat-widget-container ${theme.buttonPosition}`}>
            {showMiniBubble && (
                // Use CSS variables for mini bubble styles
                <div
                    className="mini-welcome-bubble"
                    onClick={toggleChat}
                    // Styles are now directly from CSS variables
                >
                    <span>{theme.welcomeMessage}</span> {/* Wrap in span for easier textContent access */}
                </div>
            )}
            {/* Chat Bubble Button */}
            <button
                className="chat-bubble-button"
                onClick={toggleChat}
                // Use CSS variables for button styles
            >
                <img src={theme.customIconUrl} alt="Chat Icon" className="chat-icon" />
            </button>

            {/* Chat Window */}
            <div
                className={`chat-window ${isOpen ? 'is-open' : 'is-closed'}`}
                // Border color uses CSS variable
                style={{ borderColor: 'var(--primary-color)' }}
            >
                <div
                    className="chat-header"
                    // Background color uses CSS variable
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    {theme.headerIconUrl && (
                        <img src={theme.headerIconUrl} className="header-avatar" />
                    )}
                    <h3>{theme.headerTitle}</h3> {/* Header Title from theme */}
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
                                    // Use CSS variables for message bubbles
                                    backgroundColor: msg.type === 'user' ? 'var(--user-bubble-color)' : 'var(--bot-bubble-color)',
                                    color: msg.type === 'user' ? 'black' : 'black', // Can also be a variable if needed
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
                        placeholder={theme.inputPlaceholder} // Placeholder text from theme
                    />
                    <button onClick={handleSendMessage}
                        // Use CSS variable for send button background
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        Send
                    </button>
                </div>

                {theme.showPoweredByBranding && theme.poweredByText && (
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
            </div>
        </div>
    );
};

export default ChatWidget;