// src/main.tsx

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ChatWidget from './ChatWidget.tsx';
import './index.css';

// Define a default configuration
export const defaultConfig = {
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
        ratingsEnabled: true,
    },
    clientId: 'client_224c8vvrto',
};

type ScheduleDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type ScheduleDay = { open: boolean; start: string; end: string };

export type WidgetAvailability = {
    enabled: boolean;
    schedule: {
        enabled: boolean;
        timezone: string;
        days: Record<ScheduleDayKey, ScheduleDay>;
    };
};

const DEFAULT_WIDGET_AVAILABILITY: WidgetAvailability = {
    enabled: true,
    schedule: {
        enabled: false,
        timezone: 'UTC',
        days: {
            mon: { open: true,  start: '09:00', end: '17:00' },
            tue: { open: true,  start: '09:00', end: '17:00' },
            wed: { open: true,  start: '09:00', end: '17:00' },
            thu: { open: true,  start: '09:00', end: '17:00' },
            fri: { open: true,  start: '09:00', end: '17:00' },
            sat: { open: false, start: '09:00', end: '17:00' },
            sun: { open: false, start: '09:00', end: '17:00' },
        },
    },
};

declare global {
    interface Window {
        optinbotConfig?: {
            theme?: Partial<typeof defaultConfig.theme>;
            clientId?: string;
            chatbotId?: string;
            isPreview?: boolean;
        };
    }
}

const getMembershipStatus = async (clientId: string): Promise<'active' | 'inactive'> => {
    const cacheKey = `optinbot_status_${clientId}`;
    const cachedStatus = sessionStorage.getItem(cacheKey);
    if (cachedStatus === 'active' || cachedStatus === 'inactive') return cachedStatus as 'active' | 'inactive';

    try {
        const response = await fetch('https://app.optinbot.io/api/membership', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId }),
        });
        if (!response.ok) return 'inactive';
        const data = await response.json();
        const normalized = (data.status || '').trim().toLowerCase();
        const statusResult = (normalized === 'active' || normalized === 'trial') ? 'active' : 'inactive';
        sessionStorage.setItem(cacheKey, statusResult);
        return statusResult;
    } catch (error) { return 'inactive'; }
};

// Fetch saved theme + availability from the dashboard so embed codes never
// need updating. Returns nulls on failure — the widget falls back to
// inline/default theme and to "always live" availability.
const fetchWidgetConfig = async (chatbotId: string): Promise<{
    theme: Partial<typeof defaultConfig.theme> | null;
    widget: WidgetAvailability;
}> => {
    try {
        const response = await fetch('https://app.optinbot.io/api/widget-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatbotId }),
        });
        if (!response.ok) return { theme: null, widget: DEFAULT_WIDGET_AVAILABILITY };
        const data = await response.json();
        return {
            theme: data.theme && typeof data.theme === 'object' ? data.theme : null,
            widget: (data.widget && typeof data.widget === 'object') ? data.widget : DEFAULT_WIDGET_AVAILABILITY,
        };
    } catch { return { theme: null, widget: DEFAULT_WIDGET_AVAILABILITY }; }
};

const DAY_KEYS: ScheduleDayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Evaluate whether the widget should render "now" for a given availability
// config. Uses Intl.DateTimeFormat so the timezone comparison always uses the
// chatbot owner's timezone, not the visitor's system clock zone.
export const isWidgetLive = (widget: WidgetAvailability, now: Date = new Date()): boolean => {
    if (!widget.enabled) return false;
    if (!widget.schedule.enabled) return true;

    const tz = widget.schedule.timezone || 'UTC';
    let parts: Intl.DateTimeFormatPart[];
    try {
        parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(now);
    } catch {
        // Bad timezone identifier — treat as always live so we never accidentally
        // hide a live widget over a config typo.
        return true;
    }

    const weekday = parts.find(p => p.type === 'weekday')?.value.toLowerCase() ?? '';
    const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
    const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
    const dayKey = DAY_KEYS.find(k => weekday.startsWith(k)) as ScheduleDayKey | undefined;
    if (!dayKey) return true;

    const day = widget.schedule.days[dayKey];
    if (!day || !day.open) return false;

    const nowMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);
    const [sh, sm] = day.start.split(':').map(n => parseInt(n, 10));
    const [eh, em] = day.end.split(':').map(n => parseInt(n, 10));
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    // Windows are inclusive of start, exclusive of end (09:00 open, 17:00 closed).
    if (endMinutes <= startMinutes) return false;
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
};

