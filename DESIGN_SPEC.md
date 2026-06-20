# PERX — Claude Design Spec

> **Single source of truth.** Every component, color, radius, and motion curve in PERX is defined here. If a value isn't in this file, it doesn't ship. Built dark-first, mobile-first, for a loud and shareable 48h demo.

**Product:** Two-sided employee benefits marketplace for Albania.
**Personality:** Premium fintech meets warm concierge. Calm, confident, expensive-looking — never corporate-cold.
**North star:** A judge glancing at a phone for 8 seconds should think *"this is a real product, and it's beautiful."*

---

## 1. Brand Concept — "Quiet Premium, Albanian Warmth"

Albanian identity **without** the cliché of slapping flag-red on everything. We pull from:
- **The stone & dusk of the Albanian Alps** → the neutral base (deep slate, near-black, cool greys).
- **Ember / terracotta red** → a sophisticated, slightly desaturated descendant of flag red. It signals heritage without screaming it.
- **Aged gold / bronze** → the double-headed eagle, rendered as a premium metallic accent, not a logo crutch.

The result reads as *Tirana at dusk*: dark, warm light sources, gold and ember glows on stone.

---

## 2. Color Palette (dark-first)

All tokens are CSS variables (`:root` is the dark default; `.light` overrides exist but dark is the hero).

### Core surfaces
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0B0D12` | App background (near-black, cool) |
| `--bg-elevated` | `#12151C` | Cards, sheets |
| `--bg-elevated-2` | `#181C25` | Nested cards, inputs, hover |
| `--bg-overlay` | `#0B0D12CC` | Modal scrim (80%) |
| `--surface-line` | `#242A36` | Hairline borders, dividers |
| `--surface-line-soft` | `#1B2029` | Subtle internal separators |

### Text
| Token | Hex | Use |
|---|---|---|
| `--text` | `#F4F6FB` | Primary text |
| `--text-muted` | `#A4ADBE` | Secondary / labels |
| `--text-faint` | `#6B7383` | Tertiary / captions, placeholders |
| `--text-on-accent` | `#0B0D12` | Text on ember/gold fills |

### Brand — Ember (primary)
| Token | Hex | Use |
|---|---|---|
| `--ember-50` | `#FFF1EC` | (light mode tints) |
| `--ember-400` | `#FF7A5C` | Hover / glow highlight |
| `--ember` | `#F4593B` | **Primary action, brand** |
| `--ember-600` | `#D8421F` | Pressed |
| `--ember-glow` | `#F4593B66` | Shadows, focus rings, particle light |

### Brand — Gold (secondary / reward)
| Token | Hex | Use |
|---|---|---|
| `--gold-400` | `#F2C879` | Highlights, eagle accents |
| `--gold` | `#E0A938` | Rewards, streaks, premium badges, game wins |
| `--gold-600` | `#B9842A` | Pressed gold |

### Category accents (used in pins, chips, charts)
| Category | Token | Hex |
|---|---|---|
| Wellness | `--cat-wellness` | `#34D399` (emerald) |
| Food | `--cat-food` | `#F59E0B` (amber) |
| Sport | `--cat-sport` | `#3B82F6` (blue) |
| Travel | `--cat-travel` | `#A78BFA` (violet) |
| Learning | `--cat-learning` | `#22D3EE` (cyan) |
| Self-care | `--cat-selfcare` | `#F472B6` (pink) |
| Health | `--cat-health` | `#2DD4BF` (teal) |

### Semantic
| Token | Hex |
|---|---|
| `--success` | `#34D399` |
| `--warning` | `#F2C879` |
| `--danger` | `#F4593B` |
| `--info` | `#60A5FA` |

### Signature gradients
- `--grad-ember`: `linear-gradient(135deg, #FF7A5C 0%, #F4593B 50%, #D8421F 100%)` — primary CTAs, hero.
- `--grad-dusk`: `linear-gradient(160deg, #181C25 0%, #0B0D12 100%)` — card / page backdrops.
- `--grad-gold`: `linear-gradient(135deg, #F2C879 0%, #E0A938 100%)` — reward surfaces, game wins.
- `--grad-aurora`: `radial-gradient(120% 120% at 0% 0%, #F4593B33, transparent 50%), radial-gradient(120% 120% at 100% 0%, #A78BFA22, transparent 50%)` — hero / Deals Engine ambient glow.

---

## 3. Typography

**Display / headings:** `"Clash Display"` or fallback `"Space Grotesk"` — geometric, confident, a little editorial.
**Body / UI:** `"Inter"` — workhorse, excellent at small sizes, full Albanian diacritics (ë, ç).
**Numeric / data:** `"Inter"` with `font-variant-numeric: tabular-nums` for all ALL amounts, budgets, charts.

Load via Fontsource/Google. If Clash unavailable, Space Grotesk is the shipped default.

