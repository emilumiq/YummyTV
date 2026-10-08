import fs from 'node:fs/promises'
import { join, relative } from 'node:path'
import { patchesDir, rootDir, worktreeDir } from './config.js'
import { cd, generateStablePatch, readPinnedUpstreamCommit, stackCommits, step, success, warn, writeSeries } from './lib.js'

const base = await readPinnedUpstreamCommit()
const repoDir = worktreeDir

const dirty = (await cd(repoDir)`git status --porcelain`).stdout.trim()
if (dirty) warn(`Worktree has uncommitted changes:\n${dirty}`)

const commits = await stackCommits(repoDir, base)

await fs.rm(patchesDir, { recursive: true, force: true })
await fs.mkdir(patchesDir, { recursive: true })

const entries: string[] = []
for (const commitId of commits) {
  const subject = (await cd(repoDir)`git log -1 --format=%s ${commitId}`).stdout.trim()
  const files = (await cd(repoDir)`git diff-tree --no-commit-id --name-only -r ${commitId}`).stdout
    .split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (files.length === 0) warn(`Commit ${commitId} ${subject} is empty`)
  const slug = subject.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || commitId.slice(0, 8)
  const name = `${String(entries.length + 1).padStart(4, '0')}-${slug}.patch`
  step(`Exporting ${subject} -> ${relative(rootDir, join(patchesDir, name))}`)
  await fs.writeFile(join(patchesDir, name), await generateStablePatch(repoDir, commitId))
  entries.push(name)
}

await writeSeries(entries)
if (dirty) warn(`Worktree has uncommitted changes:\n${dirty}`)
success(`Exported ${entries.length} ${entries.length === 1 ? 'patch' : 'patches'}`)
