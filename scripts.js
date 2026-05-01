// ==UserScript==
// @name         Raindrop Random Bookmark
// @namespace    http://tampermonkey.net/
// @version      2026-02-07_02
// @description  Scroll through an open raindrop collection and pick a random bookmark.
// @author       AB
// @match        https://*.raindrop.io/*
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>🎲</text></svg>
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const getList = () => {
        const m = document.getElementsByTagName('main');
        return m.length > 1 ? m[1] : m[0];
    };

    const openItem = (idx, retries) => {
        const item = getList()?.childNodes[idx];
        if (!item) return retries > 0 && setTimeout(() => openItem(idx, retries - 1), 1000);

        const link = item.querySelector('a[class*="permalink"]');
        if (link?.href) return window.open(link.href, '_blank');

        if (retries > 0) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => openItem(idx, retries - 1), 1000);
        }
    };

    const scrollList = () => {
        const footer = document.querySelector('[class*="footer"]');
        const list = getList();
        if (!list) return alert("Bookmark list not found.");

        if (footer?.childElementCount > 0) {
            list.lastElementChild?.scrollIntoView();
            setTimeout(scrollList, 100);
        } else {
            const total = parseInt(footer?.innerText.match(/\d+/)?.[0] || list.childElementCount);
            const count = Math.min(list.childElementCount, total);
            if (!count) return;

            const idx = Math.floor(Math.random() * count);
            list.childNodes[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => openItem(idx, 10), 800);
        }
    };

    const addButton = () => {
        const share = document.querySelector('div[title="Share"][class*="button"]') ?? document.querySelector('div[title="Ask"][class*="button"]');
        if (!share) return setTimeout(addButton, 500);

        const btn = share.cloneNode(true);
        btn.title = 'Random';
        btn.onclick = scrollList;
        btn.querySelectorAll('*').forEach(n => {
            if (n.tagName === 'SPAN' && (n.innerText === 'Share' || n.innerText === 'Ask')) n.innerText = 'Random';
            else if (n.tagName === 'SPAN') {
                n.className = '';
                n.innerHTML = '⚃';
            }
        });
        share.parentNode.insertBefore(btn, share);
    };

    GM_registerMenuCommand("🎲 Open Random Bookmark", scrollList, "r");
    addButton();
})();