### Scale (mobile → desktop, fluid via clamp)
| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `display` | `clamp(2.5rem, 8vw, 4.5rem)` | 1.02 | 600 | Landing hero headline |
| `h1` | `clamp(1.75rem, 5vw, 2.5rem)` | 1.1 | 600 | Page titles |
| `h2` | `1.5rem` | 1.15 | 600 | Section headers |
| `h3` | `1.125rem` | 1.25 | 600 | Card titles |
| `body` | `1rem` | 1.5 | 400 | Default |
| `body-sm` | `0.875rem` | 1.45 | 400 | Secondary |
| `label` | `0.75rem` | 1.3 | 500 | Labels, chips — `letter-spacing: 0.04em`, often `UPPERCASE` |
| `caption` | `0.6875rem` | 1.3 | 500 | Badges, countdowns |
| `data-lg` | `clamp(2rem, 6vw, 3rem)` | 1 | 600 | KPI numbers, budget meter — tabular |

Headings use `letter-spacing: -0.02em`. Never go below 11px for any text.

---

## 4. Spacing, Radius, Elevation

**Spacing** — 4px base scale: `4 8 12 16 20 24 32 40 48 64`. Tailwind default scale is kept; section gaps use `24`/`32`.

**Radius**
| Token | px | Use |
|---|---|---|
| `--r-sm` | 10 | chips, badges, inputs |
| `--r-md` | 16 | buttons, small cards |
| `--r-lg` | 22 | cards, sheets |
| `--r-xl` | 28 | hero cards, modals |
| `--r-full` | 999 | pills, avatars, FAB |

**Elevation** (shadows are soft, colored-black, never harsh)
- `--e-1`: `0 1px 2px #00000040` — resting chips.
- `--e-2`: `0 4px 16px #00000055` — cards.
- `--e-3`: `0 12px 40px #00000066` — sheets, popovers.
- `--e-glow`: `0 8px 32px var(--ember-glow)` — primary CTA, active states.
- `--e-gold`: `0 8px 32px #E0A93840` — reward surfaces.

Borders do real work in dark UI: most cards are `1px solid var(--surface-line)` + `--e-2`. Glass cards add `backdrop-filter: blur(20px)` over `--bg-elevated` at 70% opacity.

---

## 5. Component Tokens

### Buttons (min touch target 44×44)
| Variant | Fill | Text | Border | Hover | Active |
|---|---|---|---|---|---|
| **Primary** | `--grad-ember` | `--text-on-accent` | none | brightness 1.08 + `--e-glow` | scale .97, `--ember-600` |
| **Secondary** | `--bg-elevated-2` | `--text` | `1px --surface-line` | `--surface-line` border + bg lift | scale .97 |
| **Ghost** | transparent | `--text-muted` | none | `--bg-elevated-2`, text→`--text` | scale .97 |
| **Gold** | `--grad-gold` | `#1A1206` | none | brightness 1.06 + `--e-gold` | scale .97 |
| **Danger** | transparent | `--danger` | `1px --danger40` | `--danger12` bg | scale .97 |

Height: `44px` (md), `52px` (lg/primary CTA). Radius `--r-md`. Weight 500. Every button has **hover AND active** + `:focus-visible` ring `0 0 0 3px var(--ember-glow)`. Loading state = inline spinner + label dimmed, never layout shift.

### Cards
- Base: `--bg-elevated`, `1px --surface-line`, `--r-lg`, `--e-2`, padding `20`.
- **Offer card:** provider logo chip (40px, `--r-md`), title (`h3`), category tag, price `data` row (tabular, ember), `Add to cart` ghost→primary on hover. Whole card lifts `translateY(-2px)` + `--e-3` on hover (desktop only).
- **Glass card** (hero, Deals Engine panels): blurred translucent + `--grad-aurora` underlay.
- **KPI card:** `data-lg` number, label below in `--text-faint`, small trend delta chip (green/red), optional sparkline.

### Badges / Chips
- **Category chip:** `--r-full`, `caption`, dot in `--cat-*` color + label, bg `--cat-*` at 14% over elevated.
- **Countdown badge:** ember/gold gradient pill, pulsing dot, mono digits — "limited-time" feel.
- **Reward badge:** gold gradient, subtle shimmer sweep (game wins, streaks, "top player").
- **Status chip:** Pending (`--warning`), Approved (`--success`), Rejected (`--danger`) — soft-fill + matching text.

### Inputs
`--bg-elevated-2`, `1px --surface-line`, `--r-sm`, `48px` height, placeholder `--text-faint`. Focus: border `--ember` + ring `--ember-glow`. Labels above in `label` token.

### Sidebar (desktop ≥768px)
- Width `260px`, `--grad-dusk`, right hairline `--surface-line`.
- Top: avatar (`--r-full`, gold ring if streak active) + name + company + **budget pill** (ember-tinted, tabular ALL).
- Nav items: 44px rows, icon + label, active = ember left-accent bar (3px) + `--bg-elevated-2` + ember text. Hover = bg lift.

