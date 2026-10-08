import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { patchesDir, rootDir, stackBranch, upstreamUrl, worktreeDir } from './config.js'
import { cd, patchFiles, readPinnedUpstreamCommit, step, success, warn } from './lib.js'

// Local-only secrets, never committed. Copied into worktree/ so builds
// pick them up; CI writes its own from GitHub Secrets instead.
const LOCAL_SECRETS = ['local.properties', 'keystore.properties', 'release.jks']

async function syncLocalSecrets() {
  for (const name of LOCAL_SECRETS) {
    const from = join(rootDir, name)
    const to = join(worktreeDir, name)
    if (!existsSync(from)) continue
    const fresh =
      !existsSync(to) ||
      (await fs.stat(from)).mtimeMs > (await fs.stat(to)).mtimeMs
    if (fresh) {
      await fs.copyFile(from, to)
      step(`Synced ${name} into worktree/`)
    }
  }
}

const pin = await readPinnedUpstreamCommit()

if (!existsSync(join(worktreeDir, '.git'))) {
  step(`Cloning upstream into worktree/ (history without blobs)`)
  await cd(rootDir)`git clone --filter=blob:none ${upstreamUrl} worktree`
  await cd(worktreeDir)`git checkout ${pin}`
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
await syncLocalSecrets()
success(`Assembled worktree/ on ${pin} with ${files.length} patches`)
