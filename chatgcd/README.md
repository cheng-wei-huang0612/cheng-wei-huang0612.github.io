# ChatGCD

A standalone, browser-only GCD calculator for Cesare Huang's GitHub Pages site. The dark chat interface is an independent personal project, with no language model, backend, external API, analytics, fonts, or runtime dependencies.

## Use and deploy

Open `/chatgcd/` from the website's **Small experiments** section. Enter two ASCII decimal integers separated by one comma, such as `48, 18`, `-270, +192`, or `9007199254740993, 9007199254740995`. Press Enter or Send; Shift+Enter inserts a line break. The example cards start a calculation immediately. Every reply, including input errors, inserts `thinking....` with a uniformly sampled integer target delay of 500–2,000 microseconds (0.5–2 milliseconds), including both endpoints, converted to milliseconds for `setTimeout`. Browser timer resolution and scheduling determine the actual delay; the thinking state may finish before a visible frame is painted. Sending and examples pause during this time in the current room, but you can type a draft or switch to another room.

The checked-in `index.html`, `chatgcd.css`, `icon.svg`, `app.js`, `gcd.js`, `session.js`, and `followups.js` are the complete deployable page. Keep them together under `chatgcd/` and publish the repository with the existing GitHub Pages configuration. No deployment build step or workflow changes are needed. Serve over HTTP(S) when previewing, because the JavaScript uses native ES modules. Clipboard copying requires browser permission and a secure context (HTTPS or localhost); if unavailable, the result remains selectable.

The stylesheet and entry-script URLs carry a cache version in `index.html`. Bump it when either asset changes so returning visitors receive the matching interface and code.

Use a modern browser supporting BigInt, ES2020 and native ES modules. The page shows a loading/compatibility notice until initialization succeeds and a separate notice when JavaScript is disabled.

The welcome heading and its paired description are selected uniformly from four English variants once per page load. Opening or refreshing the page samples again; creating or switching chats keeps the same welcome for that visit. This adds no storage or network requests. The static HTML retains the original welcome as a fallback.

After a successful reply, **Try a follow-up · Click to calculate** appears above the input: **Try a random pair**, **Use answer as first number**, and **Try coprime numbers**. Each button previews its actual next calculation as `gcd(a, b)`. Suggestions sample fresh positive integers from 2–9,999 for each completed calculation. Random pairs have distinct integers and a sampled common factor, so their GCDs vary. **Use answer as first number** places the previous answer in the first position and pairs it with a random second number, preserving the exact BigInt. This option is hidden when the answer is 1, since every `gcd(1, b)` would also be 1; it remains available for zero. Long previews are visually shortened with an ellipsis while retaining the complete pair for calculation, the accessible button name and the hover title. Coprime examples use random consecutive integers. Sampling uses ordinary `Math.random`, with no cryptographic claim or retry loop.

Clicking a suggestion immediately sends its integer pair in the current room. The conversation scrolls to the bottom after submission and again after the reply and follow-up row have changed the layout. Queued scrolling checks room and message IDs, so it never scrolls another room. Suggestions hide for a pending/error reply, an empty room, or any typed draft; clearing the draft shows them again. The row scrolls horizontally on narrow screens. Short mobile viewports use a compact input row to leave more room for the conversation.

## Input contract

- Exactly two signed or unsigned base-10 integers and exactly one ASCII comma.
- ASCII spaces, tabs, CR and LF are allowed around the integer tokens and comma, never inside a sign/digit token.
- Each integer may contain at most **1,024 digits**, counting leading zeros but excluding the sign. The whole message may contain at most **2,112 UTF-16 code units**, including whitespace and signs. These limits are checked before BigInt conversion; raw length is checked before parsing.
- Fractions, scientific notation, hex, thousands separators, fullwidth digits/commas, Unicode minus signs and arbitrary prose are rejected with a chat response. Invalid input is never interpreted as HTML.
- All arithmetic uses BigInt: integers above `Number.MAX_SAFE_INTEGER` remain exact. The Euclidean algorithm takes absolute values, returns a nonnegative result and uses the explicit convention `gcd(0, 0) = 0`. The UI explains that the zero pair has no greatest positive common divisor.
- This is an ordinary variable-time algorithm for an educational toy, not a constant-time cryptographic implementation.

Long input echoes are visibly shortened to 240 characters, but the complete input is parsed and the complete GCD result is displayed and copied. Long equations are available under **View the full calculation**.

## Chats for this visit

The former **Under the hood** area now holds **Your chats**. **New chat** opens an independent conversation; it keeps the other rooms, their drafts, and their scroll positions. Room titles come from their first message. Click a room to return to it, or its × button to delete it. On mobile, open the **Chats** picker below the header. A pending reply stays with its originating room; deleting that room cancels its pending timer.

All rooms exist only in JavaScript memory for this page load. No login, backend, cookies, localStorage, sessionStorage, or database is used. Refreshing or closing the page clears the visit's chats; separate tabs have independent visits.

