// public/loader.js

// This script dynamically injects the latest hashed CSS and JS files
// from Cloudflare Pages, ensuring clients always get the latest version.

(function() {
    // --- Configuration for the latest widget assets ---
    // IMPORTANT: These URLs MUST be updated manually (or via automation)
    // after each successful 'npm run build' and Cloudflare Pages deployment.
    // Get these from your Cloudflare Pages 'Assets uploaded' tab.
    const LATEST_CSS_URL = 'http://cdn.optinbot.io/assets/index-DR2Tsp8E.css';
    const LATEST_JS_URL = 'http://cdn.optinbot.io/assets/index-gxgBfqx3.js';

    // --- Dynamic Injection Logic ---

    // 1. Create and append the CSS link tag
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = LATEST_CSS_URL;
    document.head.appendChild(styleLink);

    // 2. Create and append the main JavaScript script tag
    const script = document.createElement('script');
    script.type = 'module'; // Important for ES Modules
    script.defer = true;    // Defer execution until DOM is parsed
    script.src = LATEST_JS_URL;
    document.body.appendChild(script);

    // Console log for debugging (optional, remove in production)
    console.log('OptInBot Loader: Injected latest widget assets.');
    console.log('OptInBot Loader: CSS URL:', LATEST_CSS_URL);
    console.log('OptInBot Loader: JS URL:', LATEST_JS_URL);

})();