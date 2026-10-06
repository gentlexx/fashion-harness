import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@gentlexx/dsh-api-fashion-analysis-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
