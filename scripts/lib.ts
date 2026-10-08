import fs from 'node:fs/promises'
import { relative } from 'node:path'
import { $ } from 'zx'
import { patchesDir, rootDir, seriesFile, stackBranch, upstreamCommitFile } from './config.js'

$.verbose = false

export function step(message: string) {
  console.log(`==> ${message}`)
}

export function success(message: string) {
  console.log(`ok ${message}`)
}

export function warn(message: string) {
  console.log(`warn ${message}`)
}

export function cd(cwd: string) {
  return $({ cwd })
}

export async function readPinnedUpstreamCommit(): Promise<string> {
  const value = (await fs.readFile(upstreamCommitFile, 'utf8')).trim()
  if (!/^[0-9a-f]{7,40}$/i.test(value)) {
    throw new Error(`Set ${relative(rootDir, upstreamCommitFile)} to a real commit hash first`)
  }
  return value
}

export async function writePinnedUpstreamCommit(commit: string): Promise<void> {
  await fs.writeFile(upstreamCommitFile, `${commit}\n`)
}

export async function generateStablePatch(repoDir: string, commitId: string): Promise<string> {
  // Scrub only the From commit SHA (unstable across rebases). Index lines keep
  // real blob SHAs: content-deterministic (stable) and required by binary patches.
  const patch = await cd(repoDir)`git format-patch --stdout --no-signature --subject-prefix= -1 ${commitId}`
  return patch.stdout.replace(
    /^From [0-9a-f]{40}( Mon Sep 17 00:00:00 2001)$/m,
    'From 0000000000000000000000000000000000000000$1',
  )
}

export async function stackCommits(repoDir: string, base: string): Promise<string[]> {
  const out = await cd(repoDir)`git rev-list --reverse ${base}..${stackBranch}`
  return out.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

export async function writeSeries(entries: string[]): Promise<void> {
  await fs.writeFile(seriesFile, entries.length > 0 ? `${entries.join('\n')}\n` : '')
  step(`Wrote ${entries.length} entries to series`)
}

export async function patchFiles(): Promise<string[]> {
  const entries = await fs.readdir(patchesDir).catch(() => [])
  return entries.filter((name) => name.endsWith('.patch')).sort()
}
