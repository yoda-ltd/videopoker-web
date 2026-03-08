#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'articles');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const VARIANT_NAMES = [
    "Jacks or Better", "Deuces Wild", "Bonus Poker", "Double Bonus", "Double Double Bonus",
    "Triple Double Bonus", "Aces and Faces", "Aces and Eights", "All American", "Joker Poker",
    "Loose Deuces", "Sevens Wild", "Tens or Better", "White Hot Aces", "Super Aces Bonus"
];

const TEMPLATES = [
    {
        title: "How to Play {name} Video Poker: A Comprehensive Guide",
        topic: "Rules and Basics",
        keywords: ["{name}", "how to play", "rules", "video poker"]
    },
    {
        title: "Ultimate {name} Strategy Chart: Win More in 2026",
        topic: "Strategy",
        keywords: ["{name} strategy", "strategy chart", "win video poker"]
    },
    {
        title: "{name} Payout Table Explained: 9/6 vs 8/5 and More",
        topic: "Payouts",
        keywords: ["{name} payout", "pay table", "odds"]
    },
    {
        title: "Free {name} Video Poker Online - No Download Required",
        topic: "Play for Free",
        keywords: ["free {name}", "online video poker", "no download"]
    },
    {
        title: "Top 5 Tips for Mastering {name} Video Poker",
        topic: "Tips",
        keywords: ["{name} tips", "video poker hacks", "mastering poker"]
    }
];

let articleCount = 0;

// Generate game-specific titles
VARIANT_NAMES.forEach(name => {
    TEMPLATES.forEach(tpl => {
        const title = tpl.title.replace(/{name}/g, name);
        const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
        const content = `# ${title}\n\n[DRAFT] Topic: ${tpl.topic}\nKeywords: ${tpl.keywords.join(', ').replace(/{name}/g, name)}\n\nThis article will cover the in-depth details of ${name}.`;
        fs.writeFileSync(path.join(OUTPUT_DIR, fileName), content);
        articleCount++;
    });
});

// Generate generic titles
const genericTopics = ["History of Video Poker", "Best Casinos in Las Vegas for Video Poker", "Online vs Offline Video Poker", "Mental Side of Gambling", "RNG in Video Poker Explained"];
genericTopics.forEach(topic => {
    const title = `${topic}: Everything You Need to Know`;
    const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), `# ${title}\n\nContent for ${topic} goes here.`);
    articleCount++;
});

console.log(`Generated ${articleCount} article stubs.`);
