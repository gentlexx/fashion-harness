import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'

const root = process.cwd()
const generator = new WorkspaceTypertGenerator(root, { checkDiagnostics: false })
const artifacts = generator.generate(
  ['@gentlexx/dsh-api-fashion-analysis-controller'],
  ['host'],
)
const out = join(root, 'packages/api/fashion-analysis-controller/lib')
mkdirSync(out, { recursive: true })
for (const artifact of artifacts) {
  writeFileSync(join(out, `typert.${artifact.face}.js`), artifact.js)
  writeFileSync(join(out, `typert.${artifact.face}.d.ts`), artifact.dts)
  if (artifact.remote !== undefined) {
    writeFileSync(join(out, 'typert.remote-client.js'), artifact.remote.js)
    writeFileSync(join(out, 'typert.remote-client.d.ts'), artifact.remote.dts)
    writeFileSync(join(out, 'typert.remote-client.d.ts.map'), artifact.remote.dtsMap)
  }
  console.log(`emitted face=${artifact.face} package=${artifact.package} remote=${String(artifact.remote !== undefined)}`)
}
console.log(`count=${String(artifacts.length)}`)
console.log(`hostExists=${String(existsSync(join(out, 'typert.host.js')))}`)
