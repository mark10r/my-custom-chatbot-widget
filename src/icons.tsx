// Inline SVG icons used across the widget.
// All icons use currentColor so they inherit from parent CSS (variant-aware).
// Sizing lives in CSS; the width/height here are sensible defaults only.

import React from 'react';

const strokeStyle: React.SVGAttributes<SVGSVGElement> = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...strokeStyle} {...props}>
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...strokeStyle} {...props}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
);

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...strokeStyle} {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

export const SparkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z" />
    </svg>
);

export const ThumbUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
         {...props}>
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
);

export const ThumbDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
         {...props}>
        {/* Rotate the inner <g>, not the outer <svg> — some browsers off-center the outer flip. */}
        <g transform="rotate(180 12 12)">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </g>
    </svg>
);
