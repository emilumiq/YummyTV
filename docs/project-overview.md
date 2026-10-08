# Project overview (patchset notes)

Upstream: `Helandy/YummyTV`, pinned in `upstream-commit`. Branch `yummy` holds the
stack as atomic commits; `patches/` + `series` are exports (see `AGENTS.md`).
Builds only via `gradle-fhs` inside `nix develop` (run by the user, never agents).

## Module map

- `app` — Application, activities (ComponentActivity), signing config, manifest.
- `core/*` — foundation: navigation (Navigation3), designsystem (MD3 theme +
  `classic/` M2 kit), network (Ktor), preferences (DataStore + sync SharedPrefs),
  storage (Room `yummy_cache.db`), deeplink, mvi, model, utils, tv, error.
- `feature/*` — `api` (NavKey destinations + navigator/entry contracts),
  `domain` (model/repository/usecase, pure JVM), `data` (DTOs, mappers, Ktor/Room),
  `presentation` (MVI ViewModel + navigator impl), `ui-mobile` / `ui-tv` screens.
- `feature/main/{ui-mobile,ui-tv}` — `*NavigationHolder` lists every graph entry
  explicitly; a missing binding fails Dagger at compile time.
- `feature/classic/ui` — shared classic kit: `ClassicThemeWrapper` (global M2
  bridge + `LocalClassicUi`, flat classic remap of the M3 scheme when enabled),
  dual-path atoms (`YummyScaffold`, `YummyTopBar`, buttons, text field,
  dropdown/exposed menus, alert dialog, checkbox, progress, divider);
  fully converted screens use M2 directly (`ClassicBottomSheet` stays in
  designsystem), dual-path screens (tracker) use M3 text plus `Yummy*` widgets.

## Key conventions

- MVI: `XxxState` holds State/Event/Effect only; `ScreenNavigator(vm)` wires screens.
- Navigation3 serializable keys; deeplinks via `DeepLinkResolver` multibindings.
- Settings flow through `SettingsStore` snapshot; per-screen state mirrors it.
- `LocalClassicUi` (designsystem classic) switches converted components between
  MD3 and M2-classic render paths; `ClassicMaterialTheme` derives M2 colors from
  the ambient MD3 scheme, so classic mode follows any `AppTheme` incl. Dynamic.
- `AppLocale` (interface language) applies via base-context wrapping in activities;
  changes apply through activity `recreate()`, no process restart.
- AniList tracker (`feature/tracker`): OAuth authorization-code flow, credentials
  from `local.properties` into `BuildConfig`, bindings cached in Room
  (`tracker_binding`, one row per animeId — seasons are separate titles).
