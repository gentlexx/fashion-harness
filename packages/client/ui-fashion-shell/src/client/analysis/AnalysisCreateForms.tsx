/** Manual F2-02 create forms: MarketItem, Signal, Cluster, Opportunity. */
import { useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type {
  Evidence,
  EvidenceGrade,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import type {
  DesignOpportunity,
  MarketItem,
  MarketItemType,
  PopularitySignal,
  PopularitySignalType,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { FashionKey } from '../locales.ts'
import css from '../FashionWorkspace.module.css'
import { SIGNAL_TYPE_LABELS } from './signal-type.ts'

const ITEM_TYPES: readonly MarketItemType[] = ['garment_product', 'content_post', 'trend_topic']
const SIGNAL_TYPES: readonly PopularitySignalType[] = [
  'search_growth',
  'rank_position',
  'view_count',
  'engagement',
  'save_rate',
  'sellout_claim',
  'cross_source_presence',
]
const GRADES: readonly EvidenceGrade[] = ['G0', 'G1', 'G2', 'G3']

function toggle(ids: readonly string[], id: string): readonly string[] {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]
}

function itemTypeKey(type: MarketItemType): FashionKey {
  switch (type) {
    case 'garment_product': return 'analysis.itemTypeGarment'
    case 'content_post': return 'analysis.itemTypeContent'
    case 'trend_topic': return 'analysis.itemTypeTopic'
  }
}

export type AnalysisCreateFormsProps = {
  readonly projectId: string
  readonly taskId: string
  readonly sources: ResearchListState<Source>
  readonly samples: ResearchListState<Sample>
  readonly evidence: ResearchListState<Evidence>
  readonly marketItems: readonly MarketItem[]
  readonly signals: readonly PopularitySignal[]
  readonly clusters: readonly TrendCluster[]
  readonly createMarketItem: (input: {
    projectId: string
    taskId: string
    itemType: MarketItemType
    displayName: string
    brandOrCreator: string | null
    categoryCandidate: string | null
    observationLinks: readonly {
      sampleId: string
      sourceId: string
      evidenceIds: readonly string[]
    }[]
  }) => Promise<MarketItem>
  readonly createPopularitySignal: (input: {
    projectId: string
    taskId: string
    signalType: PopularitySignalType
    subjectRefs: readonly { type: 'market_item'; id: string }[]
    platform: string
    observedAt: string
    rawValue: string
    rawUnit: string
    evidenceIds: readonly string[]
    methodVersion: string
    limitations: readonly string[]
  }) => Promise<PopularitySignal>
  readonly createTrendCluster: (input: {
    projectId: string
    taskId: string
    name: string
    definition: string
    memberRefs: readonly { type: 'market_item' | 'signal'; id: string }[]
    signalIds: readonly string[]
    clusterMethod: 'manual'
    methodVersion: string
    marketRegions: readonly string[]
    timeContext: string
    evidenceGrade: EvidenceGrade
    counterEvidence: readonly string[]
    biasesAndGaps: readonly string[]
  }) => Promise<TrendCluster>
  readonly createDesignOpportunity: (input: {
    projectId: string
    taskId: string
    title: string
    opportunityStatement: string
    trendClusterIds: readonly string[]
    targetMarket: string
    targetUserHypothesis: string
    category: string
    timing: string
    evidenceGrade: EvidenceGrade
  }) => Promise<DesignOpportunity>
  readonly t: (key: FashionKey) => string
}

/**
 * Human-only create forms that keep confirmed evidence as input, not a trend.
 * @param props - lists, Host create inject, translator.
 */
export function AnalysisCreateForms({
  projectId,
  taskId,
  sources,
  samples,
  evidence,
  marketItems,
  signals,
  clusters,
  createMarketItem,
  createPopularitySignal,
  createTrendCluster,
  createDesignOpportunity,
  t,
}: AnalysisCreateFormsProps) {
  const eligibleSources = sources.items.filter(row => row.archivedAt === null && row.availabilityStatus !== 'removed')
  const eligibleSamples = samples.items.filter(row => row.archivedAt === null && row.status !== 'archived')
  const confirmedEvidence = evidence.items.filter(row => row.archivedAt === null && row.reviewStatus === 'confirmed')

  return (
    <div className={css.sections} data-fashion-analysis="create">
      <p className={css.disclaimer}>{t('analysis.createHint')}</p>
      <ItemForm
        projectId={projectId}
        taskId={taskId}
        sources={eligibleSources}
        samples={eligibleSamples}
        evidence={confirmedEvidence}
        createMarketItem={createMarketItem}
        t={t}
      />
      <SignalForm
        projectId={projectId}
        taskId={taskId}
        items={marketItems}
        evidence={confirmedEvidence}
        createPopularitySignal={createPopularitySignal}
        t={t}
      />
      <ClusterForm
        projectId={projectId}
        taskId={taskId}
        items={marketItems}
        signals={signals}
        createTrendCluster={createTrendCluster}
        t={t}
      />
      <OpportunityForm
        projectId={projectId}
        taskId={taskId}
        clusters={clusters}
        createDesignOpportunity={createDesignOpportunity}
        t={t}
      />
    </div>
  )
}

function ItemForm(props: {
  readonly projectId: string
  readonly taskId: string
  readonly sources: readonly Source[]
  readonly samples: readonly Sample[]
  readonly evidence: readonly Evidence[]
  readonly createMarketItem: AnalysisCreateFormsProps['createMarketItem']
  readonly t: (key: FashionKey) => string
}) {
  const [displayName, setDisplayName] = useState('')
  const [itemType, setItemType] = useState<MarketItemType>('garment_product')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [sampleId, setSampleId] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [evidenceIds, setEvidenceIds] = useState<readonly string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSample = props.samples.find(row => String(row.id) === sampleId)

  const submit = async (): Promise<void> => {
    const name = displayName.trim()
    const resolvedSourceId = sourceId !== '' ? sourceId : (selectedSample !== undefined ? String(selectedSample.sourceId) : '')
    if (name.length < 1 || sampleId === '' || resolvedSourceId === '' || evidenceIds.length < 1) {
      setError(props.t('analysis.needConfirmed'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await props.createMarketItem({
        projectId: props.projectId,
        taskId: props.taskId,
        itemType,
        displayName: name,
        brandOrCreator: brand.trim() === '' ? null : brand.trim(),
        categoryCandidate: category.trim() === '' ? null : category.trim(),
        observationLinks: [{
          sampleId,
          sourceId: resolvedSourceId,
          evidenceIds,
        }],
      })
      setDisplayName('')
      setBrand('')
      setCategory('')
      setSampleId('')
      setSourceId('')
      setEvidenceIds([])
    } catch {
      setError(props.t('analysis.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={css.createForm} data-fashion-analysis="create-item">
      <h2 className={css.sectionTitle}>{props.t('analysis.createItem')}</h2>
      <label className={css.createLabel}>
        {props.t('analysis.displayName')}
        <Input
          value={displayName}
          onChange={(event) => { setDisplayName(event.target.value) }}
          data-fashion-analysis="item-name"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.itemType')}
        <select
          className={css.formControl}
          value={itemType}
          data-fashion-analysis="item-type"
          disabled={busy}
          onChange={(event) => { setItemType(event.target.value as MarketItemType) }}
        >
          {ITEM_TYPES.map(type => (
            <option key={type} value={type}>{props.t(itemTypeKey(type))}</option>
          ))}
        </select>
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.brandOptional')}
        <Input value={brand} onChange={(event) => { setBrand(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.category')}
        <Input
          value={category}
          onChange={(event) => { setCategory(event.target.value) }}
          data-fashion-analysis="item-category"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.selectSample')}
        <select
          className={css.formControl}
          value={sampleId}
          data-fashion-analysis="item-sample"
          disabled={busy}
          onChange={(event) => {
            setSampleId(event.target.value)
            const sample = props.samples.find(row => String(row.id) === event.target.value)
            if (sample !== undefined) setSourceId(String(sample.sourceId))
          }}
        >
          <option value="">{props.t('analysis.selectSample')}</option>
          {props.samples.map(sample => (
            <option key={String(sample.id)} value={String(sample.id)}>{sample.label}</option>
          ))}
        </select>
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.selectSource')}
        <select
          className={css.formControl}
          value={sourceId}
          data-fashion-analysis="item-source"
          disabled={busy}
          onChange={(event) => { setSourceId(event.target.value) }}
        >
          <option value="">{props.t('analysis.selectSource')}</option>
          {props.sources.map(source => (
            <option key={String(source.id)} value={String(source.id)}>{source.title}</option>
          ))}
        </select>
      </label>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectEvidence')}</legend>
        <p className={css.meta}>{props.t('analysis.confirmedOnly')}</p>
        {props.evidence.length === 0
          ? <p className={css.meta}>{props.t('analysis.noConfirmedEvidence')}</p>
          : (
            <ul className={css.optionList}>
              {props.evidence.map(item => (
                <li key={String(item.id)}>
                  <label>
                    <input
                      type="checkbox"
                      checked={evidenceIds.includes(String(item.id))}
                      data-fashion-analysis-evidence={String(item.id)}
                      disabled={busy}
                      onChange={() => { setEvidenceIds(toggle(evidenceIds, String(item.id))) }}
                    />
                    {item.observation.slice(0, 80)}
                    {item.observation.length > 80 ? '…' : ''}
                    {` · ${item.evidenceGrade}`}
                  </label>
                </li>
              ))}
            </ul>
          )}
      </fieldset>
      {error !== null ? <p className={css.disclaimer} role="alert">{error}</p> : null}
      <Button
        type="button"
        variant="primary"
        disabled={busy}
        data-fashion-analysis="item-submit"
        onClick={() => { void submit() }}
      >
        {props.t('analysis.submitCreate')}
      </Button>
    </section>
  )
}

function SignalForm(props: {
  readonly projectId: string
  readonly taskId: string
  readonly items: readonly MarketItem[]
  readonly evidence: readonly Evidence[]
  readonly createPopularitySignal: AnalysisCreateFormsProps['createPopularitySignal']
  readonly t: (key: FashionKey) => string
}) {
  const [signalType, setSignalType] = useState<PopularitySignalType>('cross_source_presence')
  const [platform, setPlatform] = useState('')
  const [rawValue, setRawValue] = useState('')
  const [rawUnit, setRawUnit] = useState('')
  const [methodVersion, setMethodVersion] = useState('human-v0')
  const [limitations, setLimitations] = useState('')
  const [itemIds, setItemIds] = useState<readonly string[]>([])
  const [evidenceIds, setEvidenceIds] = useState<readonly string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    if (platform.trim() === '' || rawValue.trim() === '' || rawUnit.trim() === '' || evidenceIds.length < 1) {
      setError(props.t('analysis.needConfirmed'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await props.createPopularitySignal({
        projectId: props.projectId,
        taskId: props.taskId,
        signalType,
        subjectRefs: itemIds.map(id => ({ type: 'market_item', id })),
        platform: platform.trim(),
        observedAt: new Date().toISOString(),
        rawValue: rawValue.trim(),
        rawUnit: rawUnit.trim(),
        evidenceIds,
        methodVersion: methodVersion.trim() === '' ? 'human-v0' : methodVersion.trim(),
        limitations: limitations.trim() === '' ? [] : [limitations.trim()],
      })
      setPlatform('')
      setRawValue('')
      setRawUnit('')
      setLimitations('')
      setItemIds([])
      setEvidenceIds([])
    } catch {
      setError(props.t('analysis.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={css.createForm} data-fashion-analysis="create-signal">
      <h2 className={css.sectionTitle}>{props.t('analysis.createSignal')}</h2>
      <label className={css.createLabel}>
        {props.t('analysis.signalType')}
        <select
          className={css.formControl}
          value={signalType}
          data-fashion-analysis="signal-type"
          disabled={busy}
          onChange={(event) => { setSignalType(event.target.value as PopularitySignalType) }}
        >
          {SIGNAL_TYPES.map(type => (
            <option key={type} value={type}>{props.t(SIGNAL_TYPE_LABELS[type])}</option>
          ))}
        </select>
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.platform')}
        <Input
          value={platform}
          onChange={(event) => { setPlatform(event.target.value) }}
          data-fashion-analysis="signal-platform"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.rawValue')}
        <Input
          value={rawValue}
          onChange={(event) => { setRawValue(event.target.value) }}
          data-fashion-analysis="signal-value"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.rawUnit')}
        <Input
          value={rawUnit}
          onChange={(event) => { setRawUnit(event.target.value) }}
          data-fashion-analysis="signal-unit"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.methodVersion')}
        <Input value={methodVersion} onChange={(event) => { setMethodVersion(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.limitations')}
        <textarea
          className={css.formTextarea}
          value={limitations}
          onChange={(event) => { setLimitations(event.target.value) }}
          disabled={busy}
        />
      </label>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectItems')}</legend>
        <ul className={css.optionList}>
          {props.items.map(item => (
            <li key={String(item.id)}>
              <label>
                <input
                  type="checkbox"
                  checked={itemIds.includes(String(item.id))}
                  disabled={busy}
                  onChange={() => { setItemIds(toggle(itemIds, String(item.id))) }}
                />
                {item.displayName}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectEvidence')}</legend>
        <p className={css.meta}>{props.t('analysis.confirmedOnly')}</p>
        {props.evidence.length === 0
          ? <p className={css.meta}>{props.t('analysis.noConfirmedEvidence')}</p>
          : (
            <ul className={css.optionList}>
              {props.evidence.map(item => (
                <li key={String(item.id)}>
                  <label>
                    <input
                      type="checkbox"
                      checked={evidenceIds.includes(String(item.id))}
                      data-fashion-analysis-signal-evidence={String(item.id)}
                      disabled={busy}
                      onChange={() => { setEvidenceIds(toggle(evidenceIds, String(item.id))) }}
                    />
                    {item.observation.slice(0, 80)}
                  </label>
                </li>
              ))}
            </ul>
          )}
      </fieldset>
      {error !== null ? <p className={css.disclaimer} role="alert">{error}</p> : null}
      <Button
        type="button"
        variant="primary"
        disabled={busy}
        data-fashion-analysis="signal-submit"
        onClick={() => { void submit() }}
      >
        {props.t('analysis.submitCreate')}
      </Button>
    </section>
  )
}

function ClusterForm(props: {
  readonly projectId: string
  readonly taskId: string
  readonly items: readonly MarketItem[]
  readonly signals: readonly PopularitySignal[]
  readonly createTrendCluster: AnalysisCreateFormsProps['createTrendCluster']
  readonly t: (key: FashionKey) => string
}) {
  const [name, setName] = useState('')
  const [definition, setDefinition] = useState('')
  const [timeContext, setTimeContext] = useState('')
  const [regions, setRegions] = useState('')
  const [grade, setGrade] = useState<EvidenceGrade>('G1')
  const [counter, setCounter] = useState('')
  const [gaps, setGaps] = useState('')
  const [itemIds, setItemIds] = useState<readonly string[]>([])
  const [signalIds, setSignalIds] = useState<readonly string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    const memberRefs = [
      ...itemIds.map(id => ({ type: 'market_item' as const, id })),
      ...signalIds.map(id => ({ type: 'signal' as const, id })),
    ]
    if (name.trim() === '' || definition.trim() === '' || timeContext.trim() === '' || memberRefs.length < 1) {
      setError(props.t('analysis.needConfirmed'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await props.createTrendCluster({
        projectId: props.projectId,
        taskId: props.taskId,
        name: name.trim(),
        definition: definition.trim(),
        memberRefs,
        signalIds,
        clusterMethod: 'manual',
        methodVersion: 'human-v0',
        marketRegions: regions.trim() === '' ? [] : regions.split(',').map(part => part.trim()).filter(part => part.length > 0),
        timeContext: timeContext.trim(),
        evidenceGrade: grade,
        counterEvidence: counter.trim() === '' ? [] : [counter.trim()],
        biasesAndGaps: gaps.trim() === '' ? [] : [gaps.trim()],
      })
      setName('')
      setDefinition('')
      setTimeContext('')
      setRegions('')
      setCounter('')
      setGaps('')
      setItemIds([])
      setSignalIds([])
    } catch {
      setError(props.t('analysis.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={css.createForm} data-fashion-analysis="create-cluster">
      <h2 className={css.sectionTitle}>{props.t('analysis.createCluster')}</h2>
      <label className={css.createLabel}>
        {props.t('analysis.clusterName')}
        <Input
          value={name}
          onChange={(event) => { setName(event.target.value) }}
          data-fashion-analysis="cluster-name"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.clusterDefinition')}
        <textarea
          className={css.formTextarea}
          value={definition}
          onChange={(event) => { setDefinition(event.target.value) }}
          data-fashion-analysis="cluster-definition"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.timeContext')}
        <Input
          value={timeContext}
          onChange={(event) => { setTimeContext(event.target.value) }}
          data-fashion-analysis="cluster-time"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.marketRegions')}
        <Input value={regions} onChange={(event) => { setRegions(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.evidenceGrade')}
        <select
          className={css.formControl}
          value={grade}
          disabled={busy}
          onChange={(event) => { setGrade(event.target.value as EvidenceGrade) }}
        >
          {GRADES.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.counterEvidence')}
        <textarea className={css.formTextarea} value={counter} onChange={(event) => { setCounter(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.gaps')}
        <textarea className={css.formTextarea} value={gaps} onChange={(event) => { setGaps(event.target.value) }} disabled={busy} />
      </label>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectItems')}</legend>
        <ul className={css.optionList}>
          {props.items.map(item => (
            <li key={String(item.id)}>
              <label>
                <input
                  type="checkbox"
                  checked={itemIds.includes(String(item.id))}
                  data-fashion-analysis-cluster-item={String(item.id)}
                  disabled={busy}
                  onChange={() => { setItemIds(toggle(itemIds, String(item.id))) }}
                />
                {item.displayName}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectSignals')}</legend>
        <ul className={css.optionList}>
          {props.signals.map(signal => (
            <li key={String(signal.id)}>
              <label>
                <input
                  type="checkbox"
                  checked={signalIds.includes(String(signal.id))}
                  disabled={busy}
                  onChange={() => { setSignalIds(toggle(signalIds, String(signal.id))) }}
                />
                {`${signal.platform} · ${props.t(SIGNAL_TYPE_LABELS[signal.signalType])}`}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      {error !== null ? <p className={css.disclaimer} role="alert">{error}</p> : null}
      <Button
        type="button"
        variant="primary"
        disabled={busy}
        data-fashion-analysis="cluster-submit"
        onClick={() => { void submit() }}
      >
        {props.t('analysis.submitCreate')}
      </Button>
    </section>
  )
}

function OpportunityForm(props: {
  readonly projectId: string
  readonly taskId: string
  readonly clusters: readonly TrendCluster[]
  readonly createDesignOpportunity: AnalysisCreateFormsProps['createDesignOpportunity']
  readonly t: (key: FashionKey) => string
}) {
  const [title, setTitle] = useState('')
  const [statement, setStatement] = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [category, setCategory] = useState('')
  const [timing, setTiming] = useState('')
  const [grade, setGrade] = useState<EvidenceGrade>('G1')
  const [clusterIds, setClusterIds] = useState<readonly string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    if (
      title.trim() === ''
      || statement.trim() === ''
      || targetMarket.trim() === ''
      || targetUser.trim() === ''
      || category.trim() === ''
      || timing.trim() === ''
      || clusterIds.length < 1
    ) {
      setError(props.t('analysis.needConfirmed'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await props.createDesignOpportunity({
        projectId: props.projectId,
        taskId: props.taskId,
        title: title.trim(),
        opportunityStatement: statement.trim(),
        trendClusterIds: clusterIds,
        targetMarket: targetMarket.trim(),
        targetUserHypothesis: targetUser.trim(),
        category: category.trim(),
        timing: timing.trim(),
        evidenceGrade: grade,
      })
      setTitle('')
      setStatement('')
      setTargetMarket('')
      setTargetUser('')
      setCategory('')
      setTiming('')
      setClusterIds([])
    } catch {
      setError(props.t('analysis.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={css.createForm} data-fashion-analysis="create-opportunity">
      <h2 className={css.sectionTitle}>{props.t('analysis.createOpportunity')}</h2>
      <label className={css.createLabel}>
        {props.t('analysis.opportunityTitle')}
        <Input
          value={title}
          onChange={(event) => { setTitle(event.target.value) }}
          data-fashion-analysis="opportunity-title"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.opportunityStatement')}
        <textarea
          className={css.formTextarea}
          value={statement}
          onChange={(event) => { setStatement(event.target.value) }}
          data-fashion-analysis="opportunity-statement"
          disabled={busy}
        />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.targetMarket')}
        <Input value={targetMarket} onChange={(event) => { setTargetMarket(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.targetUser')}
        <Input value={targetUser} onChange={(event) => { setTargetUser(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.category')}
        <Input value={category} onChange={(event) => { setCategory(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.timing')}
        <Input value={timing} onChange={(event) => { setTiming(event.target.value) }} disabled={busy} />
      </label>
      <label className={css.createLabel}>
        {props.t('analysis.evidenceGrade')}
        <select
          className={css.formControl}
          value={grade}
          disabled={busy}
          onChange={(event) => { setGrade(event.target.value as EvidenceGrade) }}
        >
          {GRADES.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <fieldset className={css.createLabel}>
        <legend>{props.t('analysis.selectClusters')}</legend>
        <ul className={css.optionList}>
          {props.clusters.map(cluster => (
            <li key={String(cluster.id)}>
              <label>
                <input
                  type="checkbox"
                  checked={clusterIds.includes(String(cluster.id))}
                  data-fashion-analysis-opportunity-cluster={String(cluster.id)}
                  disabled={busy}
                  onChange={() => { setClusterIds(toggle(clusterIds, String(cluster.id))) }}
                />
                {cluster.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      {error !== null ? <p className={css.disclaimer} role="alert">{error}</p> : null}
      <Button
        type="button"
        variant="primary"
        disabled={busy}
        data-fashion-analysis="opportunity-submit"
        onClick={() => { void submit() }}
      >
        {props.t('analysis.submitCreate')}
      </Button>
    </section>
  )
}
