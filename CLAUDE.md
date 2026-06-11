# Spotify Concerts Feature

## Build Status (as of 2026-06-11)

**Prototype**: Complete. `index.html` — English, phone frame (390×844px), 5 screens (home, concerts list, Remi Wolf detail, Phoebe Bridgers detail, Rock am Ring festival detail), slide transitions, animated concerts row, iOS permission sheet, real radius filtering (50/100/150/200/300 km), sold-out toggle, empty state with nudge.

**Case study**: `/home/alicia/thisisalicia/spotify.html` — published to portfolio. Embedded iframe of prototype. Added as first card on `work.html`.

**Tests**: 20/20 Playwright tests passing (`tests/mockup.spec.js`).

**Screenshot**: `/home/alicia/thisisalicia/gallery/spotify-screenshot.png` — concerts list screen, used on work.html card.

---

## Context & Core Problem

Spotify treats concerts as a monetization add-on rather than a natural extension of the listening relationship. The data to make it feel personal is all there — it's mostly a product prioritization gap. The core user pain: having to manually check each artist page to see if they're touring nearby.

---

## Product Decisions (MVP)

### UI Placement
Horizontal scroll row on the Home screen, positioned below "Für dich" / personalized content sections. The row only renders when there is at least one concert match within the user's radius. It does **not** live as a top-level tab — that pattern is reserved for content-type filters (Musik, Podcasts), not discovery destinations.

### Concert Card (Home Row)
Each card shows: artist image, artist name, venue name, date. Price and distance are saved for the detail page — not enough card space and price requires a per-card API call that slows rendering.

### Ranking Signal
Total listening time over the last **12 months**. Raw play count is too noisy (one obsessive week skews it). 12 months balances recency with stability. Listening rank is used as a **tiebreaker within time groups** on the full page — date proximity is the primary sort there.

### Location & Radius
- Auto-detected from Spotify's existing location data
- Default radius: **150 km**
- User-adjustable (e.g. 50 / 100 / 150 / 200 km presets)
- No hard country border cutoff — the radius handles clustering naturally and avoids penalising border-region users (e.g. Aachen → Amsterdam)

### Radius Exception Rule
If an artist is in the user's **top 5 by listening time** AND has **≤3 European dates**, show the concert regardless of radius. Display a label: **"Einzige Europa-Show"**. This handles the "I'd travel for this" case (e.g. a one-stop European tour). The label does the persuasion work — don't silently expand radius.

### Festivals
One card per festival. Show the festival name, top 3 matching artists, and "X weitere". Rank the festival card by the **combined listening time** of all matching artists. Showing the festival once per matching artist would create noise and bury single-artist shows.

### Sold-Out Shows
Show with a greyed/muted treatment and an **"Ausverkauft"** badge. Tapping through surfaces a resale link (Ticketmaster resale / StubHub) rather than dead-ending. If total results > 10, show an **"Ausverkaufte ausblenden"** toggle at the top of the full page.

### Full Concerts Page ("Alle anzeigen")
- Primary sort: **date ascending** (closest first)
- Grouped by time proximity: **"Diese Woche" / "Nächster Monat" / "In den nächsten 6 Monaten"**
- Listening time is the tiebreaker within each group
- Sold-out toggle visible when results > 10

### Detail Page
Content before the Ticketmaster redirect:
- Artist header image
- Date + time
- Venue name + city + distance
- Support acts (if available)
- Map embed / placeholder
- Ticket price
- "Tickets kaufen" CTA button

The detail page must earn the redirect — users should arrive at Ticketmaster already decided, not still figuring out whether they want to go.

### Ticket Purchase
Redirect to Ticketmaster or venue ticketing site. No in-app purchase for MVP — that requires a deep partnership/API integration. Acceptable for MVP as long as the detail page does the work first.

### Notifications
Opt-in. Prompted **the first time the concerts row appears** on the home screen — that's the highest-intent moment (user just experienced the value). Smart limits: max one notification per artist, never for dates more than 6 months out, never at night. Prompt copy: *"Benachrichtigt werden, wenn Konzerte ankündigt werden?"*

### Empty State
Row disappears silently. If matches exist just outside the user's current radius, show a **one-time nudge**: *"Keine Konzerte in deiner Nähe — Umkreis erweitern?"*

---

## Cut from MVP

