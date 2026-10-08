import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { patchesDir, stackBranch, upstreamUrl, worktreeDir } from './config.js'
import { cd, patchFiles, readPinnedUpstreamCommit, step, success, warn } from './lib.js'

const pin = await readPinnedUpstreamCommit()

if (!existsSync(join(worktreeDir, '.git'))) {
  step(`Cloning upstream into worktree/ (history without blobs)`)
  const parent = cd(rootDir)
  await parent`git clone --filter=blob:none ${upstreamUrl} worktree`
  const git = cd(worktreeDir)
  await git`git checkout ${pin}`
} else {
  step('Reusing existing worktree/')
}

const repo = cd(worktreeDir)
step(`Rebuilding ${stackBranch} on ${pin}`)
await repo`git checkout -B ${stackBranch} ${pin}`

const files = await patchFiles()
if (files.length === 0) {
  warn('No patches to apply')
} else {
  step(`Applying ${files.length} patches`)
  for (const file of files) {
    await repo`git am --empty=drop ${join(patchesDir, file)}`
  }
}
success(`Assembled worktree/ on ${pin} with ${files.length} patches`)
