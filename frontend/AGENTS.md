<!-- BEGIN:product-context -->
# Product Context — Mi Selección Colombia

## What this app is
A fan engagement web app for the **FIFA World Cup 2026**. Fans pick their ideal 23-player Colombia squad from the official pre-list, then arrange their best 11 on a tactical pitch. The purpose is community debate and virality, not prediction.

## Main objective
Get fans to build an opinion (their squad), compare it with the community and with friends, then share and debate. Core loop: **pick → compare → share → debate**. Every feature should serve this loop.

## User flow
```
/ → /seleccion (pick 23) → /once (place 11 on formation) → /resultado (community comparison)
                                                                  └─ /duelo/[token] (friend duel)
```

## Pages and their purpose
| Route | Component | Purpose |
|---|---|---|
| `/` | `LandingPage.tsx` | Brand entry point, explains the product, drives to /seleccion |
| `/seleccion` | `SelectionClient.tsx` | Pick 23 from 36 pre-listed players |
| `/once` | `LineupClient.tsx` | Place 11 on a tactical field with formation selector |
| `/resultado` | `ResultClient.tsx` | Show squad + community stats + match % gauge + save CTA |
| `/duelo/[token]` | `DuelClient.tsx` | Side-by-side comparison with a friend's shared squad |

## State management
- `selectionStore` (Zustand) — holds `selectedPlayers` (23 ids), `placedMap` (slot→id), `formation`
- Selections persist to the API when the user clicks "Guardar" on `/resultado`
- Anonymous use works via `session_id` stored in `localStorage`; auth is optional

## Planned features (not yet built — see `docs/superpowers/plans/2026-05-22-viral-features.md`)
- Player detail modal (bottom-sheet on player card tap)
- Share lineup as PNG image (Web Share API / download)
- Formation popularity bar chart on `/resultado`
- DT comparison gauge (compare your squad vs. official Néstor Lorenzo selection)
- Duel mode: shareable `/duelo/[token]` link for friend vs. friend comparison

## Key constraint
The app works without login. Auth adds a user_id to the saved selection but is never required. Never put auth-gated UI in front of the core selection flow.
<!-- END:product-context -->

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:branding -->
# Brand — Mi Selección Colombia

## What this app is
A fan web app where users pick their ideal 23-player Colombia national football squad from the official pre-list, then place their best 11 on a tactical formation. Context: FIFA World Cup 2026, head coach Néstor Lorenzo.

## Logo — "El Escudo Táctico"
- **Mark**: Inverted-pentagon badge with rounded top corners, divided into Colombia's tricolor bands (ratio 2:1:1 — yellow / blue / red)
- **Symbol inside**: A white checkmark (✓) spanning all three bands — represents the "selection/pick" mechanic of the app
- **Detail**: A hexagon outline in the yellow band references a football panel
- **Wordmark**: "Mi Selección" (small caps, wide tracking, white/muted) + "COLOMBIA" (Bebas Neue, `#FCD116`)

### Logo files
| File | Use |
|---|---|
| `src/components/ui/Logo.tsx` | React component — props: `size` (number) and `withWordmark` (boolean) |
| `public/logo.svg` | Static SVG for OG images, emails, external use |
| `src/app/icon.svg` | Browser tab favicon (auto-detected by Next.js) |
| `src/app/apple-icon.svg` | iOS/macOS homescreen icon (auto-detected by Next.js) |

Always use `<Logo />` component in React code. Never hardcode the SVG inline.

## Color palette
| Token | Hex | Role |
|---|---|---|
| `--yellow` | `#FCD116` | Primary accent — CTAs, highlights, wordmark |
| `--blue` | `#003087` | Colombia blue — secondary accent |
| `--red` | `#CE1126` | Colombia red — tertiary accent |
| `--muted` | (see globals.css) | Secondary text |
| `--border` | (see globals.css) | Subtle borders |
| `--border2` | (see globals.css) | Slightly more visible borders |
| Background | `#07090E` / `#080A0F` | Near-black, not pure black |

Never use pure `#000000` or `#ffffff` as fill colors. Always reference CSS variables.

## Typography
| Variable | Font | Use |
|---|---|---|
| `--font-bebas` (`.font-display`) | Bebas Neue | Headlines, wordmark, big numbers |
| `--font-barlow` | Barlow Condensed | UI labels, badges, ALL CAPS text |
| `--font-jakarta` | Plus Jakarta Sans | Body text, paragraphs |

## Design principles
- **Dark-first**: all UI is designed for dark backgrounds (`#07090E`)
- **Tricolor is identity**: yellow dominates (primary), blue and red are accents — never reverse this hierarchy
- **Motion**: use `framer-motion` for all animations; prefer spring easings (`[0.34,1.56,0.64,1]`) for brand moments, `[0.32,0.72,0,1]` for UI transitions
- **Sparing color**: yellow should feel earned — don't paint everything yellow
- **No gradients inside the badge**: flat color zones only in the logo mark
- **Rounded pill shapes** for buttons and nav items (`rounded-full`)

## Voice & copy
- Spanish for all user-facing strings
- Energetic but not over-the-top; football-knowledgeable tone
- Short, punchy CTAs: "Armar mi selección", "Ver estadísticas"
- World Cup context always present: "Mundial 2026 · Néstor Lorenzo"
<!-- END:branding -->
