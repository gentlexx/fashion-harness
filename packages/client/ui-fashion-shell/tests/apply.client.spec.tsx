/** @vitest-environment jsdom */
/** Fashion shell apply: sidebar/main registration and settings seat. */
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import type { InputZone } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import { emptyFashionAgentStatus } from '@gentlexx/dsh-api-fashion-agent-controller/src/client/model.ts'
import { apply, FASHION_PANEL_ID, inject } from '../src/client/index.ts'
import { apply as hostApply } from '../src/index.ts'

const owners = new Set<Fiber>()
afterEach(async () => {
  try {
    for (const owner of owners) await owner.dispose()
  } finally {
    owners.clear()
  }
})

function Frame({ renderSlot }: PropsRenderSlots<
  'sidebar' | 'main' | 'conversation.hero.lead' | 'conversation.input.dock' | 'conversation.session.header.utilities'
>) {
  return (
    <>
      {renderSlot('sidebar', { collapsed: false, width: 280 })}
      {renderSlot('main', {}, { entryKey: 'fashion.projects' })}
      {renderSlot('conversation.hero.lead', {})}
      {renderSlot('conversation.input.dock', { session: null, input: null } as unknown as InputZone)}
      {renderSlot('conversation.session.header.utilities', {})}
    </>
  )
}

function fashionProjectsStub() {
  const list = createSnapshotStore<ProjectListState>({
    status: 'ready',
    items: [],
    error: null,
  })
  return {
    list,
    load: vi.fn(async () => {}),
    create: vi.fn(async (title: string) => ({
      id: 'created-id' as never,
      title,
      origin: 'user' as const,
      accessMode: 'editable' as const,
      createdAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
      revision: 0,
    })),
    get: vi.fn(async () => {
      throw new Error('missing')
    }),
  }
}

function fashionResearchStub() {
  const empty = createSnapshotStore({
    status: 'ready' as const,
    items: [] as const,
    error: null,
  })
  return {
    tasks: empty,
    sources: empty,
    samples: empty,
    evidence: empty,
    loadTasks: vi.fn(async () => {}),
    loadTaskChildren: vi.fn(async () => {}),
    createTask: vi.fn(async () => {
      throw new Error('unused')
    }),
    getTask: vi.fn(async () => {
      throw new Error('unused')
    }),
    updateTask: vi.fn(async () => {
      throw new Error('unused')
    }),
    archiveTask: vi.fn(async () => {
      throw new Error('unused')
    }),
    createSource: vi.fn(async () => {
      throw new Error('unused')
    }),
    getSource: vi.fn(async () => {
      throw new Error('unused')
    }),
    updateSource: vi.fn(async () => {
      throw new Error('unused')
    }),
    archiveSource: vi.fn(async () => {
      throw new Error('unused')
    }),
    createSample: vi.fn(async () => {
      throw new Error('unused')
    }),
    getSample: vi.fn(async () => {
      throw new Error('unused')
    }),
    updateSample: vi.fn(async () => {
      throw new Error('unused')
    }),
    archiveSample: vi.fn(async () => {
      throw new Error('unused')
    }),
    createEvidence: vi.fn(async () => {
      throw new Error('unused')
    }),
    getEvidence: vi.fn(async () => {
      throw new Error('unused')
    }),
    updateEvidence: vi.fn(async () => {
      throw new Error('unused')
    }),
    archiveEvidence: vi.fn(async () => {
      throw new Error('unused')
    }),
    reviewEvidence: vi.fn(async () => {
      throw new Error('unused')
    }),
  }
}

function fashionAnalysisStub() {
  const empty = createSnapshotStore({
    status: 'ready' as const,
    items: [] as const,
    error: null,
  })
  return {
    marketItems: empty,
    signals: empty,
    clusters: empty,
    opportunities: empty,
    loadWorkspace: vi.fn(async () => {}),
    createMarketItem: vi.fn(async () => {
      throw new Error('unused')
    }),
    getMarketItem: vi.fn(async () => {
      throw new Error('unused')
    }),
    confirmDedupe: vi.fn(async () => {
      throw new Error('unused')
    }),
    createPopularitySignal: vi.fn(async () => {
      throw new Error('unused')
    }),
    getSignal: vi.fn(async () => {
      throw new Error('unused')
    }),
    createTrendCluster: vi.fn(async () => {
      throw new Error('unused')
    }),
    getCluster: vi.fn(async () => {
      throw new Error('unused')
    }),
    createDesignOpportunity: vi.fn(async () => {
      throw new Error('unused')
    }),
    getOpportunity: vi.fn(async () => {
      throw new Error('unused')
    }),
    decideOpportunity: vi.fn(async () => {
      throw new Error('unused')
    }),
  }
}

