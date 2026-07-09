# MindFrame — Design System

> **Grounded Warmth.** Calm, literary, and deeply personal — the opposite of clinical. A
> journal entry is the most private thing a user will type into this app; the interface should
> feel like a quiet notebook, not a dashboard. No urgency, no gamification, no clinical chrome.

**Implemented in:** design tokens live in `mindframe/app/globals.css`; fonts are loaded in
`mindframe/app/layout.tsx`. This document is the spec — keep it and those files in sync.

---

## 1. Color

### Brand & mood families

Defined as hex values in the `@theme` block of `globals.css`. These are the literal sage/dusk/
stone palette — use them directly for brand accents and mood-coded UI (e.g. mood chips, entry
tags).

| Token | Value | Use |
|---|---|---|
| `brand-50` | `#f2f7f4` | Lightest sage wash — tinted backgrounds |
| `brand-100` | `#ddeae3` | Soft sage wash — badges, chips |
| `brand-200` | `#bbcfc5` | Mid sage — subtle borders, secondary fills |
| `brand-500` | `#5a8a6c` | Primary sage — primary actions, active states, accents |
| `brand-600` | `#047857` | Emerald variant |
| `brand-700` | `#3a6b50` | Pressed/hover state for `brand-500` elements |
| `brand-900` | `#1e3d2c` | Darkest sage — rarely used, high-contrast accents only |
| `dusk-400` | `#5b6a8a` | Dusty blue — "heavy" emotions, lightest |
| `dusk-500` | `#4f6d8c` | Dusty blue — "heavy" emotions (calm, never alarming; no red/yellow) |
| `dusk-600` | `#3d5a78` | Dusty blue — "heavy" emotions, pressed/dark |
| `stone-400` | `#a8a29e` | Warm stone — "steady" emotions, lightest |
| `stone-500` | `#78716c` | Warm stone — "steady" emotions (Tired, Restless, Uncertain, Calm) |
| `stone-600` | `#57534e` | Warm stone — "steady" emotions, pressed/dark |

The three families map to MindFrame's emotion model: `brand-*` = light/positive emotions,
`stone-*` = steady/mid emotions, `dusk-*` = heavy/low emotions. Never use red or yellow for
mood coding — even "heavy" emotions stay calm, desaturated blues, not alarm colors.

### Semantic tokens

Defined as OKLch custom properties in `:root` / `.dark` in `globals.css`, consumed via
Tailwind's `@theme inline` mapping (`bg-background`, `text-foreground`, `border-border`, etc.).
OKLch is used instead of hex here for perceptually-even contrast across light and dark mode.

| Token | Light | Use |
|---|---|---|
| `background` | `oklch(0.985 0.004 75)` | Warm near-white page base. Never raw `white`/`#fff`. |
| `foreground` | `oklch(0.18 0.012 75)` | Primary text color |
| `surface` | `#F5F3F0` | Warm parchment — elevated panels, sidebar, card backgrounds |
| `primary` | `oklch(0.555 0.075 152)` | Primary action fill (sage) |
| `primary-foreground` | `oklch(0.99 0.002 75)` | Warm near-white text *on* primary/colored fills — use this, never literal `text-white` |
| `muted-foreground` | `oklch(0.52 0.01 75)` | Secondary info, timestamps, labels — use liberally for breathing room |
| `accent` | `oklch(0.93 0.012 152)` | Subtle sage tint — hover states on nav items, highlighted rows |
| `border` | `oklch(0.895 0.008 75)` | Warm stone — all dividers and input outlines |
| `ring` | `oklch(0.555 0.075 152)` | Focus ring color |
| `destructive` | `oklch(0.577 0.245 27.325)` | Actual error states only. Never for emphasis. |

**Dark mode is implemented** (`.dark` class in `globals.css`, full OKLch overrides for every
token above, plus sidebar/chart variants). It currently uses a neutral near-black/near-white
scheme rather than a "warm" dark palette — if dark mode gets design attention, that's the seam
to revisit, not the token *names* (the mapping already exists and works).

---

## 2. Typography

- **`font-heading`** (Fraunces) — variable-axis old-style serif. Use for page titles, section
  headers, journal prompts, empty-state messages. Distinctive and warm.
- **`font-sans`** (DM Sans) — humanist geometric sans. Use for all body copy, UI labels,
  inputs, metadata.
- Large display: `text-4xl font-light tracking-tight font-heading` — editorial, not heavy.
- Section heads: `text-xl font-medium font-heading`.
- Never `font-bold` on Fraunces at large sizes — it kills the warmth.
- Never use Inter, Roboto, or system fonts (one sanctioned exception — see §7).

