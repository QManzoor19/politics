# Politics

A self-paced introductory politics course built as a single-page web app. Mobile-friendly, installable as a PWA, dark turquoise theme.

## Curriculum (9 units, 35 lessons)

1. **What Is Politics?** — power, the state, authority
2. **Political Thinkers** — Hobbes, Locke, Rousseau, Marx, Mill, Rawls
3. **Ideologies** — liberalism, conservatism, socialism, fascism, anarchism
4. **Forms of Government** — democracy, monarchy, authoritarianism, hybrid regimes
5. **US Government** — Constitution, separation of powers, federalism, rights
6. **Political Participation** — elections, parties, interest groups, media
7. **Comparative Politics** — UK, Russia/China, Mexico/Nigeria, Iran
8. **International Politics** — realism vs. liberalism, IOs, war and peace
9. **Current Debates** — backsliding, climate, AI, identity

Lesson 1 is fully written (~1,400 words with mini-quizzes, vocab pills, callouts, and a Bloom's-taxonomy thinking ladder). The rest auto-stub from the unit map until they're filled in.

## Features

- **Lesson scaffolding** — every lesson gets a hook, learning objectives, "Connect & Transfer" prompt, and a Bloom's-taxonomy ladder (Remember → Create)
- **Mini-quizzes** inline in lessons
- **Flashcards** auto-generated from the glossary, plus custom-card support
- **Quiz tab** with per-unit filtering
- **Glossary** with searchable definitions and click-through vocab pills in lessons
- **AI tutor** (optional, requires your own Anthropic API key)
- **XP, streaks, badges, weekly goal**
- **Notes & saved chats** stored in localStorage
- **PWA** — installable on iOS / Android home screen with manifest shortcuts to jump straight into Lessons / Quiz / Flashcards
- **Mobile-first responsive layout** with touch-friendly tab nav and safe-area-inset support

## Run locally

```bash
# any static server works:
python -m http.server 8000
# then open http://localhost:8000
```

Or open `index.html` directly — most features work over `file://`, but PWA install and service worker need a real server.

## Install as an app

- **iOS:** Open in Safari → Share → "Add to Home Screen"
- **Android:** Open in Chrome → menu → "Install app" (or "Add to Home Screen")
- **Desktop:** Look for the install icon in the address bar (Chrome / Edge)

## AI features (optional)

Add an Anthropic API key in **Settings (⚙️)** to enable the AI tutor and AI-generated deep dives. The key is stored only in your browser's localStorage — never sent to any server other than `api.anthropic.com`.

## Stack

Vanilla HTML, CSS, JavaScript. No frameworks, no build tools. Drop-in PWA (`sw.js`, `manifest.json`, maskable icons).

## Project layout

```
politicsapp/
├── index.html         # shell + all CSS
├── app.js             # all behavior
├── sw.js              # service worker (offline cache)
├── manifest.json      # PWA install manifest with shortcuts
├── icon-*.png, icon.svg, apple-touch-icon.png
└── data/
    ├── units.js       # curriculum map (9 units, 35 lessons)
    ├── lessons.js     # lesson HTML bodies (auto-stubs until filled in)
    ├── pedagogy.js    # hook / objectives / transfer / Bloom's ladder per lesson
    ├── glossary.js    # term definitions (powers vocab pills + flashcards)
    ├── quizzes.js     # quiz items
    ├── videos.js      # embedded YouTube links per lesson
    └── deepdives.js   # cached deep-dive content (AI-augmented)
```

## License

Personal learning project — feel free to fork and adapt.