async function bench(
  fashionDesign: object = {},
  services: { readonly research?: object; readonly analysis?: object } = {},
) {
  const root = new Context()
  let ctx: Context | undefined
  const owner = root.plugin((owned: Context) => { ctx = owned })
  owners.add(owner)
  await owner.await()
  if (ctx === undefined) throw new Error('owner missing')
  await ctx.plugin(SlotRegistry).await()
  const layout = {
    toggleSidebar: vi.fn(),
    selectPanel: vi.fn(),
  }
  ctx.provide('layout', layout)
  ctx.provide('locale', new LocaleRuntime(ctx))
  ctx.provide('fashionProjects', fashionProjectsStub())
  ctx.provide('fashionResearch', { ...fashionResearchStub(), ...services.research })
  ctx.provide('fashionAnalysis', { ...fashionAnalysisStub(), ...services.analysis })
  ctx.provide('fashionDesign', fashionDesign)
  ctx.provide('fashionFeedback', {})
  ctx.provide('fashionEvaluation', {})
  const sessionList = createSnapshotStore<{ current: import('@deepseek-ai/dsh-session').SessionId | undefined }>({
    current: undefined,
  })
  ctx.provide('sessions', {
    list: sessionList,
    create: vi.fn(async () => 'session-1'),
    open: vi.fn(),
  })
  const fashionAgent = {
    view: createSnapshotStore(emptyFashionAgentStatus(null)),
    bind: vi.fn(async () => ({
      result: { kind: 'unbound' },
      status: emptyFashionAgentStatus(null),
    })),
    sync: vi.fn(async () => emptyFashionAgentStatus(null)),
  }
  ctx.provide('fashionAgent', fashionAgent)
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({
    name: 'root',
    children: {
      sidebar: { kind: 'single', scope: 'root' },
      main: { kind: 'keyed', scope: 'root' },
      'conversation.hero.lead': { kind: 'single', scope: 'root' },
      'conversation.input.dock': { kind: 'multi', scope: 'root' },
      'conversation.session.header.utilities': { kind: 'multi', scope: 'root' },
    },
  } as never, Frame)
  return { ctx, slots, layout, fashionAgent, sessionList }
}

