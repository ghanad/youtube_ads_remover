// ==UserScript==
// @name         Stealth YouTube Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Remove sponsored content from YouTube
// @author       Your name
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let processingMutation = false;

    // تعریف سلکتورهای مربوط به تبلیغات ثابت
    const AD_SELECTORS = [
        'ytd-ad-slot-renderer',
        '.style-scope.ytd-ad-slot-renderer',
        'ytd-in-feed-ad-layout-renderer',
        '.ytd-promoted-sparkles-web-renderer',
        '.ytd-promoted-video-renderer',
        '.ytd-display-ad-renderer',
        'ytd-promoted-sparkles-text-search-renderer'
    ];

    function removeAds() {
        if (processingMutation) return;
        processingMutation = true;

        requestAnimationFrame(() => {
            // حذف با استفاده از سلکتورها
            AD_SELECTORS.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });

            // حذف با استفاده از getElementsByTagName
            const adElements = document.getElementsByTagName('ytd-ad-slot-renderer');
            for (let i = adElements.length - 1; i >= 0; i--) {
                adElements[i].remove();
            }

            processingMutation = false;
        });
    }

    const observer = new MutationObserver((mutations) => {
        let shouldRemoveAds = false;

        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    // بررسی نود‌های جدید
                    if (
                        node.nodeName === 'YTD-AD-SLOT-RENDERER' ||
                        (node.className &&
                         typeof node.className === 'string' &&
                         node.className.includes('ad-'))
                    ) {
                        shouldRemoveAds = true;
                        break;
                    }
                }
                if (shouldRemoveAds) break;
            }
        }

        if (shouldRemoveAds) {
            removeAds();
        }
    });

    const mainContent = document.getElementById('content') || document.body;
    observer.observe(mainContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    removeAds();

    setInterval(removeAds, 2000);
})();
