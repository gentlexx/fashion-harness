import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@gentlexx/dsh-api-fashion-evaluation-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
