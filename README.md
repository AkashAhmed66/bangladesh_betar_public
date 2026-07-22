# Betar Tarango — Public Listening Portal

The Spotify-style public web app for the **Bangladesh Betar Audio Archive**. It consumes the
Laravel backend's Public Portal API (`bangladesh_betar`, `/api/v1`) and delivers streaming,
discovery, library, engagement and freemium subscription features for listeners and guests.

Built with **Next.js 16 (App Router, Turbopack)**, **React 19**, **Tailwind CSS v4**,
**zustand** (player/auth/UI state) and **SWR** (data fetching).

---

## Running

```bash
# 1. Backend (from ../bangladesh_betar) — API on port 8000
php artisan demo:audio        # one-time: synthesize demo media (streams + ad jingles)
php artisan serve --port=8000

# 2. Frontend — port 9000
npm install
npm run dev                   # http://localhost:9000
```

The API base URL is configured in [.env.local](.env.local):

```
NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

> The backend's `APP_URL` must match the host/port it is served from
> (`APP_URL=http://localhost:8000`) — signed streaming URLs depend on it.

---

## Central theme configuration

The entire look is driven from **two files** — change them and the whole app follows:

| File | What lives there |
|------|------------------|
| [`app/globals.css`](app/globals.css) | **All design tokens** in the `:root` block at the top: surface colors, text colors, brand accent, premium/danger hues, fonts, radii, layout dimensions (sidebar width, player height). The `@theme inline` block below it maps tokens to Tailwind utilities (`bg-elev`, `text-ink`, `bg-accent`, `rounded-card`, …). |
| [`config/theme.ts`](config/theme.ts) | Brand naming (`BRAND`) and the generative artwork palettes (`ARTWORK_GRADIENTS` / `ARTWORK_ACCENTS`) used to synthesise cover art for items without uploaded artwork. |

Examples: to re-brand to blue, edit `--accent` in `globals.css`; to rename the product,
edit `BRAND` in `config/theme.ts`; to change fonts, swap the `next/font` imports in
[`app/layout.tsx`](app/layout.tsx) (the CSS variables keep everything wired).

> Note: the page background color token is exposed as `page` (`bg-page` / `text-page`),
> not `base`, so Tailwind's `text-base` font-size utility keeps working.

---

## Architecture

```
app/                     Routes (App Router, client components + SWR)
  page.tsx               Home: banners, continue-listening, curated sections, for-you
  search/                Search with type-ahead suggestions + genre/category browse
  browse/                Trending, new releases, On This Day, editorial playlists
  songs|albums|artists|programmes|podcasts        Catalogue index pages
  .../[id]               Detail pages (song incl. lyrics, album tracks, artist page,
                         programme episodes, podcast chapters, episode stories)
  assets/[id]            Canonical recording page: waveform, rating, comments, similar
  playlists/[id]         Editorial/public/own playlists (owners edit, reorder, delete)
  library|favorites|history                       Signed-in library
  login|register         Email + phone-OTP auth (Sanctum tokens)
  premium|account        Plan comparison, simulated checkout, profile, payments
  support                Guest-friendly feedback + issue reports

stores/
  player.ts              The audio engine: queue, shuffle/repeat, signed-URL resolve,
                         ad pre-roll + impression logging, preview caps for premium
                         content, skip limits (free tier), play events + progress sync,
                         Media Session API, server queue persistence
  auth.ts                Token/session/entitlements (persisted, rehydrate-safe)
  ui.ts                  Locale (EN/বাংলা titles), modals, toasts, panels

lib/
  api.ts                 Fetch client with bearer token + ApiError normalisation
  hooks.ts               Typed SWR hooks for every API endpoint
  types.ts               API object shapes (mirrors Laravel resources)
  tracks.ts / play.ts    Catalogue objects → playable queue tracks
  artwork.ts             Deterministic generative cover art
components/              layout/ (shell), player/ (bar, now-playing, queue, waveform),
                         cards/, detail/, engagement/, library/, modals/, ui/
```

### Playback flow

1. `GET /assets/{id}/stream` resolves a **signed, expiring URL** respecting the listener's
   plan (free/guest get previews of premium content and a pre-roll ad).
2. If an ad is attached, its creative (`ad.audio_url`) plays first — unskippable, with a
   countdown — then the impression is logged (`POST /ads/impression`).
3. The main stream plays through one shared `HTMLAudioElement`; `play`, `pause`, `seek`,
   `progress` (10s), and `complete` events post to `POST /assets/{id}/events`, which also
   powers cross-device **Continue Listening**.
4. Preview-only streams stop at the preview boundary and prompt sign-in / upgrade.

### Guest vs member

Everything is browsable as a guest (FR-USR-11). Library writes (favourites, follows,
playlists, comments, ratings) open a sign-in prompt. Playback analytics for guests uses a
pseudonymous `anonymous_id`.
