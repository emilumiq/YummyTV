import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const upstreamUrl = 'https://github.com/Helandy/YummyTV.git'
export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const worktreeDir = join(rootDir, 'worktree')
export const outDir = join(rootDir, 'out')
export const patchesDir = join(rootDir, 'patches')
export const seriesFile = join(rootDir, 'series')
export const upstreamCommitFile = join(rootDir, 'upstream-commit')
export const stackBranch = 'yummy'
