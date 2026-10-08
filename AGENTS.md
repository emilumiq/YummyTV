# YummyTV agent guide

## Repository

YummyTV is a **patchset**, not a fork. This repo holds only patches:
`patches/` + `series` are the source of truth for our changes, `upstream-commit`
pins `Helandy/YummyTV`. Upstream code is never committed here — `pnpm run setup`
clones it into ignored `worktree/` and applies the stack there.

## Rules

Explicit user instructions override these defaults.

- English only: all code, comments, KDoc, commit messages and docs.
- Comments are short and rare: one line, only where the reason is not obvious
  from the code. Never restate the signature, never narrate the code, never
  leave essay blocks. If in doubt, delete the comment.
- Edit code in `worktree/` (on branch `yummy`); new modules live there until
  export. Never hand-edit `patches/*.patch` or `series`.
- Do not run `git` inside `worktree/` unless explicitly asked. Read-only
  `git log`/`git status` is allowed. Never run export; the user exports with
  `pnpm run export`.
- Never run builds; the user builds (`pnpm run build`, CI, or `gradle-fhs`
  inside `worktree/`). Verify by reading, not by executing.
- Secrets (`local.properties`, `*.jks`, `keystore.properties`) never enter git,
  in either tree. Check with `pnpm run lint-patches`.
- One commit, one topic. Subjects: `[TRACKER] ...` / `[CORE] ...` /
  `[SETTINGS] ...` / `[CLASSIC] ...` / `[DETAILS] ...` / `[HOME] ...`.
- Use `rg` to locate symbols; read small ranges in files over 2k lines.
- Keep upstream changes small: wiring or short guards inline, feature logic in
  the feature helper. Avoid re-indenting upstream inside `if`/`else`.
- Gate behavior changes behind settings toggles: default off behaves like stock.

## Patchset workflow (TypeScript)

Upstream code is assembled, never stored. Tooling lives in `scripts/*.ts`,
run with `pnpm` from the repo root:

| Command | Use |
| --- | --- |
| `pnpm run setup` | Clone upstream at the pin into `worktree/`, apply stack (`scripts/setup.ts`) |
| `pnpm run export` | Regenerate `patches/` + `series` from `worktree/` stack (`scripts/export.ts`) |
| `pnpm run rebase [ref]` | New pin: rebuild `worktree/` stack on it (`scripts/rebase.ts`) |
| `pnpm run lint-patches` | Validate patch hygiene: no secrets, no `patches/` self-reference |
| `pnpm run build` | Assemble + `:app:assembleRelease` in `worktree/`, APKs to `out/` |

- `scripts/config.ts` holds paths and upstream URL; `scripts/lib.ts` holds
  shared git helpers. Keep them in step.
- Exported patches use stable headers (`--zero-commit`, index lines scrubbed).
- Conflicts stop setup/rebase inside `worktree/`: resolve, `git am --continue`,
  then `pnpm run export`.
- CI (`.github/workflows/build.yml`) repeats the same assembly on GitHub:
  clone at pin, apply, build release APK, upload artifact; tags `v*` publish
  a GitHub release. Secrets (`ANILIST_CLIENT_ID`, keystore) are optional —
  without them the build uses debug fallback signing and empty API keys.

## Domain Structure

- Keep every public domain model, enum, sealed contract, repository contract, and use case in its
  own same-named Kotlin file.
- Split each feature's `.domain` package into `.domain.model`, `.domain.repository`, and
  `.domain.usecase`. Never leave files directly in `.domain`.
    - `.domain.model` — domain models, enums, sealed contracts, and their extension helpers
      (e.g. sorting).
    - `.domain.repository` — repository interfaces only (`XxxRepository`).
    - `.domain.usecase` — use cases only (`XxxUseCase`).
    - Do not create a sub-package that would stay empty.
- Add KDoc to every use case describing the domain operation it performs.

## Data Layer Structure

