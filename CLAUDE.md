# Mi Selección Colombia — Project Guide

## Structure
```
colombia_app/
  backend/   Laravel API (PHP)
  frontend/  Next.js app (TypeScript)
  docs/      Implementation plans
```

---

# Product Context

## What is this app?
**Mi Selección Colombia** is a fan engagement web app built around the Colombian national football team's participation in the **FIFA World Cup 2026** (USA/Canada/Mexico), coached by **Néstor Lorenzo**.

The app lets any fan do two things:
1. **Pick their 23** — select 23 players from the official pre-list (36 candidates) to form their ideal squad
2. **Set their 11** — arrange their best starting XI on a tactical pitch using one of 5 available formations

## Main objective
Generate **fan engagement and virality** in the months leading up to the World Cup. Every user builds an opinion (their squad), sees how it compares with the community, and can share or debate it. The core loop is: *pick → compare → share → debate → repeat*.

The app is not a prediction tool — it's a **fan expression platform**. There is no right answer; the value is in the debate.

## Who is it for?
Colombian football fans of all levels — from casual supporters who want to join the conversation to tactical enthusiasts who want to justify every roster decision. The experience is fast (under 5 minutes to complete a full selection) and shareable.

## User flow
```
/ (Landing)
  └─ /seleccion    Pick 23 players from the pre-list
       └─ /once    Place your best 11 on a tactical formation
            └─ /resultado   See your squad + community comparison stats
                  └─ /duelo/[token]   Compare side-by-side with a friend's squad (duel mode)
```

## Key features (implemented)
| Feature | Description |
|---|---|
| Squad builder | Pick 23 from 36 pre-listed players with position filters and player search |
| Tactical formation | Drag players onto a pitch in 5 formations (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2) |
| Community stats | "Los más elegidos" — bar chart showing which players the whole community picks most |
| Community match % | Circular gauge showing how much your 23 overlaps with the community consensus |
| Countdown widget | Live countdown to the World Cup 2026 opening match |
| Auth system | Optional login (email + Google OAuth) — selections work without login too |
| Admin panel | CRUD for players, clubs, confederations, federations |

## Key features (planned — see docs/superpowers/plans/)
| Feature | Plan file |
|---|---|
| Player detail modal (bottom sheet with stats) | `2026-05-22-viral-features.md` Task 1 |
| Share lineup as image (Web Share API / download) | `2026-05-22-viral-features.md` Task 2 |
| Formation popularity bar chart | `2026-05-22-viral-features.md` Tasks 3–4 |
| DT comparison gauge (vs. official Néstor Lorenzo squad) | `2026-05-22-viral-features.md` Tasks 5–6 |
| Duel mode (shareable link, side-by-side comparison) | `2026-05-22-viral-features.md` Tasks 7–9 |

## Design intent
The app looks and feels like a premium sports product — dark background, Colombia tricolor as identity, fast animations, mobile-first. It should feel as good as a top European club's official app, not like a generic form. Every design decision should reinforce that this is **Colombia's tournament**.

## Technical context
- Selections are stored per `session_id` (anonymous) or per `user_id` (logged in)
- The stats endpoint (`GET /api/selections/stats`) aggregates all saves — this is the community data
- Players are identified by a `slug` in public routes and by `id` in internal logic
- The frontend stores selection state in Zustand (`selectionStore`) and persists to the API on the `/resultado` page

---

# Brand — Mi Selección Colombia

## Logo — "El Escudo Táctico"
Inverted-pentagon badge split into Colombia's tricolor (yellow / blue / red, ratio 2:1:1). A white checkmark (✓) crosses all three bands — the "selection" metaphor. A hexagon in the yellow band references a football panel.

**Logo files live in `frontend/`** — see `frontend/AGENTS.md` for the full logo spec and file list.

## Color palette
| Token | Hex | Role |
|---|---|---|
| Yellow | `#FCD116` | Primary — CTAs, brand accent |
| Blue | `#003087` | Colombia blue |
| Red | `#CE1126` | Colombia red |
| Background | `#07090E` | Near-black canvas |

## Typography (frontend only)
- **Bebas Neue** — headlines, big numbers (`font-display`)
- **Barlow Condensed** — labels, badges
- **Plus Jakarta Sans** — body text

## Design principles
- Dark-first UI
- Yellow dominates the color hierarchy; blue and red are accents
- All user-facing strings in Spanish
- `framer-motion` for all animations

---

# Code conventions

## Language rule
All code, variable names, comments, and filenames must be in **English**.
Only user-facing UI strings (labels, copy, placeholders) may be in Spanish.

## Backend (Laravel)
- API routes in `backend/routes/api.php`
- Auth via Laravel Sanctum
- Admin routes protected by `auth:sanctum` + `admin` middleware
- Player slugs are the canonical identifier for public player routes

## Frontend (Next.js)
See `frontend/AGENTS.md` for Next.js-specific rules (breaking-change warning).
- State management: Zustand (`src/stores/`)
- API calls: `src/lib/api.ts`
- UI components: `src/components/ui/`
- Layout components: `src/components/layout/`