const initializeChatbot = async () => {
    const container = document.getElementById('optinbot-chatbot-container');
    if (!container) return;

    // --- DETECT PREVIEW MODE ---
    const isLocal = window.location.hostname === 'localhost';
    const isDashboardReferrer = document.referrer && document.referrer.includes('optinbot.io');
    const hasPreviewFlag = window.optinbotConfig?.isPreview === true || window.location.search.includes('preview=true');

    // Combine current signals
    let isPreviewMode = isLocal || isDashboardReferrer || hasPreviewFlag;

    const clientId = window.optinbotConfig?.clientId ?? defaultConfig.clientId;
    const chatbotId = window.optinbotConfig?.chatbotId ?? '';

    // In preview mode the dashboard passes live (unsaved) edits inline — the
    // remote saved theme must not override them, so skip the fetch.
    // Membership check is also skipped — trial may be expired for test accounts.
    const [membershipStatus, remoteConfig] = isPreviewMode
        ? (['active', { theme: null, widget: DEFAULT_WIDGET_AVAILABILITY }] as const)
        : await Promise.all([
            getMembershipStatus(clientId),
            chatbotId ? fetchWidgetConfig(chatbotId) : Promise.resolve({ theme: null, widget: DEFAULT_WIDGET_AVAILABILITY }),
        ]);

    const finalConfig = {
        ...defaultConfig,
        ...window.optinbotConfig,
        clientId,
        // Remote (saved) theme wins over inline theme so dashboard edits take
        // effect even on old embeds that still carry a full inline theme.
        theme: { ...defaultConfig.theme, ...window.optinbotConfig?.theme, ...remoteConfig.theme },
    };

    const widgetAvailability: WidgetAvailability = remoteConfig.widget;

    const root: Root = createRoot(container);

    // We wrap this in a tiny component to handle dynamic postMessage updates
    // and to re-evaluate schedule liveness every minute.
    const AppWrapper = () => {
        const [preview, setPreview] = React.useState(isPreviewMode);
        const [liveTick, setLiveTick] = React.useState(0);

        React.useEffect(() => {
            const handleMessage = (event: MessageEvent) => {
                // Security check: only allow messages from our own domain
                if (event.origin.includes('optinbot.io') || isLocal) {
                    if (event.data?.type === 'SET_PREVIEW_MODE') {
                        setPreview(!!event.data.value);
                    }
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }, []);

        // Re-check availability every 60s so open/close boundaries fire without
        // a page reload. Skipped in preview (dashboard should always render).
        React.useEffect(() => {
            if (preview) return;
            const id = window.setInterval(() => setLiveTick(t => t + 1), 60_000);
            return () => window.clearInterval(id);
        }, [preview]);

        // Preview always renders. Otherwise gate on availability.
        if (!preview && !isWidgetLive(widgetAvailability)) {
            // Referenced so eslint knows the tick drives re-render decisions.
            void liveTick;
            return null;
        }

        return (
            <React.StrictMode>
                <ChatWidget
                    n8nWebhookUrl=""
                    theme={finalConfig.theme}
                    clientId={finalConfig.clientId}
                    chatbotId={window.optinbotConfig?.chatbotId ?? ''}
                    membershipStatus={membershipStatus}
                    isPreview={preview}
                />
            </React.StrictMode>
        );
    };

    root.render(<AppWrapper />);
};

initializeChatbot();
