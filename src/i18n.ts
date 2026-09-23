// Widget UI strings. Kept intentionally small — the widget bundles ship on
// every customer's site, so we don't pull in an i18n library. `t()` looks up
// the key in the resolved dictionary; missing keys fall back to English.
//
// The locale here is the VISITOR-facing widget language, chosen per-chatbot
// in the dashboard's Widget Configurator. It is independent from the
// operator's dashboard locale.

export type WidgetLocaleSetting = 'auto' | 'en' | 'es';
export type ResolvedLocale = 'en' | 'es';

type Dict = Record<string, string>;

const en: Dict = {
    // Defaults for operator-authored fields — used only when the operator
    // hasn't customized (value is empty or still matches the English default).
    default_header_title: 'Chat with our AI Assistant',
    default_header_subtitle: 'Usually replies in a few minutes',
    default_input_placeholder: 'Type your message...',
    default_welcome_message: 'Hello! How can I help you today?',
    default_welcome_bubble_text: 'Hey there! 👋 Have a question?',
    default_suggested_1: 'What does your company do?',
    default_suggested_2: 'Is there a free trial available?',
    default_suggested_3: 'What are your pricing plans?',
    default_suggested_4: 'Talk to a human',

    // Chrome / a11y
    dismiss: 'Dismiss',
    open_chat: 'Open chat',
    close_chat: 'Close chat',
    close: 'Close',
    send_message: 'Send message',
    dismiss_rating: 'Dismiss rating',

    // Rating card
    rate_conversation: 'Rate this conversation',
    how_was_chat: 'How was your chat?',
    thumbs_up: 'Thumbs up',
    thumbs_down: 'Thumbs down',
    feedback_up_placeholder: 'What did you love? (optional)',
    feedback_down_placeholder: 'What went wrong? (optional)',
    send_feedback: 'Send Feedback',
    keep_chatting: 'Keep chatting',
    skip: 'Skip',
    skip_and_close: 'Skip & close',
    you_rated_this_chat: 'You rated this chat',
    rate_this_chat: 'Rate this chat',
    was_this_helpful: 'Was this helpful?',

    // Bot messages
    connection_error: 'Oops! I had trouble connecting.',
    booking_success_message: "Great — you're all set for <strong>{when}</strong>. I've sent an invite to {email}.",
    booking_success_meet_link: 'Join Google Meet',

    // Booking card
    booking_finding_times: 'Finding open times…',
    booking_error_title: 'Booking',
    booking_try_again: 'Try again',
    booking_all_set: "You're all set 🎉",
    booking_invite_sent: "We've sent an invite to {email}.",
    booking_join_meet: 'Join Google Meet',
    booking_pick_time: 'Pick a time',
    booking_confirm_title: 'Confirm your booking',
    booking_name_ph: 'Your name',
    booking_email_ph: 'you@example.com',
    booking_back: 'Back',
    booking_submitting: 'Booking…',
    booking_confirm: 'Confirm',

    // Booking errors
    booking_err_not_setup: "Booking isn't set up for this chatbot yet.",
    booking_err_load: "Couldn't load available times. Please try again.",
    booking_err_network: 'Network error. Please try again.',
    booking_err_taken: 'That time was just taken. Please pick another.',
    booking_err_book_failed: "Couldn't book that time. Please try again.",
    booking_err_no_open_times: 'No open times in the next 7 days.',
};

const es: Dict = {
    default_header_title: 'Chatea con nuestro asistente de IA',
    default_header_subtitle: 'Suele responder en unos minutos',
    default_input_placeholder: 'Escribe tu mensaje...',
    default_welcome_message: '¡Hola! ¿En qué puedo ayudarte hoy?',
    default_welcome_bubble_text: '¡Hola! 👋 ¿Alguna pregunta?',
    default_suggested_1: '¿A qué se dedica tu empresa?',
    default_suggested_2: '¿Hay una prueba gratuita disponible?',
    default_suggested_3: '¿Cuáles son sus planes de precios?',
    default_suggested_4: 'Hablar con una persona',

    dismiss: 'Descartar',
    open_chat: 'Abrir chat',
    close_chat: 'Cerrar chat',
    close: 'Cerrar',
    send_message: 'Enviar mensaje',
    dismiss_rating: 'Descartar valoración',

    rate_conversation: 'Valora esta conversación',
    how_was_chat: '¿Cómo estuvo tu chat?',
    thumbs_up: 'Me gusta',
    thumbs_down: 'No me gusta',
    feedback_up_placeholder: '¿Qué te encantó? (opcional)',
    feedback_down_placeholder: '¿Qué salió mal? (opcional)',
    send_feedback: 'Enviar comentario',
    keep_chatting: 'Seguir chateando',
    skip: 'Omitir',
    skip_and_close: 'Omitir y cerrar',
    you_rated_this_chat: 'Valoraste este chat',
    rate_this_chat: 'Valora este chat',
    was_this_helpful: '¿Te resultó útil?',

    connection_error: 'Ups, tuve problemas para conectarme.',
    booking_success_message: 'Genial: quedaste reservado para <strong>{when}</strong>. Envié una invitación a {email}.',
    booking_success_meet_link: 'Unirse a Google Meet',

    booking_finding_times: 'Buscando horarios disponibles…',
    booking_error_title: 'Reserva',
    booking_try_again: 'Reintentar',
    booking_all_set: '¡Todo listo! 🎉',
    booking_invite_sent: 'Enviamos una invitación a {email}.',
    booking_join_meet: 'Unirse a Google Meet',
    booking_pick_time: 'Elige un horario',
    booking_confirm_title: 'Confirma tu reserva',
    booking_name_ph: 'Tu nombre',
    booking_email_ph: 'tu@empresa.com',
    booking_back: 'Atrás',
    booking_submitting: 'Reservando…',
    booking_confirm: 'Confirmar',

    booking_err_not_setup: 'La reserva aún no está configurada para este chatbot.',
    booking_err_load: 'No se pudieron cargar los horarios. Inténtalo de nuevo.',
    booking_err_network: 'Error de red. Inténtalo de nuevo.',
    booking_err_taken: 'Ese horario acaba de ocuparse. Elige otro.',
    booking_err_book_failed: 'No se pudo reservar ese horario. Inténtalo de nuevo.',
    booking_err_no_open_times: 'No hay horarios disponibles en los próximos 7 días.',
};

const DICTS: Record<ResolvedLocale, Dict> = { en, es };

// Turn 'auto' + browser hint into a supported locale. Anything unrecognized
// falls back to English.
export const resolveLocale = (setting: WidgetLocaleSetting | undefined): ResolvedLocale => {
    if (setting === 'en' || setting === 'es') return setting;
    // 'auto' or undefined
    if (typeof navigator === 'undefined') return 'en';
    const primary = (navigator.language || 'en').toLowerCase().split('-')[0];
    return primary === 'es' ? 'es' : 'en';
};

// Look up a string; substitute {name} placeholders from `params`.
export const makeT = (locale: ResolvedLocale) => (key: string, params?: Record<string, string | number>): string => {
    const dict = DICTS[locale] ?? DICTS.en;
    let value = dict[key] ?? DICTS.en[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
    }
    return value;
};

export type Translator = ReturnType<typeof makeT>;
