// ============================================================
// SHARED MANIFEST — keep in sync between:
//   widget:    src/widget-styles.ts
//   dashboard: src/lib/widget-styles.ts
// Small enough that duplication is cheaper than a package.
// ============================================================

export type WidgetVariant = 'classic' | 'modern' | 'professional' | 'minimalist';

export const WIDGET_VARIANTS: WidgetVariant[] = [
    'classic',
    'modern',
    'professional',
    'minimalist',
];

/**
 * What each variant supports at render + settings time.
 * The widget reads runtime flags (hasHeader, playsSound, launcher shape).
 * The dashboard reads `controls` to decide which fields to render.
 */
export type VariantCapability = {
    /** Whether the variant renders the header bar at all. */
    hasHeader: boolean;
    /** How the bot's presence line displays under the name. */
    subtitle: 'text' | 'online-pulse' | 'none';
    /** Shape of the floating bubble launcher. */
    launcher: 'circle-icon' | 'pill-icon-label' | 'square-monogram' | 'circle-dots';
    /** Which SVG icon lives inside the launcher (when it renders an icon). */
    launcherIcon: 'chat' | 'spark' | 'none';
    /** Rating card primary button style. */
    ratingButton: 'filled' | 'gradient' | 'outlined';
    /** Whether new-message notification sound plays. */
    playsSound: boolean;
    /** Which fields the dashboard should render for this variant. */
    controls: {
        headerTitle: boolean;
        avatar: boolean;
        headerSubtitle: boolean;
        headerHoursLine: boolean;
        launcherLabel: boolean;
        launcherMonogram: boolean;
        gradientStop: boolean;
        goldAccentColor: boolean;
        onlineStatus: boolean;
    };
};

export const VARIANT_CAPABILITIES: Record<WidgetVariant, VariantCapability> = {
    classic: {
        hasHeader: true,
        subtitle: 'text',
        launcher: 'circle-icon',
        launcherIcon: 'chat',
        ratingButton: 'filled',
        playsSound: true,
        controls: {
            headerTitle: true,
            avatar: true,
            headerSubtitle: true,
            headerHoursLine: false,
            launcherLabel: false,
            launcherMonogram: false,
            gradientStop: false,
            goldAccentColor: false,
            onlineStatus: false,
        },
    },
    modern: {
        hasHeader: true,
        subtitle: 'online-pulse',
        launcher: 'pill-icon-label',
        launcherIcon: 'spark',
        ratingButton: 'gradient',
        playsSound: true,
        controls: {
            headerTitle: true,
            avatar: true,
            headerSubtitle: false,
            headerHoursLine: false,
            launcherLabel: true,
            launcherMonogram: false,
            gradientStop: true,
            goldAccentColor: false,
            onlineStatus: true,
        },
    },
    professional: {
        hasHeader: true,
        subtitle: 'text',
        launcher: 'square-monogram',
        launcherIcon: 'none',
        ratingButton: 'filled',
        playsSound: true,
        controls: {
            headerTitle: true,
            avatar: false, // Professional uses a monogram tile, not a photo
            headerSubtitle: false,
            headerHoursLine: true,
            launcherLabel: false,
            launcherMonogram: true,
            gradientStop: false,
            goldAccentColor: true,
            onlineStatus: false,
        },
    },
    minimalist: {
        hasHeader: false,
        subtitle: 'none',
        launcher: 'circle-dots',
        launcherIcon: 'none',
        ratingButton: 'outlined',
        playsSound: false, // silent per product decision
        controls: {
            headerTitle: false,
            avatar: false,
            headerSubtitle: false,
            headerHoursLine: false,
            launcherLabel: false,
            launcherMonogram: false,
            gradientStop: false,
            goldAccentColor: false,
            onlineStatus: false,
        },
    },
};

/**
 * Variant-specific style config. Every field is optional and falls back
 * to variant defaults. All fields persist across variant switches so that
 * flipping Modern → Classic → Modern preserves the user's tweaks.
 */
export type VariantStyleConfig = {
    // Modern
    gradientStop?: string;
    launcherLabel?: string;
    showOnlineStatus?: boolean;
    // Professional
    goldAccentColor?: string;
    launcherMonogram?: string;
    headerHoursLine?: string;
    // Classic
    headerSubtitle?: string;
};

/** Default values per variant. Read at render time when the config field is empty. */
export const VARIANT_DEFAULTS: Record<WidgetVariant, {
    accentColor: string;
    style: VariantStyleConfig;
}> = {
    classic: {
        accentColor: '#2563eb',
        style: {
            headerSubtitle: 'Usually replies in a few minutes',
        },
    },
    modern: {
        accentColor: '#8a5cff',
        style: {
            gradientStop: '#4f7cff',
            launcherLabel: 'Ask us',
            showOnlineStatus: true,
        },
    },
    professional: {
        accentColor: '#0f2540',
        style: {
            goldAccentColor: '#c9a35c',
            launcherMonogram: 'B&C',
            headerHoursLine: 'Mon–Fri, 9am–6pm ET',
        },
    },
    minimalist: {
        accentColor: '#5c7a63',
        style: {},
    },
};

/** Metadata for the dashboard's style picker cards. */
export const VARIANT_META: Record<WidgetVariant, { label: string; tagline: string }> = {
    classic: {
        label: 'Classic',
        tagline: 'Familiar chat pattern — circle launcher, rounded bubbles.',
    },
    modern: {
        label: 'Modern',
        tagline: 'Gradient pill launcher, springy motion, polished feel.',
    },
    professional: {
        label: 'Professional',
        tagline: 'Boxy and restrained. Corporate-trustworthy.',
    },
    minimalist: {
        label: 'Minimalist',
        tagline: 'No header, minimal shadows, generous whitespace.',
    },
};

/** Type-guard for user input / config JSON. */
export function isWidgetVariant(v: unknown): v is WidgetVariant {
    return typeof v === 'string' && (WIDGET_VARIANTS as string[]).includes(v);
}

/** Normalize any input to a valid variant, defaulting to 'classic'. */
export function normalizeVariant(v: unknown): WidgetVariant {
    return isWidgetVariant(v) ? v : 'classic';
}

/** Convenience: fetch a resolved style value with fallback to variant default. */
export function resolveStyleValue<K extends keyof VariantStyleConfig>(
    variant: WidgetVariant,
    key: K,
    userValue: VariantStyleConfig[K] | undefined
): VariantStyleConfig[K] {
    if (userValue !== undefined && userValue !== null && userValue !== '') return userValue;
    return VARIANT_DEFAULTS[variant].style[key];
}
