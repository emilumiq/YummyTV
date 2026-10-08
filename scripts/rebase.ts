import { $ } from 'zx'
import { patchesDir, rootDir, stackBranch, upstreamCommitFile, worktreeDir } from './config.js'
import { cd, patchFiles, readPinnedUpstreamCommit, step, success, warn, writePinnedUpstreamCommit } from './lib.js'
import { join } from 'node:path'

const target = process.argv[2]
if (target) {
  const repo = cd(worktreeDir)
  step('Fetching upstream')
  await repo`git fetch upstream`
  const resolved = (await repo`git rev-parse ${target}^{commit}`).stdout.trim()
  await writePinnedUpstreamCommit(resolved)
  step(`Pinned upstream to ${resolved} in ${upstreamCommitFile}`)
}

const pin = await readPinnedUpstreamCommit()
const repo = cd(worktreeDir)
step(`Rebuilding ${stackBranch} on ${pin}`)
await repo`git checkout -B ${stackBranch} ${pin}`

const files = await patchFiles()
if (files.length === 0) {
  warn('No patches to apply')
} else {
  const result = await $({ cwd: worktreeDir, nothrow: true })`git am --empty=drop ${files.map((f) => join(patchesDir, f))}`
  if (result.exitCode !== 0) {
    warn('Conflicts detected. Resolve in worktree/, run `git am --continue`, then `pnpm run export`.')
    if (result.stderr.trim()) console.error(result.stderr.trim())
    process.exit(result.exitCode)
  }
}
success(`Applied ${files.length} patches onto ${pin} into ${stackBranch}`)
