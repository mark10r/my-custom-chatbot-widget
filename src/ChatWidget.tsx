// src/ChatWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { defaultConfig } from './main.tsx'; // Ensure this path is correct

// --- MODIFIED ---
// Add membershipStatus to the component's props
interface ChatWidgetProps {
    n8nWebhookUrl: string;
    theme: typeof defaultConfig.theme;
    clientId: string;
    membershipStatus: 'active' | 'inactive' | 'trial';
}

type SuggestedMessage = {
  id: number;
  text: string;
  status: 'visible' | 'disappearing';
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookUrl, theme = {}, clientId, membershipStatus }) => {
    // Merge provided theme with defaults to ensure all keys exist
    const finalTheme = { ...defaultConfig.theme, ...theme };

    // --- NEW ---
    // State to control the visibility of the "unavailable" message
    const [showStatusMessage, setShowStatusMessage] = useState(false);

    // All original state and refs are restored
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string; timestamp: Date }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showMiniBubble, setShowMiniBubble] = useState(false);
    const miniBubbleTriggeredRef = useRef(false);
    const autoOpenTriggeredRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<number | null>(null);
    const [visibleSuggestedMessages, setVisibleSuggestedMessages] = useState<SuggestedMessage[]>(
        (finalTheme.suggestedMessages || []).map((msg, index) => ({
            id: index,
            text: msg,
             status: 'visible',
        }))
    );

    // --- THEME APPLICATION ---
    useEffect(() => {
        const container = document.getElementById('optinbot-chatbot-container');
        if (!container) return;

        container.style.setProperty('--primary-color', finalTheme.primaryColor);
        container.style.setProperty('--user-bubble-color', finalTheme.userBubbleColor);
        container.style.setProperty('--bot-bubble-color', finalTheme.botBubbleColor);
        container.style.setProperty('--chat-window-bg-color', finalTheme.chatWindowBgColor);
        container.style.setProperty('--input-placeholder-color', finalTheme.inputPlaceholder);
        container.style.setProperty('--welcome-bubble-color', finalTheme.welcomeBubbleColor || finalTheme.primaryColor);
        container.style.setProperty('--welcome-bubble-text-color', finalTheme.welcomeBubbleTextColor || '#ffffff');
        container.style.setProperty('--header-text-color', 'white');
        container.style.setProperty('--close-button-color', 'white');
        container.style.setProperty('--send-button-text-color', 'white');
        container.style.setProperty('--powered-by-text-color', '#aaaaaa');
        container.style.setProperty('--powered-by-link-color', finalTheme.primaryColor);

    }, [finalTheme]);

    // --- ALL ORIGINAL FEATURE EFFECTS (RESTORED & STABILIZED) ---
    useEffect(() => {
        if (!sessionId) {
            setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
        }
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0 && finalTheme.welcomeMessage) {
            setMessages([{ type: 'bot', text: finalTheme.welcomeMessage, timestamp: new Date() }]);
        }
    }, [isOpen, messages.length, finalTheme.welcomeMessage]);

    useEffect(() => {
        if (finalTheme.openAfterDelay && finalTheme.openDelaySeconds !== undefined && !isOpen && !autoOpenTriggeredRef.current) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                autoOpenTriggeredRef.current = true;
            }, finalTheme.openDelaySeconds * 1000);
            return () => clearTimeout(timer);
        }
    }, [finalTheme.openAfterDelay, finalTheme.openDelaySeconds, isOpen]);

    useEffect(() => {
        if (finalTheme.showWelcomeBubble && !miniBubbleTriggeredRef.current && !isOpen) {
            const delay = finalTheme.welcomeBubbleDelaySeconds !== undefined ? finalTheme.welcomeBubbleDelaySeconds : 1;
            const timer = setTimeout(() => {
                setShowMiniBubble(true);
                miniBubbleTriggeredRef.current = true;
            }, delay * 1000);
            return () => clearTimeout(timer);
        }
        if (isOpen && showMiniBubble) {
            setShowMiniBubble(false);
        }
    }, [finalTheme.showWelcomeBubble, finalTheme.welcomeBubbleDelaySeconds, isOpen, showMiniBubble]);

    // --- RESTORED: Page Leave Effect ---
    useEffect(() => {
        const handlePageLeave = () => {
            if (messages.some(msg => msg.type === 'user') && sessionId) {
                const endOfConversationMessage = "End conversation, send transcript.";
                const payload = {
                    chatInput: endOfConversationMessage,
                    clientId: clientId,
                    sessionId: sessionId,
                    event: 'conversation_ended'
                };
                try {
                    fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        keepalive: true
                    });
                } catch (e) {
                    console.error("Error sending page leave event:", e);
                }
            }
        };
        window.addEventListener('pagehide', handlePageLeave);
        return () => {
            window.removeEventListener('pagehide', handlePageLeave);
        };
    }, [messages, sessionId, clientId, n8nWebhookUrl]);

    // --- STABLE CORE HANDLERS ---
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setShowMiniBubble(false);
        }
    };

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (textToSend === '' || !sessionId) return;

        const userMessage = { type: 'user' as const, text: textToSend, timestamp: new Date() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: userMessage.text, clientId, sessionId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponseText = data.output || 'Sorry, I could not process your request.';

            let formattedText = botResponseText;
            if (typeof marked !== 'undefined') {
                const parsedResult = marked.parse(botResponseText);
                formattedText = (parsedResult instanceof Promise) ? await parsedResult : parsedResult;
            }

            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: formattedText, timestamp: new Date() }]);
        } catch (error) {
            console.error('Error sending message to n8n or processing response:', error);
            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Oops! I had trouble connecting.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const stopScrolling = () => {
        if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
        }
    };

    const startScrolling = (direction: 'left' | 'right') => {
        stopScrolling();
        const scrollAmount = direction === 'left' ? -4 : 4;

        const scroll = () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft += scrollAmount;
                scrollAnimationRef.current = requestAnimationFrame(scroll);
            }
        };
        scrollAnimationRef.current = requestAnimationFrame(scroll);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;

        const rect = scrollContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scrollZoneWidth = 60;

        if (mouseX < scrollZoneWidth) {
            startScrolling('left');
        } else if (mouseX > rect.width - scrollZoneWidth) {
            startScrolling('right');
        } else {
            stopScrolling();
        }
    };

    // --- NEW: CONDITIONAL RENDERING ---
    // If the membership status is inactive, render a simplified "unavailable" widget
    if (membershipStatus === 'inactive') {
        return (
            <div className={`chat-widget-container ${finalTheme.buttonPosition || 'bottom-right'}`}>
                {showStatusMessage && (
                    <div className="status-message-bubble">
                        Service unavailable
                    </div>
                )}
                <button
                    className="chat-bubble-button"
                    onClick={() => setShowStatusMessage(!showStatusMessage)}
                    style={{ backgroundColor: '#D32F2F' }} // A distinct error color like red
                >
                    <img
                        src="https://www.svgrepo.com/show/352966/attention.svg"
                        alt="Attention Icon"
                        className="chat-icon"
                    />
                </button>
            </div>
        );
    }

    // --- ORIGINAL JSX (RENAMED TO ACTIVE WIDGET) ---
    // If status is 'active', return the full chatbot you built
    return (
        <div className={`chat-widget-container ${finalTheme.buttonPosition}`}>
            {showMiniBubble && (
                <div className="mini-welcome-bubble" onClick={toggleChat}>
                    <span>{finalTheme.welcomeBubbleText}</span>
                </div>
            )}
            <button className="chat-bubble-button" onClick={toggleChat}>
                <img src={finalTheme.customIconUrl} alt="Chat Icon" className="chat-icon" />
            </button>
            <div className={`chat-window ${isOpen ? 'is-open' : 'is-closed'}`} style={{ borderColor: 'var(--primary-color)' }}>
                <div className="chat-header" style={{ backgroundColor: 'var(--primary-color)' }}>
                    {finalTheme.headerIconUrl && (
                        <img src={finalTheme.headerIconUrl} className="header-avatar" alt="Header Avatar"/>
                    )}
                    <div className="header-info">
                        <h3>{finalTheme.headerTitle}</h3>
                        {finalTheme.showOnlineStatus && (
                            <div className="header-status">
                                <span className="online-dot"></span>
                                <span>Online</span>
                            </div>
                        )}
                    </div>
                    <button className="close-button" onClick={toggleChat} style={{ color: 'var(--close-button-color)' }}>
                        &times;
                    </button>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type}`}>
                            <div className={`message-bubble ${msg.type}`} style={{ backgroundColor: msg.type === 'user' ? 'var(--user-bubble-color)' : 'var(--bot-bubble-color)'}}>
                                {msg.type === 'user' ? (
                                    msg.text
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text || '') }} />
                                )}
                            </div>
                            {/* NEW: Add the timestamp below the bubble */}
        <span className="message-timestamp">
            {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
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

                {visibleSuggestedMessages.length > 0 && (
                    <div className="suggested-messages-area">
                        <div
                            ref={scrollContainerRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={stopScrolling}
                            className="suggested-messages-button-wrapper"
                        >
                            {visibleSuggestedMessages.map(msg => (
                                <button
                                    key={msg.id}
                                    className={`suggested-message-button ${msg.status === 'disappearing' ? 'disappearing' : ''}`}
                                    onClick={() => {
                                        setVisibleSuggestedMessages(currentMessages =>
                                            currentMessages.map(m =>
                                                m.id === msg.id ? { ...m, status: 'disappearing' } : m
                                            )
                                        );
                                        handleSendMessage(msg.text);
                                    }}
                                    onAnimationEnd={() => {
                                        setVisibleSuggestedMessages(currentMessages =>
                                            currentMessages.filter(m => m.id !== msg.id)
                                        );
                                    }}
                                >
                                    {msg.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="chat-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={finalTheme.inputPlaceholder}
                        style={{ borderColor: 'var(--input-border-color)' }}
                    />
                    <button onClick={() => handleSendMessage()} className="send-icon-button">
    <img src="https://res.cloudinary.com/dlasog0p4/image/upload/v1756573647/send-svgrepo-com_2_i9iest.svg" alt="Send" />
</button>
                </div>
                {finalTheme.showPoweredByBranding && finalTheme.poweredByText && (
                    <div className="chat-powered-by">
                        {finalTheme.poweredByUrl ? (
                            <a href={finalTheme.poweredByUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--powered-by-link-color)' }}>
                                {finalTheme.poweredByText}
                            </a>
                        ) : (
                            <span style={{ color: 'var(--powered-by-text-color)' }}>{finalTheme.poweredByText}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;