### Bottom tab bar (mobile <768px)
- Fixed, `--bg-elevated` + top hairline + `backdrop-blur`, safe-area inset padding.
- 5 tabs, 56px tall, icon + `caption` label. Active = ember icon + tiny dot; inactive = `--text-faint`.
- Center tab (Perky AI) can be a raised ember FAB to anchor the brain of the app.

### Perky AI chat
- Mobile: **fullscreen**. Bot bubbles left (`--bg-elevated-2`, `--r-lg` with one squared corner), user bubbles right (`--grad-ember`, on-accent text).
- Perky avatar: animated gradient orb (ember→gold) with a soft breathing pulse; "typing" = three ember dots.
- Suggested-prompt chips scroll horizontally above the input. Catalog items referenced render as inline mini offer-cards.

### Charts (recharts)
Grid lines `--surface-line-soft`, axis text `--text-faint`, tooltips = glass card. Series use category accents; primary series = ember. Donuts/rings animate sweep on mount.

---

## 6. Motion Principles (Framer Motion)

**Feel:** *confident and calm.* Things glide, settle, never bounce cartoonishly (except deliberate game/reward moments).

- **Duration:** 200–400ms. Micro (hover/tap) 120–180ms. Page/route 320ms.
- **Easing:** default `ease-out` cubic `[0.22, 1, 0.36, 1]` (expo-out). Springs only for games/reward pops (`stiffness 260, damping 20`).
- **Page transitions:** fade + 12px upward slide, staggered children `0.04s`.
- **Lists/grids:** stagger in on mount (offer cards, KPI cards, pins).
- **Tap:** `whileTap={{ scale: 0.97 }}` on every interactive surface.
- **Loading:** every async op fakes ≥600ms — show skeleton shimmer (gradient sweep over `--bg-elevated-2`) or inline spinner. Never a raw spinner on a blank screen.
- **Reward moments** (scratch reveal, spin win, approval confirmed): gold shimmer + confetti burst + spring scale. These are the "loud, shareable" beats — lean in.
- **Respect** `prefers-reduced-motion`: drop transforms to opacity-only.

---

## 7. Mobile-first Breakpoints

| Name | Width | Layout shift |
|---|---|---|
| base | `<480px` | single column, bottom tabs, full-bleed cards, carousels for strips |
| `sm` | `≥480px` | wider gutters, 2-col offer grid |
| `md` | `≥768px` | **sidebar replaces bottom tabs**, 2–3 col grids, admin tables appear |
| `lg` | `≥1024px` | 3–4 col grids, Deals Engine two-panel side-by-side |
| `xl` | `≥1280px` | max content width `1200px`, centered |

Rules: touch targets ≥44px; no horizontal overflow except intentional carousels; Perky chat & games are thumb-reachable; admin map full-width on mobile; tables → card lists below `md`.

---

## 8. Three.js Hero Direction

- Slow-orbiting cluster of **glass benefit-cards** (rounded planes) each with an emissive category icon + label, drifting around a soft center light. Ember/gold point lights, dark fog, faint particle dust catching light.
- Bloom post-processing (subtle). Cards gently bob and rotate to face camera.
- **Performance:** cap `dpr` at `[1, 2]`; on mobile (`<768px` or low DPR) reduce cards 12→6 and particles by 60%, disable bloom if frame budget drops. Target 60fps mid-range phone. Pause render when tab hidden / scrolled past.

---

## 9. Iconography & Imagery

- **Icons:** `lucide-react`, 1.75px stroke, sized 20/24. Category icons map 1:1 to accent colors.
- **No grey placeholder boxes — ever.** Empty states get a small line-illustration (inline SVG) + one warm line of copy + a CTA. Provider "logos" = generated monogram chips (initial on category-tinted gradient) so nothing looks unfinished.
- **Avatars:** initials on a deterministic gradient seeded from the name; gold ring when a streak/achievement is active.

---

## 10. Tailwind / Token Wiring (implementation contract)

- All colors above become CSS variables in `:root` and are exposed to Tailwind via `theme.extend.colors` using `rgb(var(--x) / <alpha-value>)` pattern (store hex as channels or use `hsl`). Components reference semantic names (`bg-bg`, `text-muted`, `bg-ember`, `border-line`), never raw hex.
- Radius/shadow tokens → `theme.extend.borderRadius` / `boxShadow`.
- Fonts → `theme.extend.fontFamily` (`display`, `sans`, with tabular utility class `.tnum`).
- Motion constants live in `src/lib/motion.ts` (durations, easing, variants) so every component imports the same curves.
- A single `<DesignTokens>`-equivalent `index.css` `@layer base` holds the variables; light-mode `.light` overrides only the surface/text tokens, brand stays constant.

---

### Definition of done for the design layer
Tokens in `index.css`, Tailwind config wired, fonts loaded, `motion.ts` exporting shared variants, and a `/styleguide` route (dev-only) rendering every button, card, chip, input, and chart token so we can eyeball the system before screens are built.
