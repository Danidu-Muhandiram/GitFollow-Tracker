// ==UserScript==
// @name         GitHub Follow Checker
// @namespace    http://github.com/Danidu-Muhandiram
// @version      10.1
// @description  Shows who follows YOU back on GitHub (Following Section)
// @match        https://github.com/*?tab=following*
// @match        https://github.com/*/*?tab=following*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    console.log("🚀 GitHub Follow Checker started");

    // ---------------------------------
    // LOCK TO YOUR ACCOUNT
    // ---------------------------------
    const OWNER = "YOUR-USERNAME";

    const username = window.location.pathname.split("/")[1];

    if (username !== OWNER) {
        console.log("❌ Not owner profile. Script disabled.");
        return;
    }

    console.log("👤 Verified owner:", username);

    // ---------------------------------
    // Get followers from GitHub API
    // ---------------------------------
    async function getFollowers(user) {
        let followers = [];
        let page = 1;

        try {
            while (true) {
                const response = await fetch(
                    `https://api.github.com/users/${user}/followers?per_page=100&page=${page}`
                );

                const data = await response.json();

                if (!data || data.length === 0) {
                    break;
                }

                followers.push(...data.map(u => u.login));
                page++;
            }

            return followers;

        } catch (err) {
            console.error("❌ API Error:", err);
            return [];
        }
    }

    // ---------------------------------
    // Add badges ONLY to following users
    // ---------------------------------
    function addBadges(followersSet) {

        const userLinks = document.querySelectorAll(
            'a[data-hovercard-type="user"]'
        );

        console.log("👥 User links found:", userLinks.length);

        userLinks.forEach(link => {

            const href = link.getAttribute("href");
            if (!href) return;

            const user = href.replace("/", "").trim();

            // Skip invalid links
            if (
                !user ||
                user.includes("/") ||
                user.includes("?") ||
                link.classList.contains("user-mention")
            ) {
                return;
            }

            // Ignore avatar links
            if (link.querySelector("img")) {
                return;
            }

            // Prevent duplicate badge
            if (link.querySelector(".follow-checker-badge")) {
                return;
            }

            // Create badge
            const badge = document.createElement("span");
            badge.className = "follow-checker-badge";

            // Base style
            badge.style.marginLeft = "8px";
            badge.style.display = "inline-flex";
            badge.style.alignItems = "center";
            badge.style.padding = "2px 8px";
            badge.style.borderRadius = "999px";
            badge.style.fontSize = "11px";
            badge.style.fontWeight = "600";
            badge.style.lineHeight = "18px";
            badge.style.verticalAlign = "middle";
            badge.style.border = "1px solid";
            badge.style.userSelect = "none";

            // Status
            if (followersSet.has(user)) {
                badge.textContent = "Mutual";

                badge.style.background = "rgba(46, 160, 67, 0.22)";
                badge.style.color = "#1f883d";
                badge.style.borderColor = "rgba(46, 160, 67, 0.55)";
            } else {
                badge.textContent = "Not mutual";

                badge.style.background = "rgba(248, 81, 73, 0.22)";
                badge.style.color = "#d1242f";
                badge.style.borderColor = "rgba(248, 81, 73, 0.55)";
            }

            link.appendChild(badge);
        });
    }

    // ---------------------------------
    // Main
    // ---------------------------------
    async function main() {

        console.log("⏳ Fetching followers...");

        const followers = await getFollowers(username);

        console.log("👥 Followers loaded:", followers.length);

        const followersSet = new Set(followers);

        const interval = setInterval(() => {

            const links = document.querySelectorAll(
                'a[data-hovercard-type="user"]'
            );

            if (links.length > 0) {

                console.log("✔ Following list loaded");

                addBadges(followersSet);

                clearInterval(interval);
            }

        }, 1000);
    }

    main();

})();
