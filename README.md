# YummyTV patchset

Our changes on top of [`Helandy/YummyTV`](https://github.com/Helandy/YummyTV):
AniList sync, classic MD2 theme, release tooling. This repo holds **only
patches** — no upstream code. `upstream-commit` pins upstream, `patches/` +
`series` carry the stack as flat files.

## Assemble locally

```bash
pnpm install
pnpm run setup    # clone upstream at the pin into worktree/, apply patches
```

Develop in `worktree/` (branch `yummy`), then:

```bash
pnpm run export        # regenerate patches/ + series from worktree/
pnpm run lint-patches # secret / hygiene check
pnpm run rebase latest # new upstream pin: rebuild worktree/ stack on it
pnpm run build         # assemble + :app:assembleRelease, APKs to out/
```

See `AGENTS.md` for agent rules, `docs/project-overview.md` for the
architecture map, `docs/changelog.md` for per-change entries.

## CI

`.github/workflows/build.yml` assembles the same way on GitHub (clone at pin,
apply, build) and uploads the release APK. Tags `v*` publish a GitHub release.
Optional secrets: `ANILIST_CLIENT_ID` / `ANILIST_CLIENT_SECRET` and
`KEYSTORE_BASE64` / `KEYSTORE_PASSWORD` / `KEY_ALIAS` / `KEY_PASSWORD`
(without them the build uses debug-fallback signing and empty API keys).