describe('ui-fashion-shell apply', () => {
  it('declares the Fashion route prefix to a composed dist server and withdraws it on disposal', () => {
    const registered: string[] = []
    const effects: (() => () => void)[] = []
    const routeCtx = {
      frontendStatic: {
        registerAppRoute: (prefix: string) => {
          registered.push(prefix)
          return () => { registered.splice(registered.indexOf(prefix), 1) }
        },
      },
      effect: (body: () => () => void) => { effects.push(body) },
    }
    let injected: readonly string[] | undefined
    hostApply({
      inject: (services: readonly string[], body: (ctx: typeof routeCtx) => void) => {
        injected = services
        body(routeCtx)
      },
    } as never)
    // The prefix is declared through a service injection, so a Fashion
    // composition without a dist server still boots.
    expect(injected).toEqual(['frontendStatic'])
    const dispose = effects[0]!()
    expect(registered).toEqual(['/projects'])
    dispose()
    expect(registered).toEqual([])
  })

  it('declares only the services it uses', () => {
    expect(inject).toEqual([
      'slots',
      'layout',
      'locale',
      'sessions',
      'fashionProjects',
      'fashionResearch',
      'fashionAnalysis',
      'fashionDesign',
      'fashionFeedback',
      'fashionEvaluation',
      'fashionAgent',
    ])
  })

  it('registers Fashion sidebar, main panel, and settings seat', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.slots.entries('sidebar')).toHaveLength(1)
    expect(b.slots.spec('sidebar.settings')).toEqual({ kind: 'single', scope: 'root' })
    expect(b.slots.spec('sidebar.workspaces')).toEqual({ kind: 'single', scope: 'root' })
    const mains = b.slots.entries('main')
    expect(mains.map(entry => entry.options.key)).toContain('fashion.projects')
    expect(b.layout.selectPanel).toHaveBeenCalledWith(FASHION_PANEL_ID)
  })

  it('switches Agent workspace to null panel and Projects back to Fashion', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const injected = (b.slots.entries('sidebar')[0]!.inject as () => {
      openProjects: () => void
      openAgent: () => void
    })()
    b.layout.selectPanel.mockClear()
    injected.openAgent()
    expect(b.layout.selectPanel).toHaveBeenCalledExactlyOnceWith(null)
    b.layout.selectPanel.mockClear()
    injected.openProjects()
    expect(b.layout.selectPanel).toHaveBeenCalledExactlyOnceWith(FASHION_PANEL_ID)
  })

  it('syncs Host binding when the current session changes', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.fashionAgent.sync).toHaveBeenCalled()
  })

  it('binds the pending route project after workspace selection creates a session', async () => {
    window.history.replaceState(null, '', '/projects/r0-us-womens-khaki-utility-jacket/overview')
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const injected = (b.slots.entries('sidebar')[0]!.inject as () => {
      openAgent: () => void
    })()

    injected.openAgent()
    expect(b.fashionAgent.bind).not.toHaveBeenCalled()

    b.sessionList.set({ current: 'session-after-workspace' as never })
    await vi.waitFor(() => {
      expect(b.fashionAgent.bind).toHaveBeenCalledWith(expect.objectContaining({
        sessionId: 'session-after-workspace',
        projectId: 'r0-us-womens-khaki-utility-jacket',
      }))
    })
  })

  it('registers Agent lead and dock, then clears them on teardown', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries('conversation.hero.lead')).toHaveLength(1)
    expect(
      b.slots.entries('conversation.input.dock').some(entry => entry.options.id === 'fashion-agent-context'),
    ).toBe(true)
    expect(
      b.slots.entries('conversation.session.header.utilities')
        .some(entry => entry.options.id === 'fashion-sidebar-restore'),
    ).toBe(true)
    await fiber.dispose()
    expect(b.slots.entries('conversation.hero.lead')).toHaveLength(0)
    expect(b.slots.entries('conversation.input.dock')).toHaveLength(0)
    expect(b.slots.entries('conversation.session.header.utilities')).toHaveLength(0)
  })

  it('removes sidebar and Fashion main entries on teardown', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries('sidebar')).toHaveLength(1)
    expect(b.slots.entries('main').some(entry => entry.options.key === 'fashion.projects')).toBe(true)
    await fiber.dispose()
    expect(b.slots.entries('sidebar')).toHaveLength(0)
    expect(b.slots.spec('sidebar.settings')).toBeUndefined()
    expect(b.slots.entries('main')).toHaveLength(0)
  })
})

