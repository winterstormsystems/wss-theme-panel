# WSS design system (Panel v2)

Source of truth: `themes/wss/tokens.css`. Extension components read the same values through
`wss/extensions/wss/src/client/styles.css`. Contrast figures are WCAG 2.x ratios, measured with
the script used during the work (sRGB relative luminance).

## Canonical brand palette (unchanged)

| Token | Value | Use |
| --- | --- | --- |
| `--wss-brand-primary` | `#3498db` | Primary actions, links, active navigation, focus ring, CPU/memory graphs |
| `--wss-brand-primary-hover` | `#2980b9` | Reserved for WSS components; core hover is `bg-primary/90` (not a token) |
| `--wss-brand-secondary` | `#2c3e50` | Gradient start, chart 3 |
| `--wss-brand-accent` | `#1abc9c` | Secondary accent: network-download graph, ANSI cyan |
| `--wss-status-success` | `#2ecc71` | Online / healthy |
| `--wss-status-warning` | `#f39c12` | Installing / transitional / warning |
| `--wss-status-danger` | `#e74c3c` | Offline / error / destructive |
| `--wss-text-on-brand` | `#ffffff` | Text on the brand gradient |
| `--wss-gradient-brand` | `linear-gradient(to right, #2c3e50, #3498db)` | Dashboard accent rule |
| `--wss-gradient-brand-diagonal` | `linear-gradient(135deg, #2c3e50, #3498db)` | Login identity band |

The light-mode values from the public site (`#f8f9fa`, `#ffffff`, `#333`, `#666`, `#999`,
`#e0e0e0`) are not used: the panel forces dark mode. Core's light scaffold is left untouched.

## Derived dark neutrals

All share the hue of `#2c3e50` (about 210°), so the dark surfaces read as the same family as
the brand instead of a neutral grey or a second blue.

| Token | Value | Purpose | Contrast |
| --- | --- | --- | --- |
| `--wss-background-app` | `#0d141b` | Page, top bar, sidebar | text 15.69:1 |
| `--wss-surface-default` | `#121b24` | Cards and panels | text 14.71:1, muted 6.05:1, danger text 4.55:1 |
| `--wss-surface-elevated` | `#18232e` | Menus, popovers, selected nav, skeletons/tracks | muted 5.08:1 |
| `--wss-surface-hover` | `#1f2c39` | Hover on surfaces and grey buttons | muted 4.95:1 |
| `--wss-surface-selected` | 14% `#3498db` over surface | Selected rows (WSS components) | — |
| `--wss-surface-inset` | `#0a1016` | Console and editor wells | — |
| `--wss-border-default` | `#243240` | Hairlines between surfaces (decorative) | 1.33:1 |
| `--wss-border-strong` | `#56697d` | Input outlines | 3.07:1 on surface (WCAG 1.4.11) |
| `--wss-text-primary` | `#e6edf3` | Body and headings | 14.71:1 |
| `--wss-text-secondary` | `#aab7c4` | Descriptions | 7.98:1 |
| `--wss-text-muted` | `#8b9aab` | Labels, meta | 6.05:1 |
| `--wss-text-disabled` | `#5c6b7a` | Disabled text (WCAG exempts disabled) | — |
| `--wss-text-on-action` | `#0b1620` | Text on filled blue/green/amber/red | 5.79 / 8.69 / 8.33 / 4.78:1 |

Why the card is `#121b24` and not lighter: `#e74c3c` is canonical and core uses it for both
fills and text (`text-destructive`). On `#18232e` it falls to 4.17:1; on `#121b24` it passes at 4.55:1.

## Decision: dark text on filled buttons

White on `#3498db` is **3.15:1** and white on `#e74c3c` is **3.82:1**. Both fail WCAG AA for
normal-size text (4.5:1), and core button labels are small. The brand colours stay as the
fills; the label colour is `#0b1620` (a near-black from the `#2c3e50` family), which passes.

To switch to white labels (brand-first, AA-large only), set in `tokens.css`:
`--wss-text-on-action: #ffffff;`. This is a one-line, reversible brand decision.

## Mapping onto Pterodactyl v2 roles (`.dark`)

| Panel token | WSS value |
| --- | --- |
| `--background` / `--foreground` | app background / text primary |
| `--card`, `--card-foreground` | surface default / text primary |
| `--popover` | surface elevated (core also uses it for the active sidebar item) |
| `--secondary` | surface hover (grey button hover) |
| `--muted` / `--muted-foreground` | surface elevated / text muted |
| `--border` / `--input` | border default / border strong |
| `--primary`, `--accent`, `--ring` | brand primary (accent = links, active nav underline, info icons) |
| `--*-foreground` on fills | text on action |
| `--success` / `--warning` / `--destructive` | canonical status colours |
| `--caution` | 55% warning + 45% danger (derived; no extra hue introduced) |
| `--chart-1…5` | primary, accent, secondary, success, danger |
| `--sidebar-*` | admin sidebar roles from the same ladder |
| `--selection`, `--terminal-*`, `--editor-*`, `--scrollbar-*` | see `tokens.css` |

ANSI colours in the console keep their meaning; only blue, green, red, yellow and cyan are
moved to the WSS equivalents. Editor syntax colours are left at core defaults.

## Typography

Inter (variable, OFL-1.1) is self-hosted as a theme asset (`assets/fonts`, latin + latin-ext,
132 KB) from `@fontsource-variable/inter` 5.3.0 and set through `--font-sans`/`--font-header`
with the WSS fallback stack. No external font requests. Code and the console keep the
panel's monospace stack.

## Shape, density, elevation

- Radius: `--radius: 0.5rem` (8px; panel scale derives sm…4xl). The public site's 25px pill
  buttons are deliberately not used in the application.
- Density: `--spacing` left at the panel default (0.25rem).
- Layout: `--layout-content-width: 76rem` (core 75rem), `--layout-sidebar-width: 13rem`.
- Elevation: surface ladder plus 1px borders; no new shadows. WSS components use borders only.

## Interaction states

| State | Treatment |
| --- | --- |
| Hover | surface hover (`#1f2c39`); links/text hover to brand blue (core) |
| Active nav | brand-blue underline (`--accent`); sidebar mode: elevated surface |
| Focus | 2px `#3498db` outline (core `ring`), 5.72:1 against the page |
| Disabled | core opacity treatment on the same tokens |
| Selection | 38% brand blue |
| Transitional status | pulsing dot (disabled under `prefers-reduced-motion`) |

## Status semantics (WSS components)

| Status | Source | Tone |
| --- | --- | --- |
| Online | power `running` | success |
| Starting / Stopping | power `starting` / `stopping` | warning, transitional |
| Offline | power `stopped` / `offline` | danger |
| Installing / Transferring / Restoring backup | card state `unavailable` reason | warning, transitional |
| Maintenance | reason `maintenance` | warning |
| Suspended / Unreachable | reason `suspended` / `connection-error` | danger |
| Unavailable | reason `unavailable` | neutral |
| Checking | card state `loading` | neutral |

Every status is a coloured dot **and** a text label. Usage bars: brand blue normally, amber
from 75%, red from 90% or when the panel raises its own alarm flag.