| Feature | Reason |
|---|---|
| V3: Time range sorting toggle | 12-month window already handles recency vs. stability. Revisit if user research shows demand. |
| V4: Genre filter | Listening signal already implies genre preference. Only edge case: someone who streams a genre heavily but wouldn't see it live. Too niche for MVP. |
| Setlist preview playlist | Requires Setlist.fm API integration. Scope creep. |

---

## Tech Stack Notes (for prototype / future build)

- **Spotify Web API** — `/me/top/artists` with `time_range=medium_term` covers the ranking signal
- **Ticketmaster API** or **Bandsintown API** — needed for concert data (Spotify's concert data is not in their public API)
- Spotify has been restricting public API access since 2024 — verify current endpoint availability before building

---

## Known Gaps

### Post-show experience
Completely absent from MVP. No "you just saw X — here's what they played" setlist replay, no moment to deepen fandom while it's fresh. Potential V2 feature.

---

## Prototype & Publication Decisions

### Goal
Publish on personal website as a full case study, matching the format of the YNAB Amazon Enrichment case study. Target location: `/thisisalicia/spotify.html`, linked from `work.html`.

### Phone Frame
The prototype is wrapped in a phone frame (iPhone-style bezel, status bar, home indicator) built into `index.html` itself — not applied via CSS on the case study page. This ensures it looks correct standalone, in an iframe, and in screenshots.

### Animated Entry — Concerts Row
The prototype starts without the concerts row visible. The row animates in after a short delay, simulating the moment it first appears for a real user. This is the highest-intent product moment (the notification prompt triggers here) and the most important thing to make tangible in the prototype.

### Notification Flow
Tapping "Ja, benachrichtigen" in the Spotify prompt triggers a simulated iOS system permission sheet (bottom-anchored modal, Apple system font style, "Allow / Don't Allow" buttons, blurred backdrop). Two-step flow: Spotify earns intent, OS grants permission.

### Screen Transitions
All navigation uses CSS slide transitions (translateX, ~280ms ease-out): forward = slide in from right, back = slide out to right. No instant show/hide.

### Radius Filtering — Real, Not Cosmetic
Each concert row has a hardcoded distance value. The radius dropdown filters rows live. Distances are assigned so:
- 50 km = 0 results (triggers empty state)
- 100 km = a few results
- 150 km = full list (default)
Changing the radius also shows/hides the "Einzige Europa-Show" exception row, demonstrating the exception rule interactively.

### Empty State
When radius is set to 50 km and all concerts are filtered out:
- The concerts row on the home screen collapses/disappears
- A nudge appears: *"Keine Konzerte in deiner Nähe — Umkreis erweitern?"*
- Increasing the radius restores the row

### Festival Detail Page
Rock am Ring gets its own detail page (not a redirect to an artist page). Layout: festival header image, festival name, top matching artists with set times, "X weitere acts", venue, date, ticket CTA. Demonstrates the distinct design pattern for festival cards.

### Case Study Page Structure
Follows the YNAB case study structure exactly:
1. Problem
2. Solution
3. The Mockup (embedded iframe)
4. Key Decisions (replaces "Screen by Screen" — no static screenshots needed, prototype is self-navigable)
5. Technical Approach
6. What I'd Measure
7. What's Next

Language: English case study page, German prototype (Spotify DE locale — noted in the intro as a deliberate localisation decision).

---

## Build Plan (Next Session)

### Files to create / modify
- `index.html` — full rebuild with all items below
- `/thisisalicia/spotify.html` — new case study page
- `/thisisalicia/work.html` — add Spotify entry alongside YNAB

### Prototype changes (index.html)

**Phone frame**
Built into the HTML itself — 390×844px container, rounded corners (~55px), dynamic island, status bar (9:41, signal/wifi/battery icons), home indicator bar at bottom. Body gets a dark neutral background. All screens live inside the frame.

**Screen architecture**
Screens switch from `display:none/flex` (full-viewport) to `position:absolute; inset:0; overflow-y:auto` inside `.phone-content`. The `.bnav` is absolute-positioned at the bottom of the phone frame, shared across all screens. Remove per-screen `<div class="bnav">` duplication.

**Slide transitions**
Replace `go(id)` instant-switch with animated transitions:
- Forward (deeper): new screen slides in from right (`translateX(100%→0)`), current screen slides out to left (`translateX(0→-30%)` subtle parallax)
- Back: reverse — current slides to right, previous slides in from left
- Duration: 280ms, `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Back buttons call `go(id, true)` — second param signals back direction

**Animated concerts row entry**
- Home screen loads with concerts section hidden (`opacity:0; transform:translateY(16px)`)
- After 1500ms delay → concerts section animates to visible (400ms ease-out)
- After 2200ms → notification prompt fades in

**Notification → iOS permission sheet**
- "Ja, benachrichtigen" dismisses Spotify prompt AND shows iOS sheet overlay
- iOS sheet: centered alert, light-mode (white bg, dark text), system font (`-apple-system`), Spotify green app icon, German copy: *"Spotify" möchte dir Mitteilungen senden*, two buttons: "Nicht erlauben" / "Erlauben" (bold)
- Either button dismisses the sheet

**Radius filtering — real data**
Add `data-distance` attribute to every `.c-row` and home-screen `.c-card`. Exception rows get `data-exception="true"`.

Concert distances (user location: ~Düsseldorf/Ruhr area):
| Concert | Venue | Distance | Exception |
|---|---|---|---|
| Remi Wolf | Palladium, Köln | 75 km | no |
| Florence + The Machine | Lanxess Arena, Köln | 75 km | no (sold out) |
| Lorde | Lanxess Arena, Köln | 75 km | no |
| Rock am Ring | Nürburgring | 95 km | no (festival) |
| Mumford & Sons | Westfalenhalle, Dortmund | 125 km | no |
| Phoebe Bridgers | Tempodrom, Berlin | 570 km | **yes** (top 5 + ≤3 EU dates, shows at radius ≥150) |
| The National | Jahrhunderthalle, Frankfurt | 185 km | no (sold out) |
| Lana Del Rey | SAP Arena, Mannheim | 240 km | no |
| Maggie Rogers | Kulturpalast, Dresden | 320 km | no |

Radius → visible count:
- 50 km → 0 → empty state
- 100 km → 4 (Remi, Florence, Lorde, Rock am Ring)
- 150 km → 6 (+ Mumford, + Phoebe exception)
- 200 km → 7 (+ The National)
- 300 km → 9 (+ Lana, + Maggie)

`updateRadius(val)` filters `.c-row[data-distance]` and home-screen `.c-card[data-distance]`.
Exception items (`data-exception="true"`) only show when `val >= 150`.
When 0 results → show `#empty-state` nudge, hide `#concerts-section` on home.

**Empty state**
`#concerts-section` on home: hides + shows `#empty-state` nudge: *"Keine Konzerte in deiner Nähe — Umkreis erweitern?"* with a button that opens the concerts page to the radius dropdown.

**Festival detail page (new screen `s-detail-rar`)**
- Hero: Rock am Ring photo
- Title: "Rock am Ring", type tag: "Festival"
- Info grid: dates (7.–9. Aug 2026), venue (Nürburgring · 95 km)
- Matching artists block: Remi Wolf + Mumford & Sons (with photos) + "14 weitere Acts"
- Map placeholder
- Price + "Tickets kaufen" CTA
- Rock am Ring card on home AND row on concerts page both navigate here

### Case study page (/thisisalicia/spotify.html)
Structure (same as ynab.html):
1. **Hook** — hero title: "Your most-played artists are touring. Spotify doesn't tell you."
2. **Problem** — the manual-check pain, Spotify concert tab exists but isn't personalized
3. **Solution** — 3 design principles: listening signal as filter, radius as default not gate, earning the notification opt-in
4. **The Mockup** — iframe embed of `../spotifyConcertsFeature/index.html`
5. **Key Decisions** — 5 numbered decisions with title + rationale (replaces screen-by-screen):
   - 12 months not all-time
   - Row not tab
   - Notification prompt placement
   - The Europa-Show exception rule
   - Festival card as single entry
6. **Technical Approach** — Spotify Web API + Ticketmaster/Bandsintown API, 2024 API access restrictions noted
7. **What I'd Measure** — 4 metrics
8. **What's Next** — post-show experience, setlist replay

### work.html addition
New `.work-project-card` entry for Spotify, same markup pattern as YNAB entry. Needs a screenshot — generate with Playwright after prototype is built.

### Screenshots (Playwright)
After prototype rebuild, use Playwright to capture:
- Home screen (with concerts row visible)
- Concerts list page
- Festival detail page
- Remi Wolf detail page
Use as: `gallery/spotify-screenshot.png` for work.html card, optionally more for case study.
