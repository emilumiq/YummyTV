import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { basename, join } from 'node:path'
import { glob } from 'tinyglobby'
import { outDir, worktreeDir } from './config.js'
import { cd, step, success } from './lib.js'

if (!existsSync(join(worktreeDir, '.git'))) {
  throw new Error('No worktree/ — run `pnpm run setup` first')
}

step('Building :app:assembleRelease in worktree/')
await cd(worktreeDir)`./gradlew :app:assembleRelease --console=plain`

const apks = await glob('app/build/outputs/apk/release/*.apk', { cwd: worktreeDir })
await fs.mkdir(outDir, { recursive: true })
for (const apk of apks) {
  await fs.copyFile(join(worktreeDir, apk), join(outDir, basename(apk)))
}
success(`Copied ${apks.length} APK(s) to out/`)
