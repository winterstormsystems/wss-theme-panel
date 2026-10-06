# Phase 3 plan: complete the customer experience

Baseline: Phase 2 architecture (shell, bridge, `wss/panel`, registered seams). Branch `wss/v3-develop`.

## Findings from the survey

- The remaining "stock" look is concentrated in a handful of **shared primitives**, not in the
  pages: `DataTable` (all lists: network, backups, schedules, tasks, databases, subusers, API
  keys, SSH keys), `ActivityLogEntry` (bot and account activity), `ScreenBlock` (error/denied
  pages with Pterodactyl's illustration), `ListToolbar` (usage summaries), uppercase `Button` and
  `Label`, and text fields whose fill and border share `--input`.
- Page headings and subtitles already come from WSS (`workspace/sections.ts`).
- Customer wording that still says "server" is spread over ~20 files; most of it reaches the
  screen through the primitives above (empty states, summaries, error blocks).

## Approach (cheapest layer first)

1. **Shell UI stylesheet** (`wss/panel/styles/ui.css`), active only while the WSS shell or WSS
   auth layout is mounted (`<html data-wss-ui>`, so dialogs portalled to `<body>` are covered and
   `/panel` is not). Selectors use elements, ARIA and data attributes only, never core utility
   class names: sentence-case buttons and labels, focus rings, field borders.
2. **Token split for fields**: core uses `--input` as fill and border. One seam in
   `form/controls.tsx` reads `--input-border` (falls back to `--input`, so admin is unchanged).
3. **Primitive seams** that delegate to WSS components inside the shell:
   `DataTable` → responsive list (rows on wide containers, labelled stacked cards on narrow ones,
   no horizontal scrolling), `ListToolbar`, `ActivityLogEntry` → audit timeline row,
   `ScreenBlock` → WSS state panel.
4. **Presentation wording**: `wss/panel/wording.ts` rewrites core-authored strings that pass
   through those primitives ("this server" → "this bot", …). Applied only to strings authored by
   core (empty states, summaries, error titles, activity translations via an i18next
   post-processor on the `activity` namespace), never to user data.
5. **String seams** only where text is not reachable otherwise: `StartupContainer` (Launch
   Command, Runtime Image), `StatGraphs` (CPU Usage, Memory Usage, Network Traffic),
   `LoginContainer` (Sign in), `PowerButtons` (Start uses the success colour).
6. **WSS compositions**: account overview (profile, password, prominent 2FA security card) via a
   re-export seam of `AccountOverviewContainer`, like console/settings in Phase 2.

Expected core patch count: 12 → about 22 (all small; each registered and checked). Final: 26 (see CORE_PATCHES.md).

## Page work

Network, Backups, Schedules, Databases, Team Access (route/API stay `users`), Activity: WSS
headings/subtitles (sections.ts), list presentation via the DataTable seam, intentional empty
states, permission checks untouched (core `Can`, `usePermissions`). Console: offline overlay
outside xterm (no lifecycle change), graph titles. Settings: single danger card (no double
border). Overview: hierarchy and missing-value polish.

## Not in scope

Admin (`/panel`), WHMS-lite, billing, backend/API/Wings/permissions/auth behaviour.

## Verification

tsc, build, extension tests, oxlint/oxfmt, `check-core-patches`, secret/artifact scan,
regression (all customer routes), permissions (limited subuser), screenshots at
1440/1280/1024/820/768/430/390 with overflow and console/network error checks.
