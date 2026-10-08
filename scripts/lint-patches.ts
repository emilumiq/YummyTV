import fs from 'node:fs/promises'
import { join } from 'node:path'
import { patchesDir } from './config.js'
import { patchFiles, step, success, warn } from './lib.js'

const files = await patchFiles()
let failed = false
for (const name of files) {
  const raw = await fs.readFile(join(patchesDir, name), 'utf8')
  step(`Checking ${name}`)
  if (/local\.properties|\.jks|keystore\.properties|client_secret|anilist.*secret/i.test(raw)) {
    warn(`${name} may contain secrets`)
    failed = true
  }
  if (/^diff --git a\/patches\//m.test(raw)) {
    warn(`${name} touches exported patches`)
    failed = true
  }
}
if (failed) process.exit(1)
success(`Checked ${files.length} patches`)
