import { useEffect, useState } from 'react';
import type { Translator, ResolvedLocale } from './i18n';

export const SCHEDULE_MEETING_TOKEN = '[SCHEDULE_MEETING]';

type Slot = { start: string; end: string };
type DateBlock = { date: string; slots: Slot[] };
type AvailabilityResponse = {
    timezone: string;
    durationMinutes: number;
    dates: DateBlock[];
};
type CreateResponse = {
    bookingId: string | null;
    meetLink: string | null;
    scheduledAt: string;
    durationMinutes: number;
};

type Phase =
    | { kind: 'loading' }
    | { kind: 'picking-date'; data: AvailabilityResponse; selectedDate?: string }
    | { kind: 'confirming'; data: AvailabilityResponse; selectedDate: string; slot: Slot; name: string; email: string; submitting: boolean }
    | { kind: 'booked'; slot: Slot; meetLink: string | null; email: string; timezone: string }
    | { kind: 'error'; message: string; canRetry: boolean };

type Props = {
    clientId: string;
    chatbotId: string;
    sessionId: string | null;
    // Prefills for the confirm step — the AI usually asks for these before
    // emitting the token, so the visitor already typed them into chat.
    prefillName?: string;
    prefillEmail?: string;
    onBooked: (info: { slot: Slot; meetLink: string | null; timezone: string; email: string }) => void;
    t: Translator;
    locale: ResolvedLocale;
};

const API_BASE = 'https://app.optinbot.io';

