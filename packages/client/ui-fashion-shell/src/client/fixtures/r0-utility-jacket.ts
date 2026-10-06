/** Controlled R0 public-rebuild fixture for F1-01 read-only overview. */

export interface R0Fixture {
  readonly projectId: string
  readonly title: string
  readonly market: string
  readonly category: string
  readonly evidenceStatus: string
  readonly updatedAt: string
  readonly briefSummary: string
  readonly evidenceGrade: string
  readonly recordedFacts: readonly string[]
  readonly inferences: readonly string[]
  readonly pendingValidation: readonly string[]
  readonly pipeline: readonly { readonly id: string; readonly label: string; readonly state: string }[]
}

export const R0_UTILITY_JACKET: R0Fixture = {
  projectId: 'r0-us-womens-khaki-utility-jacket',
  title: '美国女装卡其 Utility Jacket',
  market: '美国女装',
  category: 'Utility Jacket',
  evidenceStatus: '公开资料重建',
  updatedAt: '2026-09-21',
  briefSummary:
    '基于 Pinterest、Vogue 与 H&M、Zara、Mango、Nordstrom 公开页面重建的可复现任务包。用于验证项目入口与证据等级展示，不是真实客户项目。',
  evidenceGrade: '公开网页摘录（非实时热度）',
  recordedFacts: [
    '目标市场为美国女装',
    '品类聚焦卡其 Utility Jacket',
    '样本来自公开电商与趋势页面',
  ],
  inferences: [
    'Utility 细节与中性色可能仍具季节机会',
    '设计师审核前不得宣称商业验证',
  ],
  pendingValidation: [
    '真实设计师操作顺序与字段（R1）',
    '平台抓取合规与 live 数据策略',
  ],
  pipeline: [
    { id: 'research', label: '研究', state: 'recorded' },
    { id: 'opportunity', label: '机会', state: 'candidate' },
    { id: 'direction', label: '方向', state: 'candidate' },
    { id: 'review', label: '审核', state: 'recorded' },
    { id: 'export', label: '导出', state: 'recorded' },
  ],
}
