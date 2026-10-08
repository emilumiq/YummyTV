# Changelog (patchset work)

Newest first. Each entry maps to one commit on `yummy` / one patch dir.

## Unreleased (on top of 162eb9af)

- Home feed customization: season hero and blogger videos toggles; hidden
  bottom-bar tabs (multi-toggle, bar never empties); home gates both.
- MD2 sweep (mobile): `YummySwitch/FilterChip/AssistChip` wrappers, alert
  dialogs migrated (home, account, video-download, comments, messages,
  reviews), playersetup/account switches, square chip shapes.
- Tracker mobile+tv are dual-path: M3 widgets when classic is off, M2 when on
  (`YummyScaffold/TopBar/Button/TextField/Menu/Dialog/Progress/...`); hardcoded
  Twitter-blue theme deleted.

- Classic details (mobile): separate Jellyfin-like layout — square poster and
  cards, plain backdrop without blur, static rating, no animations; wired via
  screen-level branch in `DetailsMobileScreen`.
- M2 shapes forced square; M3 classic shapes fully square.

- Classic toggle now restyles unconverted M3 screens (flat surfaces, square
  corners) via `ClassicThemeWrapper`; M2 darkness follows the displayed scheme,
  fixing forced-light rendering dark.
- `feature:classic:ui` shared kit: `ClassicThemeWrapper`, `YummyButton`,
  `YummyCard`, `YummyDialog`; wired once in mobile/tv main graphs.
- Navigation bar labels toggle (mobile bar + wide-window rail, taller bar
  when enabled); plumbed from DataStore to `MobileMainScaffold`.
- Home classic pass (mobile): square poster/progress/search/rating shapes,
  no hero blur, static carousel without auto-scroll and transforms.
- Tracker mobile+tv are dual-path: M3 widgets when classic is off, M2 when on
  (`YummyScaffold/TopBar/Button/TextField/Menu/Dialog/Progress/...`); hardcoded
  Twitter-blue theme deleted.
- AniList sign-in on mobile opens a Custom Tab (Telegram-style) with plain
  browser fallback; TV keeps the in-app WebView page.
- Tracker screens follow the app palette (hardcoded Twitter-blue theme
  removed); M2 bridge is always present so converted screens match in both
  classic modes; auth screen respects status-bar insets, tracker top bar
  regained its back button.

- Classic UI toggle: `classicUiEnabled` appearance flag, `LocalClassicUi`, M2 colors
  derived from the active MD3 scheme; `AppTheme.CLASSIC` removed.
- Material Design 2 theme entries renamed to "Material Design 2".
- Settings mobile fully on M2-classic dual-path atoms; shared `ClassicBottomSheet`.
- Tracker anime screen reworked to Aniyomi-sheet style (info grid, overflow menu,
  logout confirm dialog, logo tile); auth block only on the settings screen.
- Interface language switch (EN/RU/UK/system) via base-context wrap + recreate.
- Backdrop blur toggle (home carousel, details heroes mobile+tv).
- AniList bindings persist in Room (`tracker_binding`, migration v55).
- Separate TRACKERS settings category (mobile + tv).
- AniList track editor dialog (status/episodes/score/privacy), in-app WebView
  OAuth, search with posters/scores, real Viewer.name display.
- AniList sync core: Ktor GraphQL port, code flow + refresh, episode hook.
- Release signing with debug fallback, R8 keeps, `anilist-auth` deeplink.
- AppMetrica no-op without API key (fixes release crash).
- Swipe navigation transitions (mobile + tv).
- Nix dev environment (flake + direnv).
- Patch workflow: `upstream-commit`, `patches/`, `series`, TS scripts (`AGENTS.md`).
- Agent rules: English-only, patchset model, comment discipline (`AGENTS.md`).
