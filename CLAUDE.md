# Spotify Concerts Feature

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