describe('deliverable hash verification adapter', () => {
  class CommandError extends Error {
    constructor(readonly rpcError: { code: string; message: string; details?: object }) {
      super(rpcError.message)
    }
  }

  async function verifyWith(verifyDeliverable: () => Promise<unknown>) {
    const b = await bench({ verifyDeliverable })
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const main = b.slots.entries('main').find(entry => entry.options.key === 'fashion.projects')!
    const injected = (main.inject as () => {
      verifyDesignDeliverable: (projectId: string, deliverableId: string) => Promise<unknown>
    })()
    return injected.verifyDesignDeliverable('u1', 'd1')
  }

  it('passes a successful verification through', async () => {
    await expect(verifyWith(async () => ({ ok: true, mismatches: [] }))).resolves.toEqual({ ok: true, mismatches: [] })
  })

  it('turns the Host integrity-mismatch rejection into a mismatch result with every reason', async () => {
    const result = verifyWith(async () => {
      throw new CommandError({
        code: 'fashion-design/integrity-mismatch',
        message: 'fashion design integrity mismatch: hash:markdown,manifest-markdown',
        details: { reason: 'hash:markdown,manifest-markdown' },
      })
    })
    await expect(result).resolves.toEqual({ ok: false, mismatches: ['hash:markdown', 'manifest-markdown'] })
  })

  it('keeps every other rejection as an execution failure', async () => {
    const offline = new Error('offline')
    await expect(verifyWith(async () => { throw offline })).rejects.toBe(offline)
    const notFound = new CommandError({ code: 'fashion-design/not-found', message: 'missing' })
    await expect(verifyWith(async () => { throw notFound })).rejects.toBe(notFound)
    const noReason = new CommandError({ code: 'fashion-design/integrity-mismatch', message: 'x', details: {} })
    await expect(verifyWith(async () => { throw noReason })).rejects.toBe(noReason)
  })
})
describe('design write inject callbacks', () => {
  class CommandError extends Error {
    constructor(readonly rpcError: { code: string; message: string }) {
      super(rpcError.message)
    }
  }

  type DesignInject = {
    findDesignOpportunity: (projectId: string, opportunityId: string) => Promise<unknown>
    createDesignBrief: (input: object) => Promise<unknown>
    confirmDesignBrief: (input: object) => Promise<unknown>
    createDesignConceptSet: (input: object) => Promise<unknown>
    createDesignConcept: (input: object) => Promise<unknown>
    markDesignConceptSetReviewReady: (input: object) => Promise<unknown>
  }

  async function designInject(
    fashionDesign: object,
    services: { readonly research?: object; readonly analysis?: object } = {},
  ): Promise<DesignInject> {
    const b = await bench(fashionDesign, services)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const main = b.slots.entries('main').find(entry => entry.options.key === 'fashion.projects')!
    return (main.inject as () => DesignInject)()
  }

  it('passes each design write request through unchanged and wraps the result', async () => {
    const design = {
      createBriefFromOpportunity: vi.fn(async () => ({ id: 'brief-1' })),
      confirmBrief: vi.fn(async () => ({ id: 'brief-1' })),
      createConceptSet: vi.fn(async () => ({ id: 'set-1' })),
      createConcept: vi.fn(async () => ({ id: 'c1' })),
      markConceptSetReviewReady: vi.fn(async () => ({ id: 'set-1' })),
    }
    const injected = await designInject(design)
    const brief = {
      projectId: 'u1',
      opportunityId: 'opp-1',
      expectedOpportunityRevision: 4,
      selectionDecisionId: 'dec-1',
      market: 'm',
      season: 's',
      category: 'c',
      targetUser: 'u',
      brandContext: null,
      mustKeep: [],
      mustAvoid: [],
      materialsConstraints: [],
      costConstraints: [],
      productionConstraints: [],
      differentiationGoals: [],
      openQuestions: [],
    }
    await expect(injected.createDesignBrief(brief)).resolves.toEqual({ ok: true, value: { id: 'brief-1' } })
    expect(design.createBriefFromOpportunity).toHaveBeenCalledWith(brief)
    await injected.confirmDesignBrief({ projectId: 'u1', briefId: 'brief-1', expectedRevision: 2 })
    expect(design.confirmBrief).toHaveBeenCalledWith({ projectId: 'u1', briefId: 'brief-1', expectedRevision: 2 })
    await injected.createDesignConceptSet({ projectId: 'u1', briefId: 'brief-1', expectedBriefRevision: 3 })
    expect(design.createConceptSet).toHaveBeenCalledWith({ projectId: 'u1', briefId: 'brief-1', expectedBriefRevision: 3 })
    const concept = {
      projectId: 'u1',
      conceptSetId: 'set-1',
      expectedConceptSetRevision: 1,
      conceptName: 'n',
      designIntent: 'i',
      silhouette: 's',
      proportionAndLength: 'p',
      materialDirection: 'm',
      colorDirection: 'c',
      constructionAndDetails: ['d'],
      functionalValue: ['f'],
      targetUseScenarios: ['t'],
      originalTransformationNotes: ['o'],
      productionUnknowns: ['u'],
    }
    await injected.createDesignConcept(concept)
    expect(design.createConcept).toHaveBeenCalledWith(concept)
    await injected.markDesignConceptSetReviewReady({ projectId: 'u1', conceptSetId: 'set-1', expectedRevision: 5 })
    expect(design.markConceptSetReviewReady).toHaveBeenCalledWith({ projectId: 'u1', conceptSetId: 'set-1', expectedRevision: 5 })
  })

  it('turns a Host rejection into a failure category', async () => {
    const injected = await designInject({
      confirmBrief: vi.fn(async () => {
        throw new CommandError({ code: 'fashion-design/revision-conflict', message: 'stale' })
      }),
    })
    await expect(injected.confirmDesignBrief({ projectId: 'u1', briefId: 'b', expectedRevision: 0 }))
      .resolves.toEqual({ ok: false, failure: 'conflict' })
  })

  it('finds the Opportunity under the ResearchTask that owns it', async () => {
    const tasks = createSnapshotStore({
      status: 'ready' as const,
      items: [{ id: 't1', projectId: 'u1' }, { id: 't2', projectId: 'u1' }, { id: 't3', projectId: 'other' }],
      error: null,
    })
    const getOpportunity = vi.fn(async (request: { taskId: string }) => {
      if (request.taskId === 't2') return { id: 'opp-1', revision: 4 }
      throw new CommandError({ code: 'fashion-analysis/opportunity-not-found', message: 'missing' })
    })
    const injected = await designInject({}, {
      research: { tasks, loadTasks: vi.fn(async () => {}) },
      analysis: { getOpportunity },
    })
    await expect(injected.findDesignOpportunity('u1', 'opp-1')).resolves.toEqual({ id: 'opp-1', revision: 4 })
    expect(getOpportunity.mock.calls.map(([request]) => request.taskId)).toEqual(['t1', 't2'])
  })

  it('returns null when no task owns the Opportunity and rethrows other failures', async () => {
    const tasks = createSnapshotStore({ status: 'ready' as const, items: [{ id: 't1', projectId: 'u1' }], error: null })
    const missing = await designInject({}, {
      research: { tasks, loadTasks: vi.fn(async () => {}) },
      analysis: {
        getOpportunity: vi.fn(async () => {
          throw new CommandError({ code: 'fashion-analysis/opportunity-not-found', message: 'missing' })
        }),
      },
    })
    await expect(missing.findDesignOpportunity('u1', 'opp-1')).resolves.toBeNull()
    const offline = new Error('offline')
    const failing = await designInject({}, {
      research: { tasks, loadTasks: vi.fn(async () => {}) },
      analysis: { getOpportunity: vi.fn(async () => { throw offline }) },
    })
    await expect(failing.findDesignOpportunity('u1', 'opp-1')).rejects.toBe(offline)
  })
})