function bcp47(locale: ResolvedLocale): string {
    return locale === 'es' ? 'es-ES' : 'en-US';
}
function formatDate(iso: string, timeZone: string, locale: ResolvedLocale) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    return new Intl.DateTimeFormat(bcp47(locale), { timeZone, weekday: 'short', month: 'short', day: 'numeric' }).format(dt);
}
function formatTime(iso: string, timeZone: string, locale: ResolvedLocale) {
    return new Intl.DateTimeFormat(bcp47(locale), { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}
function shortDate(iso: string, timeZone: string, locale: ResolvedLocale) {
    return new Intl.DateTimeFormat(bcp47(locale), { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(iso));
}

export default function BookingCard({ clientId, chatbotId, sessionId, prefillName = '', prefillEmail = '', onBooked, t, locale }: Props) {
    const [phase, setPhase] = useState<Phase>({ kind: 'loading' });

    const loadAvailability = async () => {
        setPhase({ kind: 'loading' });
        try {
            const res = await fetch(`${API_BASE}/api/booking/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, chatbotId, days: 7 }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setPhase({
                    kind: 'error',
                    message: data.error === 'not_configured'
                        ? t('booking_err_not_setup')
                        : t('booking_err_load'),
                    canRetry: data.error !== 'not_configured',
                });
                return;
            }
            const dates: DateBlock[] = (data.dates as DateBlock[]).filter(d => d.slots.length > 0);
            if (dates.length === 0) {
                setPhase({ kind: 'error', message: t('booking_err_no_open_times'), canRetry: true });
                return;
            }
            const full: AvailabilityResponse = { ...data, dates };
            setPhase({ kind: 'picking-date', data: full, selectedDate: dates[0].date });
        } catch {
            setPhase({ kind: 'error', message: t('booking_err_network'), canRetry: true });
        }
    };

    useEffect(() => { loadAvailability(); /* eslint-disable-next-line */ }, []);

    const submitBooking = async () => {
        if (phase.kind !== 'confirming') return;
        const name = phase.name.trim();
        const email = phase.email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        setPhase({ ...phase, submitting: true });
        try {
            const res = await fetch(`${API_BASE}/api/booking/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    chatbotId,
                    chatSessionId: sessionId,
                    slotStart: phase.slot.start,
                    visitorName: name,
                    visitorEmail: email,
                }),
            });
            const data: CreateResponse & { error?: string } = await res.json();
            if (!res.ok || data.error) {
                if (data.error === 'slot_taken') {
                    setPhase({ kind: 'error', message: t('booking_err_taken'), canRetry: true });
                } else {
                    setPhase({ kind: 'error', message: t('booking_err_book_failed'), canRetry: true });
                }
                return;
            }
            const timezone = phase.data.timezone;
            setPhase({ kind: 'booked', slot: phase.slot, meetLink: data.meetLink, email, timezone });
            onBooked({ slot: phase.slot, meetLink: data.meetLink, timezone, email });
        } catch {
            setPhase({ kind: 'error', message: t('booking_err_network'), canRetry: true });
        }
    };

    if (phase.kind === 'loading') {
        return (
            <div className="booking-card">
                <div className="booking-card-title">{t('booking_finding_times')}</div>
                <div className="booking-loading"><span className="dot" /><span className="dot" /><span className="dot" /></div>
            </div>
        );
    }

    if (phase.kind === 'error') {
        return (
            <div className="booking-card">
                <div className="booking-card-title">{t('booking_error_title')}</div>
                <div className="booking-error">{phase.message}</div>
                {phase.canRetry && (
                    <button className="booking-primary" onClick={loadAvailability}>{t('booking_try_again')}</button>
                )}
            </div>
        );
    }

    if (phase.kind === 'booked') {
        return (
            <div className="booking-card">
                <div className="booking-card-title">{t('booking_all_set')}</div>
                <div className="booking-confirmation">
                    <div><strong>{shortDate(phase.slot.start, phase.timezone, locale)}</strong></div>
                    <div>{formatTime(phase.slot.start, phase.timezone, locale)} – {formatTime(phase.slot.end, phase.timezone, locale)}</div>
                    <div className="booking-muted">{t('booking_invite_sent', { email: phase.email })}</div>
                    {phase.meetLink && (
                        <a className="booking-meet-link" href={phase.meetLink} target="_blank" rel="noopener noreferrer">
                            {t('booking_join_meet')}
                        </a>
                    )}
                </div>
            </div>
        );
    }

    if (phase.kind === 'picking-date') {
        const selected = phase.data.dates.find(d => d.date === phase.selectedDate) ?? phase.data.dates[0];
        return (
            <div className="booking-card">
                <div className="booking-card-title">{t('booking_pick_time')}</div>
                <div className="booking-date-strip">
                    {phase.data.dates.map(d => (
                        <button
                            key={d.date}
                            className={`booking-date ${d.date === phase.selectedDate ? 'selected' : ''}`}
                            onClick={() => setPhase({ ...phase, selectedDate: d.date })}
                        >
                            {formatDate(d.date, phase.data.timezone, locale)}
                        </button>
                    ))}
                </div>
                <div className="booking-time-grid">
                    {selected.slots.map(s => (
                        <button
                            key={s.start}
                            className="booking-time"
                            onClick={() =>
                                setPhase({
                                    kind: 'confirming',
                                    data: phase.data,
                                    selectedDate: selected.date,
                                    slot: s,
                                    name: prefillName,
                                    email: prefillEmail,
                                    submitting: false,
                                })
                            }
                        >
                            {formatTime(s.start, phase.data.timezone, locale)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // confirming
    const canSubmit = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phase.email.trim()) && !phase.submitting;
    return (
        <div className="booking-card">
            <div className="booking-card-title">{t('booking_confirm_title')}</div>
            <div className="booking-summary">
                <div><strong>{shortDate(phase.slot.start, phase.data.timezone, locale)}</strong></div>
                <div>{formatTime(phase.slot.start, phase.data.timezone, locale)} – {formatTime(phase.slot.end, phase.data.timezone, locale)}</div>
            </div>
            <input
                className="booking-input"
                placeholder={t('booking_name_ph')}
                value={phase.name}
                onChange={(e) => setPhase({ ...phase, name: e.target.value })}
            />
            <input
                className="booking-input"
                type="email"
                placeholder={t('booking_email_ph')}
                value={phase.email}
                onChange={(e) => setPhase({ ...phase, email: e.target.value })}
            />
            <div className="booking-actions">
                <button
                    className="booking-secondary"
                    onClick={() => setPhase({ kind: 'picking-date', data: phase.data, selectedDate: phase.selectedDate })}
                >
                    {t('booking_back')}
                </button>
                <button className="booking-primary" onClick={submitBooking} disabled={!canSubmit}>
                    {phase.submitting ? t('booking_submitting') : t('booking_confirm')}
                </button>
            </div>
        </div>
    );
}
