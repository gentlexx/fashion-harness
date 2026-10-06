import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(packageRoot, '../../..')
const generator = new WorkspaceTypertGenerator(repoRoot, { checkDiagnostics: false })
const artifacts = generator.generate(
  ['@gentlexx/dsh-api-fashion-feedback-controller'],
  ['host'],
)
const out = join(packageRoot, 'lib')
mkdirSync(out, { recursive: true })
for (const artifact of artifacts) {
  writeFileSync(join(out, `typert.${artifact.face}.js`), artifact.js)
  writeFileSync(join(out, `typert.${artifact.face}.d.ts`), artifact.dts)
  if (artifact.remote !== undefined) {
    writeFileSync(join(out, 'typert.remote-client.js'), artifact.remote.js)
    writeFileSync(join(out, 'typert.remote-client.d.ts'), artifact.remote.dts)
    writeFileSync(join(out, 'typert.remote-client.d.ts.map'), artifact.remote.dtsMap)
  }
  console.log(`emitted face=${artifact.face} remote=${String(artifact.remote !== undefined)}`)
}
console.log(`hostExists=${String(existsSync(join(out, 'typert.host.js')))}`)