- Put all DTOs in the feature data module's `.dto` package.
- Put DTO↔domain and domain↔DTO mappers in the `.mapper` package; cache/entity↔domain mappers in
  `.storage.mapper`. Do not keep DTO→domain mapping inline in repositories.
- Serializable cache-envelope types and their `toDomain()` live in a `.mapper` (or `.dto`) package,
  not inside a repository.
- Repositories orchestrate (network + cache + storage) and call mappers; they do not define them.

## Compose UI Feature Structure

- Keep `XxxMobileScreen.kt` and `XxxTvScreen.kt` as public screen entrypoints:
  `@Composable fun XxxScreen(state, effect, onEvent)`.
- Screen files must contain the real top-level screen assembly and event wiring; they must not be
  empty pass-through wrappers to `XxxContent`.
- Do not create generic `XxxContent` as a duplicated screen layer. Use a `Content` suffix only for a
  real domain UI component, not as a default screen body.
- Put child composable UI pieces in the feature UI module's `.view` package.
- Prefer one significant composable component per file in `.view`; small local lambdas inside a
  component are fine.
- Put Handler classes next to the ViewModel in the feature module's `.handler` package.
- `XxxState.kt` must contain only the `State`/`Event`/`Effect` declarations (plus types nested
  strictly inside `State`, e.g. an enum that only makes sense as part of one screen's state). Any
  other top-level `data class`/`enum class`/`sealed interface` declared alongside them — anything
  referenced from a handler, the ViewModel, or UI — belongs in `.model` instead, one file per type,
  file name matching the type name.
- Put UI-only models in `.model`.
- Put Domain/Data model → UI model mapper functions in a feature-specific `.mapper` package
  (module-root-level, sibling to `.utils`/`.handler`/`.model`), one file per mapper, named
  `XxxMapper.kt`. Do not define mapper functions inside ViewModel files — ViewModels only call them.
- Put formatters and extension helpers in `.utils`.
- Keep reusable formatting and error extensions out of Screen and `.view` files; place them in a
  feature-specific `XxxUtils.kt` under `.utils`.
- Keep reusable parsers, normalizers, and stateless extension helpers out of use cases, handlers,
  and their companion objects; place them in a feature-specific `XxxUtils.kt` under `.utils`.
- Import extension receiver types normally; do not use fully qualified receiver types in function
  declarations.
- Keep stateless private entity mappers used by only one class in that class's companion object;
  move shared mappers to a dedicated mapper package.
- Keep user-facing strings in Android resources and read them with `stringResource`.
- Do not move business logic into UI components.

## Classic UI (MD2)

- Converted screens use `material.*` directly and self-wrap in
  `ClassicMaterialTheme` (M2 colors derived from the ambient MD3 scheme, so any
  `AppTheme` incl. Dynamic is followed). Shared atoms live in
  `feature:classic:ui` (`ClassicThemeWrapper`, `YummyButton`, `YummyCard`,
  `YummyDialog`); new conversions reuse them instead of copying M2 code.
- Dual-path screens (tracker): M3 `Text`/`Icon`/`MaterialTheme` plus `Yummy*`
  widgets, which render M2 when `LocalClassicUi` is set and M3 otherwise.
  `Text`, `Icon`, `Surface` stay direct; they follow the ambient scheme.
- Full classic redesigns (details mobile): separate layout under
  `details/classic/` branched at screen level; classic-only files use M2
  directly, share state/events with the modern screen, skip blur/animations.
- `core/designsystem` never depends on `feature:classic`. Global M2 bridge plus
  `LocalClassicUi` come from `ClassicThemeWrapper`, applied once in
  `MobileMainGraph` / `TvMainGraph` and driven by `classicUiEnabled`.
- TV focus (`TvFocusable*`, `TvFocusIndicator`) stays intact under both paths.

Keep this guide to durable rules, ownership boundaries, and commands. Update it
when those change; keep implementation walkthroughs and benchmark history out.