Click **Guest** at the bottom of the sidebar (or **G** in the mobile header) for **Articles & links**. **Popular science** currently shows **No articles yet** and is inactive; **Author's homepage** returns to the personal website. The menu closes on an outside click, focus moving to another page control, Escape, scrolling, or resizing. Escape returns focus to the Guest button. A blur with no next focus target leaves the menu open, allowing Safari's native link activation to complete.

At most **20 rooms** are retained, each with its latest **40 exchanges**. At the room limit, delete a room before creating another; existing rooms are never silently discarded. An unused empty room is reused. Inactive rooms keep bounded data records rather than DOM subtrees; only the current room's messages are rendered, and completed GCDs are cached rather than recalculated on switches. Saved drafts are limited to **2,112 characters**. If an active draft exceeds that size, send it to see the input error or shorten it before switching rooms; it is never silently truncated.

## Rebuild and test

`app.ts`, `gcd.ts`, `session.ts`, and `followups.ts` are the source of truth. The adjacent `.js` files are compiler output: rebuild them whenever TypeScript changes, and include both source and output in the same change.

With Node.js 20+ and an existing TypeScript compiler available:

```sh
tsc -p chatgcd/tsconfig.json
node --test chatgcd/gcd.test.mjs chatgcd/session.test.mjs chatgcd/followups.test.mjs
```

Alternatively, from this directory, `npm run build` and `npm test` use the same commands. `package.json` pins the development compiler version; it is not a runtime dependency. No package installation is required to deploy or use the checked-in site.

The tests run against the **compiled JavaScript** and cover signs, zeros, exact integers beyond Number precision, strict format rejection, both length boundaries, a small independent divisor oracle, large consecutive Fibonacci inputs, room/draft isolation, selection/deletion, title bounds, room/exchange limits, and seeded follow-up generation with bound, diversity, coprimality and full-precision checks. For browser QA, check examples, Enter/Shift+Enter/IME, invalid input, copying, room switching/deletion, refresh clearing, long results and narrow screens. The homepage's original stylesheet is unchanged; ChatGCD's styles are isolated to this directory.

## First-version verification (2026-10-20)

- Strict ES2020 compilation passed using the existing local TypeScript 6.0.3 compiler; no tools were downloaded.
- All 10 Node tests passed against `gcd.js` (Node 23.11.0), including 2,601 signed small-integer pairs and consecutive Fibonacci inputs near the 1,024-digit limit.
- Browser checks passed for all three example cards, exact large inputs, signs/zeros, malformed and oversized inputs, Enter/Shift+Enter, copying, reset, refresh clearing, and the homepage round trip.
- Narrow portrait and short landscape views were inspected. A 1,024-digit result and its expanded equation stayed within the viewport, and 42 submissions retained exactly the latest 40 exchanges.
- Existing solution artifacts passed their local snapshot verification. These checks cover the local implementation; no live deployment is claimed.
- Thinking update: checked immediate `thinking....` feedback, randomized replies, blocked duplicate submissions, draft preservation, error replies, cancellation on reset, and the mobile thinking layout. Reduced-motion preferences disable the pulse animation.
- Visit-history update: all 19 compiled-JavaScript tests passed. Browser checks covered independent histories and drafts, blocked oversized drafts without data loss, room deletion, the 20-room cap, the 40-exchange active DOM cap, refresh clearing, and the mobile picker at narrow portrait widths. No browser console errors were reported.
- Guest-menu update: strict compilation and browser checks passed for desktop/mobile placement, inactive article state, homepage navigation, Enter/Space activation, Escape focus restoration, outside clicks, Tab departure, repeat-click toggling, resize dismissal, and draft preservation. The menu fits narrow portrait and short landscape viewports; no console errors were reported.
- Follow-up update: strict compilation and browser checks passed for all three suggestion actions, room-specific context, draft hiding/restoration, empty/error states, exact 1,024-digit inputs, horizontal keyboard access at 320px, and compact short-landscape layout.
- Random-follow-up and scrolling fix: all 24 compiled-JavaScript tests passed, including seeded diversity/bounds and constant-RNG endpoint checks. Seven consecutive browser follow-ups produced seven different input pairs and varied GCDs, with the chat at the bottom after every reply. Random reuse/coprime examples and bottom scrolling at 320px portrait and short landscape sizes also passed; no console errors were reported.
- Follow-up clarity update: all 25 compiled-JavaScript tests passed. Browser checks confirmed that the displayed pair matches the next submitted input, answer reuse disappears for 1 and remains for 0, and a 1,024-digit answer preview does not widen the page at 320px. Both portrait and short landscape layouts retained a scrollable chat area and stayed at the latest reply.
- Random-welcome update: strict compilation and the existing 25 tests passed. Browser reloads displayed all four matched heading/description variants, while opening a new chat kept the current variant. All four headings fit two lines at 320px with no page overflow; no browser console errors were reported.
- Safari-menu update: removed synchronous dismissal on ambiguous focusout events. Strict compilation and all 25 tests passed. Desktop/mobile homepage navigation, Shift+Tab dismissal, Escape focus restoration, and outside-click dismissal passed browser checks. Native Safari accessibility link activation also returned to the homepage; the reported physical-mouse failure was not reproduced directly.
