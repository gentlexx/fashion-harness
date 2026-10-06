import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@gentlexx/dsh-api-fashion-design-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