Both fonts are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables
(`--font-sans`, `--font-heading`), bound to `<html>`.

---

## 3. Shape & components

- Radius scale (`globals.css`, derived from a single `--radius: 0.75rem` base):
  `radius-sm` (×0.6), `radius-md` (×0.8), `radius-lg` (×1, the base), up through `radius-4xl`
  (×2.6) for large showcase surfaces. Minimum visible radius is `rounded-md` — no
  `rounded-none` or `rounded-sm` on visible surfaces.
- Component primitives come from **shadcn**, style `base-nova`, base color `neutral`, CSS
  variables enabled. Icons are **Lucide** exclusively — don't mix in another icon set.

---

## 4. Layout & spacing

- Spacing should feel intentional, not excessive — aim for `gap-6` between sections, `gap-4`
  within a section.
- Prefer `py-8` for page sections; `py-6` for compact/inner sections; `py-4` for tight UI
  groups.
- `space-y-6` between stacked content blocks; `space-y-3` within a card or panel.
- Journal entries are flowing **text experiences**, not card thumbnails — full width, readable
  type.
- Avoid uniform card grids (3 equal-width cards per row is the most predictable pattern —
  don't do it).
- Use asymmetric or variable-width layouts; mix `col-span` sizes in grids.
- Empty states: centered, Fraunces italic, moderate padding (`py-12`) — intentional but not
  cavernous.

---

## 5. Backgrounds

- Create atmosphere and depth — never default to a flat solid color on large surfaces.
- Layer subtle gradients over `bg-background` or `bg-surface`: e.g.
  `bg-gradient-to-b from-background to-brand-50/40` for a gentle sage wash at the bottom of a
  page.
- Use radial gradients behind hero sections or empty states:
  `bg-[radial-gradient(ellipse_at_top,_var(--color-brand-50)_0%,_transparent_70%)]`.
- Sidebar and panels: `bg-surface` with a faint inner border or very soft box shadow to lift
  them from the page.
- Avoid: flat `bg-white`, flat `bg-background` with no variation, aggressive gradients or dark
  overlays.

---

## 6. Motion

`tw-animate-css` is an active dependency (confirmed in use, not dead weight) — imported in
`globals.css` and used throughout for `animate-in`/`fade-in`/`slide-in-from-*` patterns.

- Use animations for effects and micro-interactions — but sparingly. One well-placed animation
  is better than ten scattered ones.
- Page/section entry: fade-in with staggered `animation-delay` on child elements (e.g. 0ms,
  75ms, 150ms).
- Hover states: `transition-colors duration-300` for color shifts; `transition-opacity
  duration-200` for reveal effects.
- Subtle scale on interactive cards: `hover:scale-[1.01] transition-transform duration-300` —
  never more than 1–2%.
- Loading skeletons: `animate-pulse` on `bg-muted` placeholders.
- Duration: 200ms–400ms for intentional actions; 150ms for hover feedback. Never instant (0ms)
  for visible state changes.
- No spring physics, no bounce easings, no scale > 1.02 on click, no full-screen transitions.

---

## 7. Exceptions

- **`components/auth/GoogleSignInButton.tsx`** is exempt from the no-white-background and
  no-system-font rules. Google's sign-in branding requirements call for a recognizable white
  face with a gray border, and the button loads Roboto specifically for that purpose — this is
  intentional and already explained in a code comment, not drift to "fix." Don't restyle it to
  match the rest of the app; third-party auth buttons are the one place brand recognition wins
  over house style.

---

## 8. Responsive

Breakpoint usage today is minimal — the app is effectively mobile-first/single-column almost
everywhere, with only a handful of `sm:`/`md:` variants and no real `lg:` desktop layouts. Some
of that fits the product (journaling is a personal, often-on-phone activity), but it hasn't
been a deliberate design decision so far — it's a gap, not a finished choice. Treat desktop
layout (sidebar behavior at wide viewports, multi-column dashboards, wider grids past `lg:`) as
open design territory rather than assuming the current mobile-first look is the intended
end state.

---

## 9. Don'ts

- No red badges, notification dots, or urgency indicators (creates anxiety).
- No gamification: streak flames, XP bars, level-up animations, leaderboards.
- No dense information panels — 2–3 key metrics max per section.
- No `rounded-none` or `rounded-sm` on visible surfaces — minimum `rounded-md`.
- No pure white backgrounds (`#fff`) — always use `bg-surface` or `bg-background`.
- No literal `text-white` — use the `primary-foreground` token (see §1) so contrast text stays
  on the warm palette instead of clinical pure white.
- No generic "3 icon cards in a row" stat layouts — find a more editorial arrangement.