describe('stage observation inject callback', () => {
  type ListState = { status: 'ready' | 'error' | 'loading'; items: { id: string; projectId: string }[]; error: null }
  async function observe(states: { tasks: ListState; briefs: ListState; conceptSets: ListState }, projectId: string) {
    const b = await bench({
      briefs: createSnapshotStore(states.briefs),
      conceptSets: createSnapshotStore(states.conceptSets),
      loadWorkspace: vi.fn(async () => {}),
      listReviews: vi.fn(async () => []),
      listDeliverables: vi.fn(async () => []),
    }, { research: { tasks: createSnapshotStore(states.tasks), loadTasks: vi.fn(async () => {}) } })
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const main = b.slots.entries('main').find(entry => entry.options.key === 'fashion.projects')!
    const injected = (main.inject as () => { readStageObservations: (id: string) => Promise<unknown> })()
    return injected.readStageObservations(projectId)
  }
  const ready = (items: ListState['items']): ListState => ({ status: 'ready', items, error: null })

  it('counts nothing for B while the shared stores still hold project A records', async () => {
    const a = [{ id: 'x', projectId: 'a' }]
    await expect(observe({ tasks: ready(a), briefs: ready(a), conceptSets: ready(a) }, 'b')).resolves.toEqual({
      researchTasks: 0, opportunityBriefs: 0, conceptSets: 0, reviewRounds: 0, deliverables: 0,
    })
  })

  it('rejects instead of reporting stale A counts when the B load leaves a store unready', async () => {
    const a = [{ id: 'x', projectId: 'a' }]
    await expect(observe({ tasks: { status: 'error', items: a, error: null }, briefs: ready(a), conceptSets: ready(a) }, 'b'))
      .rejects.toThrow('fashion stage observation is not ready')
  })

  it('counts only B records once B has loaded', async () => {
    const mixed = [{ id: 'x', projectId: 'a' }, { id: 'y', projectId: 'b' }, { id: 'z', projectId: 'b' }]
    await expect(observe({ tasks: ready(mixed), briefs: ready(mixed.slice(0, 2)), conceptSets: ready([]) }, 'b')).resolves.toEqual({
      researchTasks: 2, opportunityBriefs: 1, conceptSets: 0, reviewRounds: 0, deliverables: 0,
    })
  })
})
