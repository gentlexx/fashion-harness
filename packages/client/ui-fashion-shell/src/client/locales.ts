/** Fashion shell locale dictionaries. */

export type FashionKey =
  | 'brand'
  | 'tagline'
  | 'flow'
  | 'nav.projects'
  | 'nav.agent'
  | 'nav.settings'
  | 'projects.eyebrow'
  | 'projects.heading'
  | 'projects.value'
  | 'projects.cta'
  | 'projects.open'
  | 'projects.new'
  | 'projects.publicBadge'
  | 'projects.updated'
  | 'projects.loading'
  | 'projects.loadError'
  | 'projects.retry'
  | 'projects.empty'
  | 'projects.createLabel'
  | 'projects.createSubmit'
  | 'projects.createCancel'
  | 'projects.creating'
  | 'projects.createEmpty'
  | 'projects.createTooLong'
  | 'projects.createFailed'
  | 'projects.searchPlaceholder'
  | 'projects.searchAria'
  | 'projects.filterAria'
  | 'overview.publicBadge'
  | 'overview.back'
  | 'overview.facts'
  | 'overview.inferences'
  | 'overview.pending'
  | 'overview.created'
  | 'overview.updated'
  | 'overview.empty'
  | 'overview.loadError'
  | 'overview.retry'
  | 'overview.loadingAria'
  | 'overview.statusSummary'
  | 'overview.records'
  | 'overview.basicInfo'
  | 'overview.nextStep'
  | 'overview.nextStepUser'
  | 'overview.nextStepR0'
  | 'overview.agentNoBind'
  | 'overview.disclaimer'
  | 'overview.market'
  | 'overview.category'
  | 'projectNotFound.title'
  | 'notFound.title'
  | 'notFound.back'
  | 'sidebar.expand'
  | 'sidebar.collapse'
  | 'sidebar.currentHeading'
  | 'sidebar.workNav'
  | 'agent.leadTitle'
  | 'agent.leadSubtitle'
  | 'agent.collaboration'
  | 'agent.noProject'
  | 'agent.projectLoading'
  | 'agent.sessionUnbound'
  | 'agent.openOverview'
  | 'agent.backProjects'
  | 'agent.stripNoProject'
  | 'agent.stripUnbound'
  | 'agent.readonlyAssist'
  | 'agent.boundStatus'
  | 'agent.dataScopeLabel'
  | 'agent.snapshotVersion'
  | 'agent.projectUpdated'
  | 'agent.contextFailed'
  | 'agent.projectUnavailable'
  | 'agent.conflictOther'
  | 'agent.needsConfirm'
  | 'agent.confirmBind'
  | 'agent.createBoundSession'
  | 'agent.scope.project'
  | 'agent.scope.research'
  | 'agent.scope.analysis'
  | 'agent.scope.brief'
  | 'agent.scope.directions'
  | 'agent.scope.review'
  | 'agent.scope.deliverable'
  | 'agent.scope.feedback'
  | 'agent.scope.evaluation'
  | 'agent.scope.improvement'
  | 'origin.user'
  | 'origin.publicRebuild'
  | 'access.editable'
  | 'access.readOnly'
  | 'capability.foundationReady'
  | 'capability.publicRebuild'
  | 'nextStep.openOverview'
  | 'nextStep.viewPublicCase'
  | 'section.recent'
  | 'section.public'
  | 'pipeline.recorded'
  | 'pipeline.candidate'
  | 'pipeline.pending'
  | 'pipeline.comingSoon'
  | 'filter.all'
  | 'filter.mine'
  | 'filter.public'
  | 'filter.empty'
  | 'filter.clear'
  | 'section.recentEmpty'
  | 'stage.research'
  | 'stage.opportunity'
  | 'stage.direction'
  | 'stage.review'
  | 'stage.export'
  | 'r0.cardDisclaimer'
  | 'r0.coverAlt'
  | 'overview.openResearch'
  | 'overview.openDirections'
  | 'research.homeTitle'
  | 'research.homeHint'
  | 'research.r0Readonly'
  | 'research.loading'
  | 'research.loadError'
  | 'research.retry'
  | 'research.empty'
  | 'research.emptySources'
  | 'research.emptySamples'
  | 'research.emptyEvidence'
  | 'research.createTask'
  | 'research.taskTitle'
  | 'research.taskNote'
  | 'research.creating'
  | 'research.createEmpty'
  | 'research.createFailed'
  | 'research.backOverview'
  | 'research.backTasks'
  | 'research.backTask'
  | 'research.readOnlyBanner'
  | 'research.sources'
  | 'research.samples'
  | 'research.evidence'
  | 'research.addSource'
  | 'research.sourceTitle'
  | 'research.sourceUrl'
  | 'research.sourceAttribution'
  | 'research.sourceKind'
  | 'research.invalidUrl'
  | 'research.addSample'
  | 'research.sampleLabel'
  | 'research.addEvidence'
  | 'research.observation'
  | 'research.claim'
  | 'research.claimType'
  | 'research.grade'
  | 'research.method'
  | 'research.limitations'
  | 'research.excerpt'
  | 'research.reviewConfirm'
  | 'research.reviewReject'
  | 'research.reviewNote'
  | 'research.reviewing'
  | 'research.reviewFailed'
  | 'research.submitting'
  | 'research.notFound'
  | 'research.sessionUnbound'
  | 'research.status'
  | 'research.accessedAt'
  | 'research.usageBoundary'
  | 'research.availability'
  | 'research.availabilityHint'
  | 'research.correctAvailability'
  | 'research.availabilitySave'
  | 'research.enum.unknown'
  | 'research.enum.taskStatus.draft'
  | 'research.enum.taskStatus.active'
  | 'research.enum.taskStatus.readyForReview'
  | 'research.enum.taskStatus.closed'
  | 'research.enum.taskStatus.archived'
  | 'research.enum.sampleStatus.draft'
  | 'research.enum.sampleStatus.readyForReview'
  | 'research.enum.sampleStatus.confirmed'
  | 'research.enum.sampleStatus.rejected'
  | 'research.enum.sampleStatus.archived'
  | 'research.enum.sourceKind.webPage'
  | 'research.enum.sourceKind.report'
  | 'research.enum.sourceKind.productPage'
  | 'research.enum.sourceKind.categoryPage'
  | 'research.enum.sourceKind.editorial'
  | 'research.enum.sourceKind.socialContent'
  | 'research.enum.sourceKind.internalFile'
  | 'research.enum.sourceKind.other'
  | 'research.enum.usageBoundary.publicAttributed'
  | 'research.enum.usageBoundary.projectPrivate'
  | 'research.enum.usageBoundary.viewOnly'
  | 'research.enum.availability.available'
  | 'research.enum.availability.unavailable'
  | 'research.enum.availability.removed'
  | 'research.enum.reviewStatus.draft'
  | 'research.enum.reviewStatus.pendingReview'
  | 'research.enum.reviewStatus.confirmed'
  | 'research.enum.reviewStatus.rejected'
  | 'research.enum.reviewStatus.invalidated'
  | 'research.enum.claimType.none'
  | 'claim.observed'
  | 'claim.derived'
  | 'claim.needs_validation'
  | 'analysis.homeTitle'
  | 'analysis.homeHint'
  | 'analysis.r0Readonly'
  | 'analysis.loading'
  | 'analysis.loadError'
  | 'analysis.retry'
  | 'analysis.empty'
  | 'analysis.backTask'
  | 'analysis.backAnalysis'
  | 'analysis.items'
  | 'analysis.signals'
  | 'analysis.clusters'
  | 'analysis.opportunities'
  | 'analysis.publicRebuild'
  | 'analysis.publicRebuildBanner'
  | 'analysis.staleBanner'
  | 'analysis.noHotScore'
  | 'analysis.notFound'
  | 'analysis.brand'
  | 'analysis.brandNotRecorded'
  | 'analysis.windowNotRecorded'
  | 'analysis.observations'
  | 'analysis.method'
  | 'analysis.window'
  | 'analysis.limitations'
  | 'analysis.members'
  | 'analysis.counterEvidence'
  | 'analysis.gaps'
  | 'analysis.targetMarket'
  | 'analysis.unknowns'
  | 'analysis.risks'
  | 'analysis.decisionNote'
  | 'analysis.decisionNoteRequired'
  | 'analysis.decisionFailed'
  | 'analysis.decideSelect'
  | 'analysis.decideReject'
  | 'analysis.decideMore'
  | 'analysis.openAnalysis'
  | 'analysis.createHint'
  | 'analysis.createItem'
  | 'analysis.createSignal'
  | 'analysis.createCluster'
  | 'analysis.createOpportunity'
  | 'analysis.displayName'
  | 'analysis.itemType'
  | 'analysis.itemTypeGarment'
  | 'analysis.itemTypeContent'
  | 'analysis.itemTypeTopic'
  | 'analysis.brandOptional'
  | 'analysis.category'
  | 'analysis.selectSample'
  | 'analysis.selectSource'
  | 'analysis.selectEvidence'
  | 'analysis.selectItems'
  | 'analysis.selectSignals'
  | 'analysis.selectClusters'
  | 'analysis.confirmedOnly'
  | 'analysis.noConfirmedEvidence'
  | 'analysis.needConfirmed'
  | 'analysis.createFailed'
  | 'analysis.submitCreate'
  | 'analysis.platform'
  | 'analysis.rawValue'
  | 'analysis.rawUnit'
  | 'analysis.signalType'
  | 'analysis.methodVersion'
  | 'analysis.clusterName'
  | 'analysis.clusterDefinition'
  | 'analysis.timeContext'
  | 'analysis.marketRegions'
  | 'analysis.evidenceGrade'
  | 'analysis.opportunityTitle'
  | 'analysis.opportunityStatement'
  | 'analysis.targetUser'
  | 'analysis.timing'
  | 'design.directionsTitle'
  | 'design.directionsHint'
  | 'design.r0Readonly'
  | 'design.loading'
  | 'design.loadError'
  | 'design.empty'
  | 'design.notFound'
  | 'design.backOverview'
  | 'design.backDirections'
  | 'design.backConcept'
  | 'design.openBrief'
  | 'design.briefTitle'
  | 'design.conceptSetStatus'
  | 'design.comparisonTitle'
  | 'design.comparisonPass'
  | 'design.comparisonFail'
  | 'design.noApprove'
  | 'design.season'
  | 'design.targetUser'
  | 'design.mustKeep'
  | 'design.mustAvoid'
  | 'design.unknowns'
  | 'design.silhouette'
  | 'design.proportion'
  | 'design.material'
  | 'design.construction'
  | 'design.function'
  | 'design.scenarios'
  | 'design.transformation'
  | 'design.similarityRisk'
  | 'design.productionUnknown'
  | 'design.visualsTitle'
  | 'design.visualTitle'
  | 'design.visualNotProduction'
  | 'design.aiDisclosure'
  | 'design.usageBoundary'
  | 'design.artifactRef'
  | 'design.artifactRefNone'
  | 'design.contentCredential'
  | 'design.contentCredentialNone'
  | 'design.conceptRevision'
  | 'design.form.reviseConcept'
  | 'design.form.reviseHint'
  | 'design.form.saveRevision'
  | 'design.form.cancelRevision'
  | 'design.error.conflict'
  | 'design.error.notFound'
  | 'design.error.precondition'
  | 'design.error.readOnly'
  | 'design.error.failed'
  | 'design.status.draft'
  | 'design.status.confirmed'
  | 'design.status.reviewReady'
  | 'design.status.stale'
  | 'design.status.archived'
  | 'design.diff.other'
  | 'design.diff.colorOnly'
  | 'design.diff.structuralHits'
  | 'design.noConceptSet'
  | 'design.markReviewReady'
  | 'design.goReview'
  | 'design.form.market'
  | 'design.form.category'
  | 'design.form.brandContext'
  | 'design.form.differentiationGoals'
  | 'design.form.materialsConstraints'
  | 'design.form.costConstraints'
  | 'design.form.productionConstraints'
  | 'design.form.requiredMissing'
  | 'design.form.createBrief'
  | 'design.form.createBriefHint'
  | 'design.form.fromOpportunity'
  | 'design.form.opportunityRevision'
  | 'design.form.opportunityNotSelected'
  | 'design.form.constraintHint'
  | 'design.form.saving'
  | 'design.form.confirmBrief'
  | 'design.form.createConceptSet'
  | 'design.form.conceptName'
  | 'design.form.designIntent'
  | 'design.form.colorDirection'
  | 'design.form.addConcept'
  | 'design.form.conceptCount'
  | 'design.form.conceptHint'
  | 'review.homeTitle'
  | 'review.homeHint'
  | 'review.r0Readonly'
  | 'review.r0DemoBanner'
  | 'review.loading'
  | 'review.loadError'
  | 'review.notFound'
  | 'review.backOverview'
  | 'review.backReviews'
  | 'review.openReview'
  | 'review.opening'
  | 'review.openFailed'
  | 'review.roundTitle'
  | 'review.roundItem'
  | 'review.roundStatus'
  | 'review.openedAt'
  | 'review.enum.status.open'
  | 'review.enum.status.changesRequested'
  | 'review.enum.status.needsResearch'
  | 'review.enum.status.rejected'
  | 'review.enum.status.approved'
  | 'review.enum.status.invalidated'
  | 'review.enum.status.archived'
  | 'review.validityTitle'
  | 'review.validityValid'
  | 'review.validityInvalid'
  | 'review.conceptsTitle'
  | 'review.selected'
  | 'review.selectConcept'
  | 'review.approveSelected'
  | 'review.approving'
  | 'review.requestRevision'
  | 'review.reject'
  | 'review.needsResearch'
  | 'review.revokeApproval'
  | 'review.generateDeliverable'
  | 'review.generating'
  | 'review.openDeliverable'
  | 'review.openDeliverables'
  | 'review.actionFailed'
  | 'review.notRealApproval'
  | 'deliverable.homeTitle'
  | 'deliverable.homeHint'
  | 'deliverable.r0Readonly'
  | 'deliverable.loadError'
  | 'deliverable.notFound'
  | 'deliverable.backOverview'
  | 'deliverable.backReviews'
  | 'deliverable.backDeliverables'
  | 'deliverable.detailTitle'
  | 'deliverable.status'
  | 'deliverable.kind'
  | 'deliverable.kindJson'
  | 'deliverable.kindMarkdown'
  | 'deliverable.kindManifest'
  | 'deliverable.audience'
  | 'deliverable.snapshotHash'
  | 'deliverable.limitations'
  | 'deliverable.artifactsTitle'
  | 'deliverable.verify'
  | 'deliverable.verifying'
  | 'deliverable.verifyOk'
  | 'deliverable.verifyFail'
  | 'overview.openReview'
  | 'overview.openDeliverables'
  | 'overview.openFeedback'
  | 'overview.openOutcomes'
  | 'overview.openEvaluations'
  | 'overview.openImprovements'
  | 'overview.followUp'
  | 'overview.followUpHint'
  | 'overview.followUpReadOnly'
  | 'deliverable.openFollowUp'
  | 'feedback.homeTitle'
  | 'feedback.r0Banner'
  | 'feedback.empty'
  | 'feedback.subjective'
  | 'outcomes.homeTitle'
  | 'outcomes.notAvailable'
  | 'outcomes.noZero'
  | 'evaluations.homeTitle'
  | 'evaluations.r0Banner'
  | 'evaluations.empty'
  | 'evaluations.noScore'
  | 'evaluations.autoRules'
  | 'evaluations.humanNotAssessed'
  | 'improvements.homeTitle'
  | 'improvements.empty'
  | 'improvements.acceptHint'
  | 'improvements.accept'
  | 'improvements.decisionReason'
  | 'improvements.acceptFailed'
  | 'improvements.userTest'
  | 'improvements.source'
  | 'improvements.project'
  | 'improvements.dataReality'
  | 'improvements.reason'
  | 'feedback.formTitle'
  | 'feedback.subjectType'
  | 'feedback.subjectId'
  | 'feedback.subjectRevision'
  | 'feedback.revision.concept'
  | 'feedback.revision.brief'
  | 'feedback.revision.opportunity'
  | 'feedback.revision.evidence'
  | 'feedback.revision.workflowStep'
  | 'feedback.action'
  | 'feedback.chooseAction'
  | 'feedback.reasonCode'
  | 'feedback.reasonText'
  | 'feedback.modificationArea'
  | 'feedback.modificationSummary'
  | 'feedback.professionalValidity'
  | 'feedback.revisionEffort'
  | 'feedback.timeSaved'
  | 'feedback.followUp'
  | 'feedback.dataReality'
  | 'feedback.visibility'
  | 'feedback.submit'
  | 'feedback.submitting'
  | 'feedback.success'
  | 'feedback.conflict'
  | 'feedback.readOnly'
  | 'feedback.validation'
  | 'feedback.error'
  | 'feedback.correct'
  | 'feedback.correctionReason'
  | 'feedback.exactTarget'
  | 'feedback.supersedes'
  | 'outcomes.deliverableId'
  | 'outcomes.conceptId'
  | 'outcomes.revision'
  | 'outcomes.availability'
  | 'outcomes.reason'
  | 'outcomes.asOf'
  | 'outcomes.availabilityForm'
  | 'outcomes.developmentForm'
  | 'outcomes.metricForm'
  | 'outcomes.submitAvailability'
  | 'outcomes.submitDevelopment'
  | 'outcomes.submitMetric'
  | 'outcomes.success'
  | 'outcomes.stage'
  | 'outcomes.context'
  | 'outcomes.metricKey'
  | 'outcomes.metricValue'
  | 'outcomes.unavailable'
  | 'outcomes.windowStart'
  | 'outcomes.windowEnd'
  | 'outcomes.region'
  | 'outcomes.channel'
  | 'outcomes.limitations'
  | 'evaluations.run'
  | 'evaluations.loading'
  | 'evaluations.loadError'
  | 'evaluations.retry'
  | 'evaluations.running'
  | 'evaluations.runFailed'
  | 'evaluations.definition'
  | 'evaluations.cases'
  | 'evaluations.assessmentReason'
  | 'evaluations.submitAssessment'
  | 'evaluations.exportReport'
  | 'evaluations.exported'
  | 'evaluations.exporting'
  | 'evaluations.exportFailed'
  | 'evaluations.reportArtifacts'
  | 'evaluations.artifactJson'
  | 'evaluations.artifactMarkdown'
  | 'evaluations.viewArtifact'
  | 'evaluations.hideArtifact'
  | 'evaluations.downloadArtifact'
  | 'evaluations.status.pass'
  | 'evaluations.status.fail'
  | 'evaluations.status.warning'
  | 'evaluations.status.notApplicable'
  | 'evaluations.status.error'
  | 'deliverable.package'
  | 'deliverable.revision'
  | 'deliverable.verifyMismatch'
  | 'deliverable.verifyError'
  | 'deliverable.verifyMissingArtifact'
  | 'deliverable.verifySnapshotMismatch'
  | 'deliverable.verifyArtifactCount'
  | 'deliverable.verifyOtherCheck'
  | 'deliverable.enum.audience.internalReview'
  | 'deliverable.enum.audience.designerHandoff'
  | 'deliverable.enum.audience.publicPortfolio'
  | 'deliverable.enum.status.generating'
  | 'deliverable.enum.status.ready'
  | 'deliverable.enum.status.failed'
  | 'deliverable.enum.status.invalidated'
  | 'deliverable.enum.status.withdrawn'
  | 'deliverable.enum.status.archived'
  | 'review.enum.cause.upstreamStale'
  | 'review.enum.cause.briefRevisionChanged'
  | 'review.enum.cause.conceptSetRevisionChanged'
  | 'review.enum.cause.conceptRevisionChanged'
  | 'review.enum.cause.visualReferenceWithdrawn'
  | 'review.enum.cause.approvalRevoked'
  | 'review.enum.cause.evidenceWithdrawn'
  | 'review.enum.cause.artifactIntegrityFailed'
  | 'review.decisionReason'
  | 'review.decisionReasonRequired'
  | 'feedback.targetDeliverable'
  | 'feedback.conceptRevision'
  | 'feedback.followUpMissing'
  | 'feedback.followUpStale'
  | 'feedback.enum.subject.deliverable'
  | 'feedback.enum.subject.concept'
  | 'feedback.enum.subject.brief'
  | 'feedback.enum.subject.opportunity'
  | 'feedback.enum.subject.evidence'
  | 'feedback.enum.subject.workflowStep'
  | 'feedback.enum.action.adopted'
  | 'feedback.enum.action.modified'
  | 'feedback.enum.action.rejected'
  | 'feedback.enum.action.ignored'
  | 'feedback.enum.action.needsFollowUp'
  | 'feedback.enum.action.unableToAssess'
  | 'feedback.enum.reason.evidenceUseful'
  | 'feedback.enum.reason.evidenceMissing'
  | 'feedback.enum.reason.other'
  | 'feedback.enum.validity.valid'
  | 'feedback.enum.validity.partlyValid'
  | 'feedback.enum.validity.invalid'
  | 'feedback.enum.validity.unknown'
  | 'feedback.enum.effort.none'
  | 'feedback.enum.effort.light'
  | 'feedback.enum.effort.moderate'
  | 'feedback.enum.effort.heavy'
  | 'feedback.enum.effort.unknown'
  | 'feedback.enum.time.notEstimated'
  | 'feedback.enum.time.none'
  | 'feedback.enum.time.under15m'
  | 'feedback.enum.time.m15to30'
  | 'feedback.enum.time.m30to60'
  | 'feedback.enum.time.over60m'
  | 'feedback.enum.reality.userTest'
  | 'feedback.enum.reality.realWork'
  | 'feedback.enum.reality.recordedDemo'
  | 'feedback.enum.visibility.projectPrivate'
  | 'feedback.enum.visibility.internalDemo'
  | 'feedback.enum.visibility.viewOnly'
  | 'outcomes.enum.availability.notYetObserved'
  | 'outcomes.enum.availability.notAvailable'
  | 'outcomes.enum.availability.notAuthorized'
  | 'outcomes.enum.availability.availablePartial'
  | 'outcomes.enum.availability.available'
  | 'outcomes.enum.stage.handedOff'
  | 'outcomes.enum.stage.sampled'
  | 'outcomes.enum.stage.revisedAfterSample'
  | 'outcomes.enum.stage.produced'
  | 'outcomes.enum.stage.listed'
  | 'outcomes.enum.stage.selling'
  | 'outcomes.enum.stage.closed'
  | 'outcomes.enum.stage.stopped'
  | 'evaluations.runLabel'
  | 'evaluations.followUpContext'
  | 'evaluations.followUpProjectScope'
  | 'evaluations.enum.rating.meets'
  | 'evaluations.enum.rating.partlyMeets'
  | 'evaluations.enum.rating.doesNotMeet'
  | 'evaluations.enum.rating.unableToAssess'
  | 'evaluations.enum.verdict.pass'
  | 'evaluations.enum.verdict.partial'
  | 'evaluations.enum.verdict.fail'
  | 'evaluations.enum.verdict.error'
  | 'evaluations.enum.execution.completed'
  | 'evaluations.enum.execution.partial'
  | 'evaluations.enum.execution.failed'
  | 'evaluations.enum.execution.cancelled'
  | 'evaluations.enum.definition.draft'
  | 'evaluations.enum.definition.published'
  | 'evaluations.enum.definition.retired'
  | 'evaluations.enum.severity.blocker'
  | 'evaluations.enum.severity.major'
  | 'evaluations.enum.severity.minor'
  | 'evaluations.enum.severity.info'
  | 'evaluations.caseNegative'
  | 'evaluations.criterion'
  | 'improvements.enum.status.proposed'
  | 'improvements.enum.status.accepted'
  | 'improvements.enum.status.deferred'
  | 'improvements.enum.status.planned'
  | 'improvements.enum.status.resolved'
  | 'improvements.enum.status.wontFix'
  | 'improvements.enum.status.superseded'
  | 'improvements.enum.status.reopened'
  | 'analysis.enum.dedupe.unreviewed'
  | 'analysis.enum.dedupe.candidateMatch'
  | 'analysis.enum.dedupe.confirmedSame'
  | 'analysis.enum.dedupe.confirmedDistinct'
  | 'analysis.enum.objectStatus.active'
  | 'analysis.enum.objectStatus.stale'
  | 'analysis.enum.objectStatus.invalidated'
  | 'analysis.enum.objectStatus.archived'
  | 'analysis.enum.review.candidate'
  | 'analysis.enum.review.selected'
  | 'analysis.enum.review.rejected'
  | 'analysis.enum.review.needsMoreResearch'
  | 'analysis.enum.signalType.searchGrowth'
  | 'analysis.enum.signalType.rankPosition'
  | 'analysis.enum.signalType.viewCount'
  | 'analysis.enum.signalType.engagement'
  | 'analysis.enum.signalType.saveRate'
  | 'analysis.enum.signalType.selloutClaim'
  | 'analysis.enum.signalType.crossSourcePresence'
  | 'common.labelSeparator'
  | 'common.listSeparator'
  | 'overview.stagesLoading'
  | 'overview.stagesError'

export const NS = 'fashion'

export const zh: Record<FashionKey, string> = {
  brand: 'Fashion Harness',
  tagline: '面向服装设计师与设计团队',
  flow: '海外信号 → 证据化机会 → 设计方向 → 人工审核',
  'nav.projects': '项目',
  'nav.agent': 'Agent 工作区',
  'nav.settings': '设置',
  'projects.eyebrow': '项目',
  'projects.heading': '设计项目',
  'projects.value': '从公开信号与设计项目入口开始，证据优先、人工审核。',
  'projects.cta': '继续公开案例',
  'projects.open': '打开项目',
  'projects.new': '新建设计项目',
  'projects.publicBadge': '公开资料重建案例',
  'projects.updated': '更新',
  'projects.loading': '正在加载项目…',
  'projects.loadError': '无法加载项目列表',
  'projects.retry': '重试',
  'projects.empty': '暂无项目',
  'projects.createLabel': '项目名称',
  'projects.createSubmit': '创建',
  'projects.createCancel': '取消',
  'projects.creating': '创建中…',
  'projects.createEmpty': '请输入项目名称',
  'projects.createTooLong': '项目名称不能超过 120 个字符',
  'projects.createFailed': '创建失败，请重试',
  'projects.searchPlaceholder': '按项目名称搜索',
  'projects.searchAria': '搜索项目',
  'projects.filterAria': '按来源筛选',
  'overview.publicBadge': '公开资料重建案例／非真实客户项目',
  'overview.back': '返回项目列表',
  'overview.facts': '已记录事实',
  'overview.inferences': '推断',
  'overview.pending': '待验证',
  'overview.created': '创建',
  'overview.updated': '更新',
  'overview.empty': '项目已建立。可进入研究登记 URL 来源与文本证据。',
  'overview.loadError': '无法加载项目',
  'overview.retry': '重试',
  'overview.loadingAria': '正在加载项目概览',
  'overview.statusSummary': '状态摘要',
  'overview.records': '项目记录',
  'overview.basicInfo': '基本信息',
  'overview.nextStep': '下一步',
  'overview.nextStepUser': '进入研究登记来源与证据，或打开 Agent 讨论。',
  'overview.nextStepR0': '查看案例结构，或进入 Agent 讨论。',
  'overview.agentNoBind': 'Agent 不会自动读取或写入本项目；上下文仅来自当前页面。',
  'overview.disclaimer': '公开网页摘录 · 非实时热度 · 非真实客户项目',
  'overview.market': '市场',
  'overview.category': '品类',
  'projectNotFound.title': '未找到项目',
  'notFound.title': '未找到页面',
  'notFound.back': '返回项目',
  'sidebar.expand': '展开侧栏',
  'sidebar.collapse': '收起侧栏',
  'sidebar.currentHeading': '当前项目',
  'sidebar.workNav': '工作导航',
  'agent.leadTitle': 'Fashion Harness · Agent 协作',
  'agent.leadSubtitle': '用对话梳理设计目标与证据，不自动改写项目',
  'agent.collaboration': '可讨论研究线索、机会假设与方向草稿；正式项目数据仍在 Projects / Overview 中维护。',
  'agent.noProject': '未选择项目 — 可先返回项目列表，或继续通用对话。',
  'agent.projectLoading': '正在解析当前界面项目…',
  'agent.sessionUnbound': '仅界面上下文：项目未绑定此会话，Agent 不会自动读取或写入 Project。',
  'agent.openOverview': '打开项目概览',
  'agent.backProjects': '返回项目',
  'agent.stripNoProject': '未选择项目',
  'agent.stripUnbound': '仅界面上下文，未绑定此会话',
  'agent.readonlyAssist': '只读辅助，不会自动修改项目',
  'agent.boundStatus': '已绑定当前项目',
  'agent.dataScopeLabel': '本轮授权数据范围',
  'agent.snapshotVersion': '上下文版本',
  'agent.projectUpdated': '项目更新时间',
  'agent.contextFailed': '项目上下文生成失败，本轮未注入项目数据',
  'agent.projectUnavailable': '项目不存在、不可访问或绑定已失效，已停止注入上下文',
  'agent.conflictOther': '当前会话已绑定其他项目，不会静默切换。请新建该项目会话，或返回项目概览。',
  'agent.needsConfirm': '当前会话已有消息但尚未绑定项目。确认绑定此项目，或新建该项目会话。',
  'agent.confirmBind': '确认绑定此项目',
  'agent.createBoundSession': '新建该项目会话',
  'agent.scope.project': '项目',
  'agent.scope.research': '研究',
  'agent.scope.analysis': '分析',
  'agent.scope.brief': 'Brief',
  'agent.scope.directions': '方向',
  'agent.scope.review': '审核',
  'agent.scope.deliverable': '交付',
  'agent.scope.feedback': '反馈',
  'agent.scope.evaluation': '评测',
  'agent.scope.improvement': '改进',
  'origin.user': '自建设计项目',
  'origin.publicRebuild': '公开资料重建案例',
  'access.editable': '可编辑',
  'access.readOnly': '只读示例',
  'capability.foundationReady': '基础项目已建立',
  'capability.publicRebuild': '公开资料重建／只读示例',
  'nextStep.openOverview': '打开概览',
  'nextStep.viewPublicCase': '查看案例总览',
  'section.recent': '最近项目',
  'section.public': '公开案例',
  'pipeline.recorded': '已记录',
  'pipeline.candidate': '候选',
  'pipeline.pending': '待处理',
  'pipeline.comingSoon': '未开放',
  'filter.all': '全部',
  'filter.mine': '我的项目',
  'filter.public': '公开案例',
  'filter.empty': '没有匹配项目',
  'filter.clear': '清除筛选',
  'section.recentEmpty': '还没有自建设计项目',
  'stage.research': '研究',
  'stage.opportunity': '机会',
  'stage.direction': '方向',
  'stage.review': '审核',
  'stage.export': '导出',
  'r0.cardDisclaimer': '非实时数据／非真实客户项目',
  'r0.coverAlt': '卡其装饰色块',
  'overview.openResearch': '打开研究',
  'overview.openDirections': '打开方向',
  'research.homeTitle': '研究任务',
  'research.homeHint': '组织可追溯来源与证据；不自动抓取，不形成趋势结论。',
  'research.r0Readonly': 'R0 公开重建研究只读；页面变化不覆盖已记录语义。',
  'research.loading': '正在加载研究…',
  'research.loadError': '无法加载研究数据',
  'research.retry': '重试',
  'research.empty': '还没有研究任务',
  'research.emptySources': '还没有来源',
  'research.emptySamples': '还没有样本',
  'research.emptyEvidence': '还没有证据',
  'research.createTask': '创建研究任务',
  'research.taskTitle': '任务名称',
  'research.taskNote': '备注（可选）',
  'research.creating': '提交中…',
  'research.createEmpty': '请填写必填项',
  'research.createFailed': '提交失败，请重试',
  'research.backOverview': '返回概览',
  'research.backTasks': '返回任务列表',
  'research.backTask': '返回任务',
  'research.readOnlyBanner': '只读：不可创建或修改',
  'research.sources': '来源',
  'research.samples': '样本',
  'research.evidence': '证据',
  'research.addSource': '登记 URL 来源',
  'research.sourceTitle': '来源标题',
  'research.sourceUrl': 'URL（http/https）',
  'research.sourceAttribution': '归属说明',
  'research.sourceKind': '来源类型',
  'research.invalidUrl': '请输入合法的 http(s) URL，且不含凭证',
  'research.addSample': '添加样本',
  'research.sampleLabel': '样本标签',
  'research.addEvidence': '添加证据',
  'research.observation': '观察（直接可见）',
  'research.claim': '主张（可选）',
  'research.claimType': '主张类型',
  'research.grade': '证据等级',
  'research.method': '方法（derived 必填）',
  'research.limitations': '局限（每行一条）',
  'research.excerpt': '摘录（可选）',
  'research.reviewConfirm': '确认',
  'research.reviewReject': '驳回',
  'research.reviewNote': '审核备注',
  'research.reviewing': '审核中…',
  'research.reviewFailed': '审核失败',
  'research.submitting': '提交中…',
  'research.notFound': '未找到该研究对象',
  'research.sessionUnbound': '此会话尚未与项目数据绑定；Agent 不会自动读取研究证据。',
  'research.status': '状态',
  'research.accessedAt': '访问时间',
  'research.usageBoundary': '使用边界',
  'research.availability': '登记状态',
  'research.availabilityHint': '这是来源登记时记录的状态，不是当前联网访问验证。当前环境 Access Denied 只能作为观察证据，不能自动改写这条登记。',
  'research.correctAvailability': '更正登记状态',
  'research.availabilitySave': '保存登记状态',
  'research.enum.unknown': '未知',
  'research.enum.taskStatus.draft': '草稿',
  'research.enum.taskStatus.active': '进行中',
  'research.enum.taskStatus.readyForReview': '待审核',
  'research.enum.taskStatus.closed': '已关闭',
  'research.enum.taskStatus.archived': '已归档',
  'research.enum.sampleStatus.draft': '草稿',
  'research.enum.sampleStatus.readyForReview': '待审核',
  'research.enum.sampleStatus.confirmed': '已确认',
  'research.enum.sampleStatus.rejected': '已驳回',
  'research.enum.sampleStatus.archived': '已归档',
  'research.enum.sourceKind.webPage': '网页',
  'research.enum.sourceKind.report': '报告',
  'research.enum.sourceKind.productPage': '商品页',
  'research.enum.sourceKind.categoryPage': '类目页',
  'research.enum.sourceKind.editorial': '编辑内容',
  'research.enum.sourceKind.socialContent': '社交内容',
  'research.enum.sourceKind.internalFile': '内部文件',
  'research.enum.sourceKind.other': '其他',
  'research.enum.usageBoundary.publicAttributed': '公开可归因',
  'research.enum.usageBoundary.projectPrivate': '项目私有',
  'research.enum.usageBoundary.viewOnly': '仅查看',
  'research.enum.availability.available': '已登记为可访问',
  'research.enum.availability.unavailable': '不可用',
  'research.enum.availability.removed': '已移除',
  'research.enum.reviewStatus.draft': '草稿',
  'research.enum.reviewStatus.pendingReview': '待审核',
  'research.enum.reviewStatus.confirmed': '已确认',
  'research.enum.reviewStatus.rejected': '已驳回',
  'research.enum.reviewStatus.invalidated': '已作废',
  'research.enum.claimType.none': '无',
  'claim.observed': '观察到的',
  'claim.derived': '推导',
  'claim.needs_validation': '待验证',
  'analysis.homeTitle': '分析',
  'analysis.homeHint': '将已确认证据规范为商品项、信号、趋势簇与设计机会。不做热度总分。',
  'analysis.r0Readonly': 'R0 公开重建分析只读；已记录决定仅作文档重建，不冒充真实设计师采用。',
  'analysis.loading': '正在加载分析…',
  'analysis.loadError': '分析加载失败',
  'analysis.retry': '重试',
  'analysis.empty': '尚无分析对象',
  'analysis.backTask': '返回任务',
  'analysis.backAnalysis': '返回分析',
  'analysis.items': '商品项',
  'analysis.signals': '热度信号',
  'analysis.clusters': '趋势簇',
  'analysis.opportunities': '设计机会',
  'analysis.publicRebuild': '公开重建记录',
  'analysis.publicRebuildBanner': '仅公开重建记录的决定——不冒充真实设计师采用。',
  'analysis.staleBanner': '上游证据变化后该机会已过期，不能进入 F3。',
  'analysis.noHotScore': '信号保留平台指标语义；没有跨平台热度总分。',
  'analysis.notFound': '未找到分析对象',
  'analysis.brand': '品牌 / 创作者',
  'analysis.brandNotRecorded': '未记录',
  'analysis.windowNotRecorded': '未记录',
  'analysis.observations': '观察链接',
  'analysis.method': '方法版本',
  'analysis.window': '时间窗',
  'analysis.limitations': '限制',
  'analysis.members': '成员',
  'analysis.counterEvidence': '反例',
  'analysis.gaps': '偏差与缺口',
  'analysis.targetMarket': '目标市场',
  'analysis.unknowns': '未知项',
  'analysis.risks': '抄袭 / IP 风险',
  'analysis.decisionNote': '决定备注',
  'analysis.decisionNoteRequired': '请填写决定备注',
  'analysis.decisionFailed': '决定失败',
  'analysis.decideSelect': '选择',
  'analysis.decideReject': '拒绝',
  'analysis.decideMore': '需要更多研究',
  'analysis.openAnalysis': '打开分析',
  'analysis.createHint': '根据已确认来源、样本和证据人工创建分析对象。确认证据不会自动变成趋势结论。',
  'analysis.createItem': '创建商品项',
  'analysis.createSignal': '创建热度信号',
  'analysis.createCluster': '创建趋势簇',
  'analysis.createOpportunity': '创建设计机会',
  'analysis.displayName': '显示名称',
  'analysis.itemType': '对象类型',
  'analysis.itemTypeGarment': '服装商品',
  'analysis.itemTypeContent': '内容帖',
  'analysis.itemTypeTopic': '趋势主题',
  'analysis.brandOptional': '品牌 / 创作者（可选）',
  'analysis.category': '品类',
  'analysis.selectSample': '选择样本',
  'analysis.selectSource': '选择来源',
  'analysis.selectEvidence': '选择已确认证据',
  'analysis.selectItems': '引用商品项',
  'analysis.selectSignals': '引用信号',
  'analysis.selectClusters': '引用趋势簇',
  'analysis.confirmedOnly': '只有已确认证据可以进入有效分析对象。',
  'analysis.noConfirmedEvidence': '此任务还没有已确认证据。',
  'analysis.needConfirmed': '请填写必填项，并选择已确认来源、样本或证据。',
  'analysis.createFailed': '创建失败',
  'analysis.submitCreate': '创建',
  'analysis.platform': '平台',
  'analysis.rawValue': '原始值',
  'analysis.rawUnit': '原始单位',
  'analysis.signalType': '信号类型',
  'analysis.methodVersion': '方法版本',
  'analysis.clusterName': '趋势簇名称',
  'analysis.clusterDefinition': '定义',
  'analysis.timeContext': '时间上下文',
  'analysis.marketRegions': '市场地区（逗号分隔）',
  'analysis.evidenceGrade': '证据等级',
  'analysis.opportunityTitle': '机会标题',
  'analysis.opportunityStatement': '机会陈述',
  'analysis.targetUser': '目标用户假设',
  'analysis.timing': '时机',
  'design.directionsTitle': '设计方向',
  'design.directionsHint': '基于已确认 Brief 的三方向比较。F3-01 不批准、不导出。',
  'design.r0Readonly': 'R0 公开重建设计只读；离线草案不是真实客户成果。',
  'design.loading': '正在加载设计…',
  'design.loadError': '设计加载失败',
  'design.empty': '尚无设计 Brief 或方向',
  'design.notFound': '未找到设计对象',
  'design.backOverview': '返回概览',
  'design.backDirections': '返回方向',
  'design.backConcept': '返回方向详情',
  'design.openBrief': '打开 Brief',
  'design.briefTitle': '设计 Brief',
  'design.conceptSetStatus': '方向组状态',
  'design.comparisonTitle': '结构化比较',
  'design.comparisonPass': '三组 pairwise 结构差异通过（仅颜色不算）。',
  'design.comparisonFail': '差异预检未通过；请修正结构字段。',
  'design.noApprove': '本模块无批准／拒绝／导出。',
  'design.season': '季节',
  'design.targetUser': '目标用户',
  'design.mustKeep': '必须保留',
  'design.mustAvoid': '必须避免',
  'design.unknowns': '开放问题',
  'design.silhouette': '廓形',
  'design.proportion': '比例与长度',
  'design.material': '材料方向',
  'design.construction': '结构与细节',
  'design.function': '功能价值',
  'design.scenarios': '使用场景',
  'design.transformation': '原创转化',
  'design.similarityRisk': '相似风险（非法律意见）',
  'design.productionUnknown': '生产未知项',
  'design.visualsTitle': '视觉草案',
  'design.visualTitle': '视觉草案详情',
  'design.visualNotProduction': '视觉草案不是生产规格；不含面料性能或侵权保证。',
  'design.aiDisclosure': '来源披露',
  'design.usageBoundary': '使用边界',
  'design.artifactRef': '资产引用',
  'design.artifactRefNone': '尚无资产',
  'design.contentCredential': 'Content Credential',
  'design.contentCredentialNone': '未记录凭证',
  'design.conceptRevision': '修订',
  'design.form.reviseConcept': '修改方向',
  'design.form.reviseHint': '保存后会以新修订重新检查结构差异；概念集回到草稿状态。',
  'design.form.saveRevision': '保存修改',
  'design.form.cancelRevision': '取消修改',
  'design.error.conflict': '记录已被更新，请刷新后重试。',
  'design.error.notFound': '引用的设计记录不存在或已被替换。',
  'design.error.precondition': '当前状态不满足此操作的前置条件（例如上游未选定、Brief 未确认、方向数量或差异不足）。',
  'design.error.readOnly': '该项目只读，无法写入。',
  'design.error.failed': '保存失败，请稍后重试。',
  'design.status.draft': '草稿',
  'design.status.confirmed': '已确认',
  'design.status.reviewReady': '待审核',
  'design.status.stale': '已过期',
  'design.status.archived': '已归档',
  'design.diff.other': '存在未通过的差异检查项。',
  'design.diff.colorOnly': '仅颜色不同，不计为结构差异',
  'design.diff.structuralHits': '结构差异维度',
  'design.noConceptSet': '尚无方向组；请先在 Brief 页确认 Brief 并创建方向组。',
  'design.markReviewReady': '标记为待审核',
  'design.goReview': '前往设计审核',
  'design.form.market': '市场',
  'design.form.category': '品类',
  'design.form.brandContext': '品牌背景（可选）',
  'design.form.differentiationGoals': '差异化目标',
  'design.form.materialsConstraints': '材料约束',
  'design.form.costConstraints': '成本约束',
  'design.form.productionConstraints': '生产约束',
  'design.form.requiredMissing': '请填写所有必填项；未知时请明确写“未知”。',
  'design.form.createBrief': '创建 Brief 草稿',
  'design.form.createBriefHint': '从已选定的机会创建 Brief 草稿；机会版本与选定决定取自该记录。',
  'design.form.fromOpportunity': '来源机会',
  'design.form.opportunityRevision': '机会版本',
  'design.form.opportunityNotSelected': '该机会尚未被人工选定或已失效，不能创建 Brief。',
  'design.form.constraintHint': '多行字段每行一条；必填约束未知时请写“未知”。',
  'design.form.saving': '正在保存…',
  'design.form.confirmBrief': '确认 Brief',
  'design.form.createConceptSet': '创建方向组',
  'design.form.conceptName': '方向名称',
  'design.form.designIntent': '设计意图',
  'design.form.colorDirection': '色彩方向',
  'design.form.addConcept': '添加方向',
  'design.form.conceptCount': '已有方向',
  'design.form.conceptHint': '多行字段每行一条；原创转化与生产未知项至少各一条，三个方向两两至少两个结构维度不同。',
  'review.homeTitle': '设计审核',
  'review.homeHint': '人工选择并批准一个方向；批准后生成可审计的决策包。',
  'review.r0Readonly': 'R0 公开重建审核只读；已记录决定仅作文档重建，不冒充真实设计师或客户批准。',
  'review.r0DemoBanner': '公开重建记录演示——非真实设计师或客户批准；写入已禁用。',
  'review.loading': '正在加载审核…',
  'review.loadError': '审核加载失败',
  'review.notFound': '未找到审核轮次',
  'review.backOverview': '返回概览',
  'review.backReviews': '返回审核列表',
  'review.openReview': '打开审核',
  'review.opening': '打开中…',
  'review.openFailed': '无法打开审核',
  'review.roundTitle': '审核轮次',
  'review.roundItem': '审核轮次',
  'review.roundStatus': '状态',
  'review.openedAt': '打开时间',
  'review.enum.status.open': '进行中',
  'review.enum.status.changesRequested': '需修改',
  'review.enum.status.needsResearch': '需补充研究',
  'review.enum.status.rejected': '已拒绝',
  'review.enum.status.approved': '已批准',
  'review.enum.status.invalidated': '已失效',
  'review.enum.status.archived': '已归档',
  'review.validityTitle': '批准有效性',
  'review.validityValid': '当前批准有效',
  'review.validityInvalid': '批准无效或缺失',
  'review.conceptsTitle': '候选方向',
  'review.selected': '已选',
  'review.selectConcept': '选择此方向',
  'review.approveSelected': '批准所选方向',
  'review.approving': '批准中…',
  'review.requestRevision': '要求退改',
  'review.reject': '拒绝',
  'review.needsResearch': '补充研究',
  'review.revokeApproval': '撤销批准',
  'review.generateDeliverable': '生成决策包',
  'review.generating': '生成中…',
  'review.openDeliverable': '打开 R0 公开决策包',
  'review.openDeliverables': '打开导出列表',
  'review.actionFailed': '操作失败',
  'review.notRealApproval': '本地审核不构成真实设计师或客户验收。',
  'deliverable.homeTitle': '导出决策包',
  'deliverable.homeHint': '冻结的 audience 过滤快照与导出工件；public_portfolio 不是自动发布。',
  'deliverable.r0Readonly': 'R0 公开重建导出只读；工件字节不可改写。',
  'deliverable.loadError': '导出加载失败',
  'deliverable.notFound': '未找到决策包',
  'deliverable.backOverview': '返回概览',
  'deliverable.backReviews': '返回审核',
  'deliverable.backDeliverables': '返回导出列表',
  'deliverable.detailTitle': '决策包详情',
  'deliverable.status': '状态',
  'deliverable.kind': '类型',
  'deliverable.kindJson': '结构化数据（JSON）',
  'deliverable.kindMarkdown': '可读文档（Markdown）',
  'deliverable.kindManifest': '文件清单',
  'deliverable.audience': '受众',
  'deliverable.snapshotHash': '快照哈希',
  'deliverable.limitations': '限制',
  'deliverable.artifactsTitle': '导出工件',
  'deliverable.verify': '校验工件哈希',
  'deliverable.verifying': '校验中…',
  'deliverable.verifyOk': '哈希校验通过',
  'deliverable.verifyFail': '哈希校验失败',
  'overview.openReview': '打开审核',
  'overview.openDeliverables': '打开导出',
  'overview.openFeedback': '记录反馈',
  'overview.openOutcomes': '打开开发事件与市场结果',
  'overview.openEvaluations': '打开固定评测',
  'overview.openImprovements': '打开改进项',
  'overview.followUp': '交付后跟踪',
  'overview.followUpHint': '顺序：交付物 → 设计师反馈 → 开发事件与市场结果 → 固定评测 → 人工评估 → 改进项。人工评估在某一次固定评测运行内记录。',
  'overview.followUpReadOnly': '公开案例只读：可以查看已记录的反馈与结果，不能写入新的反馈或结果。',
  'deliverable.openFollowUp': '记录该交付物的反馈与结果',
  'feedback.homeTitle': '设计师反馈',
  'feedback.r0Banner': '公开案例重建／录制演示反馈／无真实后续市场数据',
  'feedback.empty': '还没有反馈。未知结果不会记成 0。',
  'feedback.subjective': '主观估计',
  'outcomes.homeTitle': '后续结果',
  'outcomes.notAvailable': '结果不可获得',
  'outcomes.noZero': '尚未观察、不可获得或未授权不会显示为数值 0。',
  'evaluations.homeTitle': '固定评测',
  'evaluations.r0Banner': '公开案例重建／录制规则评测／无真实设计师评测／无真实商业结果',
  'evaluations.empty': '还没有评测运行。',
  'evaluations.noScore': '不显示综合质量分或通过率 KPI。',
  'evaluations.autoRules': '自动规则结果',
  'evaluations.humanNotAssessed': '人工 rubric 尚未评价（not_assessed）。',
  'improvements.homeTitle': '改进候选',
  'improvements.empty': '还没有改进候选。',
  'improvements.acceptHint': '接受不等于授权 Cursor 开工。',
  'improvements.accept': '接受候选',
  'improvements.decisionReason': '接受理由',
  'improvements.acceptFailed': '接受候选失败。',
  'improvements.userTest': '用户测试／内部演示',
  'improvements.source': '来源',
  'improvements.project': '项目',
  'improvements.dataReality': '数据现实',
  'improvements.reason': '原因',
  'feedback.formTitle': '记录一条反馈',
  'feedback.subjectType': '对象类型',
  'feedback.subjectId': '对象标识',
  'feedback.subjectRevision': '对象修订',
  'feedback.revision.concept': '方向修订',
  'feedback.revision.brief': 'Brief 修订',
  'feedback.revision.opportunity': '机会修订',
  'feedback.revision.evidence': '证据修订',
  'feedback.revision.workflowStep': '流程步骤修订',
  'feedback.action': '动作',
  'feedback.chooseAction': '请选择动作',
  'feedback.reasonCode': '原因代码',
  'feedback.reasonText': '原因说明',
  'feedback.modificationArea': '修改范围',
  'feedback.modificationSummary': '修改摘要',
  'feedback.professionalValidity': '专业有效性',
  'feedback.revisionEffort': '返工量',
  'feedback.timeSaved': '节省时间估计',
  'feedback.followUp': '需要跟进',
  'feedback.dataReality': '数据现实',
  'feedback.visibility': '可见性',
  'feedback.submit': '提交反馈',
  'feedback.submitting': '正在提交…',
  'feedback.success': '已写入一条新反馈。',
  'feedback.conflict': '与当前记录冲突。请查看最新记录后再提交。',
  'feedback.readOnly': '公开案例只读，不能写入反馈或结果。',
  'feedback.validation': '请填写对象标识、非负整数修订和原因说明。',
  'feedback.error': '提交失败。',
  'feedback.correct': '纠错（新建一条记录）',
  'feedback.correctionReason': '纠错原因',
  'feedback.exactTarget': '精确对象',
  'feedback.supersedes': '取代',
  'outcomes.deliverableId': '交付物标识',
  'outcomes.conceptId': '概念标识',
  'outcomes.revision': '修订',
  'outcomes.availability': '可获得性',
  'outcomes.reason': '原因',
  'outcomes.asOf': '截止时间',
  'outcomes.availabilityForm': '结果可获得性',
  'outcomes.developmentForm': '开发阶段',
  'outcomes.metricForm': '指标观测',
  'outcomes.submitAvailability': '写入可获得性',
  'outcomes.submitDevelopment': '写入开发阶段',
  'outcomes.submitMetric': '写入指标观测',
  'outcomes.success': '已写入。',
  'outcomes.stage': '开发阶段',
  'outcomes.context': '业务上下文',
  'outcomes.metricKey': '指标键',
  'outcomes.metricValue': '数值',
  'outcomes.unavailable': '不可获得（不会写成 0）',
  'outcomes.windowStart': '窗口开始',
  'outcomes.windowEnd': '窗口结束',
  'outcomes.region': '地区',
  'outcomes.channel': '渠道',
  'outcomes.limitations': '限制',
  'evaluations.run': '运行评测',
  'evaluations.loading': '正在加载评测数据…',
  'evaluations.loadError': '无法加载评测数据。列表未显示，不代表没有记录。',
  'evaluations.retry': '重试',
  'evaluations.running': '正在运行…',
  'evaluations.runFailed': '评测运行失败。',
  'evaluations.definition': '评测定义',
  'evaluations.cases': '用例',
  'evaluations.assessmentReason': '评价理由',
  'evaluations.submitAssessment': '提交人工评价',
  'evaluations.exportReport': '导出报告',
  'evaluations.exported': '报告已生成。',
  'evaluations.exporting': '正在导出报告…',
  'evaluations.exportFailed': '报告导出失败，未生成文件。',
  'evaluations.reportArtifacts': '报告文件',
  'evaluations.artifactJson': 'JSON 报告',
  'evaluations.artifactMarkdown': 'Markdown 报告',
  'evaluations.viewArtifact': '查看',
  'evaluations.hideArtifact': '收起',
  'evaluations.downloadArtifact': '下载',
  'evaluations.status.pass': '通过 ✓',
  'evaluations.status.fail': '失败 ✗',
  'evaluations.status.warning': '警告 !',
  'evaluations.status.notApplicable': '不适用 —',
  'evaluations.status.error': '错误 ×',
  'deliverable.package': '决策包',
  'deliverable.revision': '交付物修订',
  'deliverable.verifyMismatch': '哈希校验失败：以下文件内容与冻结快照不一致',
  'deliverable.verifyError': '校验执行失败，未能判断文件是否一致。请稍后重试。',
  'deliverable.verifyMissingArtifact': '缺少导出文件',
  'deliverable.verifySnapshotMismatch': '冻结快照内容与记录的哈希不一致',
  'deliverable.verifyArtifactCount': '导出文件数量与决策包不符',
  'deliverable.verifyOtherCheck': '其他完整性检查未通过',
  'deliverable.enum.audience.internalReview': '内部审核',
  'deliverable.enum.audience.designerHandoff': '设计师交接',
  'deliverable.enum.audience.publicPortfolio': '公开作品集',
  'deliverable.enum.status.generating': '生成中',
  'deliverable.enum.status.ready': '已就绪',
  'deliverable.enum.status.failed': '生成失败',
  'deliverable.enum.status.invalidated': '已失效',
  'deliverable.enum.status.withdrawn': '已撤回',
  'deliverable.enum.status.archived': '已归档',
  'review.enum.cause.upstreamStale': '上游记录已过期',
  'review.enum.cause.briefRevisionChanged': '设计简报修订已变化',
  'review.enum.cause.conceptSetRevisionChanged': '概念组修订已变化',
  'review.enum.cause.conceptRevisionChanged': '概念修订已变化',
  'review.enum.cause.visualReferenceWithdrawn': '视觉参考已撤回',
  'review.enum.cause.approvalRevoked': '批准已撤销',
  'review.enum.cause.evidenceWithdrawn': '证据已撤回',
  'review.enum.cause.artifactIntegrityFailed': '工件完整性校验失败',
  'review.decisionReason': '决定理由（批准、要求修改、驳回、补充研究或撤销批准时必填；选择方向时可选）',
  'review.decisionReasonRequired': '请先填写决定理由。',
  'feedback.targetDeliverable': '反馈对象（交付物）',
  'feedback.conceptRevision': '所选概念修订',
  'feedback.followUpMissing': '找不到来源交付物。请从下方选择一个现有交付物。',
  'feedback.followUpStale': '来源交付物已有新修订。提交将使用下方显示的当前修订。',
  'feedback.enum.subject.deliverable': '交付物',
  'feedback.enum.subject.concept': '设计概念',
  'feedback.enum.subject.brief': '设计简报',
  'feedback.enum.subject.opportunity': '机会',
  'feedback.enum.subject.evidence': '证据',
  'feedback.enum.subject.workflowStep': '流程步骤',
  'feedback.enum.action.adopted': '采用',
  'feedback.enum.action.modified': '修改后采用',
  'feedback.enum.action.rejected': '拒绝',
  'feedback.enum.action.ignored': '忽略',
  'feedback.enum.action.needsFollowUp': '需要跟进',
  'feedback.enum.action.unableToAssess': '无法判断',
  'feedback.enum.reason.evidenceUseful': '证据有用',
  'feedback.enum.reason.evidenceMissing': '缺少证据',
  'feedback.enum.reason.other': '其他',
  'feedback.enum.validity.valid': '有效',
  'feedback.enum.validity.partlyValid': '部分有效',
  'feedback.enum.validity.invalid': '无效',
  'feedback.enum.validity.unknown': '未知',
  'feedback.enum.effort.none': '无需返工',
  'feedback.enum.effort.light': '少量',
  'feedback.enum.effort.moderate': '中等',
  'feedback.enum.effort.heavy': '大量',
  'feedback.enum.effort.unknown': '未知',
  'feedback.enum.time.notEstimated': '未估计',
  'feedback.enum.time.none': '未节省',
  'feedback.enum.time.under15m': '少于 15 分钟',
  'feedback.enum.time.m15to30': '15–30 分钟',
  'feedback.enum.time.m30to60': '30–60 分钟',
  'feedback.enum.time.over60m': '超过 60 分钟',
  'feedback.enum.reality.userTest': '用户测试',
  'feedback.enum.reality.realWork': '真实工作',
  'feedback.enum.reality.recordedDemo': '录制演示',
  'feedback.enum.visibility.projectPrivate': '仅项目内可见',
  'feedback.enum.visibility.internalDemo': '内部演示',
  'feedback.enum.visibility.viewOnly': '只读查看',
  'outcomes.enum.availability.notYetObserved': '尚未观察',
  'outcomes.enum.availability.notAvailable': '不可获得',
  'outcomes.enum.availability.notAuthorized': '未授权',
  'outcomes.enum.availability.availablePartial': '部分可获得',
  'outcomes.enum.availability.available': '可获得',
  'outcomes.enum.stage.handedOff': '已交接',
  'outcomes.enum.stage.sampled': '已打样',
  'outcomes.enum.stage.revisedAfterSample': '打样后修改',
  'outcomes.enum.stage.produced': '已生产',
  'outcomes.enum.stage.listed': '已上架',
  'outcomes.enum.stage.selling': '销售中',
  'outcomes.enum.stage.closed': '已结束',
  'outcomes.enum.stage.stopped': '已停止',
  'evaluations.runLabel': '评测运行',
  'evaluations.followUpContext': '来源交付物：',
  'evaluations.followUpProjectScope': '固定评测按项目运行，覆盖该项目的全部记录，不只针对这一个交付物。',
  'evaluations.enum.rating.meets': '满足',
  'evaluations.enum.rating.partlyMeets': '部分满足',
  'evaluations.enum.rating.doesNotMeet': '不满足',
  'evaluations.enum.rating.unableToAssess': '无法评价',
  'evaluations.enum.verdict.pass': '通过',
  'evaluations.enum.verdict.partial': '部分通过',
  'evaluations.enum.verdict.fail': '未通过',
  'evaluations.enum.verdict.error': '出错',
  'evaluations.enum.execution.completed': '已完成',
  'evaluations.enum.execution.partial': '部分完成',
  'evaluations.enum.execution.failed': '执行失败',
  'evaluations.enum.execution.cancelled': '已取消',
  'evaluations.enum.definition.draft': '草稿',
  'evaluations.enum.definition.published': '已发布',
  'evaluations.enum.definition.retired': '已停用',
  'evaluations.enum.severity.blocker': '阻断',
  'evaluations.enum.severity.major': '主要',
  'evaluations.enum.severity.minor': '次要',
  'evaluations.enum.severity.info': '提示',
  'evaluations.caseNegative': '隔离负例',
  'evaluations.criterion': '评估项',
  'improvements.enum.status.proposed': '已提出',
  'improvements.enum.status.accepted': '已接受',
  'improvements.enum.status.deferred': '已延后',
  'improvements.enum.status.planned': '已排期',
  'improvements.enum.status.resolved': '已解决',
  'improvements.enum.status.wontFix': '不修复',
  'improvements.enum.status.superseded': '已被取代',
  'improvements.enum.status.reopened': '已重开',
  'analysis.enum.dedupe.unreviewed': '未查重',
  'analysis.enum.dedupe.candidateMatch': '疑似重复',
  'analysis.enum.dedupe.confirmedSame': '已确认重复',
  'analysis.enum.dedupe.confirmedDistinct': '已确认不同',
  'analysis.enum.objectStatus.active': '有效',
  'analysis.enum.objectStatus.stale': '已过期',
  'analysis.enum.objectStatus.invalidated': '已失效',
  'analysis.enum.objectStatus.archived': '已归档',
  'analysis.enum.review.candidate': '候选',
  'analysis.enum.review.selected': '已选定',
  'analysis.enum.review.rejected': '已拒绝',
  'analysis.enum.review.needsMoreResearch': '需补充研究',
  'analysis.enum.signalType.searchGrowth': '搜索增长',
  'analysis.enum.signalType.rankPosition': '榜单排名',
  'analysis.enum.signalType.viewCount': '浏览量',
  'analysis.enum.signalType.engagement': '互动量',
  'analysis.enum.signalType.saveRate': '收藏率',
  'analysis.enum.signalType.selloutClaim': '售罄声明',
  'analysis.enum.signalType.crossSourcePresence': '跨来源出现',
  'common.labelSeparator': '：',
  'common.listSeparator': '；',
  'overview.stagesLoading': '正在读取各阶段记录…',
  'overview.stagesError': '无法读取各阶段记录，阶段状态暂不显示。',
}

export const en: Record<FashionKey, string> = {
  brand: 'Fashion Harness',
  tagline: 'For apparel designers and design teams',
  flow: 'Overseas signals → evidenced opportunities → design directions → human review',
  'nav.projects': 'Projects',
  'nav.agent': 'Agent workspace',
  'nav.settings': 'Settings',
  'projects.eyebrow': 'Projects',
  'projects.heading': 'Design projects',
  'projects.value': 'Start from public signals and design project entry — evidence first, human review.',
  'projects.cta': 'Continue public case',
  'projects.open': 'Open project',
  'projects.new': 'New design project',
  'projects.publicBadge': 'Public rebuild case',
  'projects.updated': 'Updated',
  'projects.loading': 'Loading projects…',
  'projects.loadError': 'Could not load projects',
  'projects.retry': 'Retry',
  'projects.empty': 'No projects yet',
  'projects.createLabel': 'Project name',
  'projects.createSubmit': 'Create',
  'projects.createCancel': 'Cancel',
  'projects.creating': 'Creating…',
  'projects.createEmpty': 'Enter a project name',
  'projects.createTooLong': 'Project name must be at most 120 characters',
  'projects.createFailed': 'Create failed; try again',
  'projects.searchPlaceholder': 'Search by project name',
  'projects.searchAria': 'Search projects',
  'projects.filterAria': 'Filter by origin',
  'overview.publicBadge': 'Public rebuild case / not a real client project',
  'overview.back': 'Back to projects',
  'overview.facts': 'Recorded facts',
  'overview.inferences': 'Inferences',
  'overview.pending': 'Pending validation',
  'overview.created': 'Created',
  'overview.updated': 'Updated',
  'overview.empty': 'Project created. Open Research to register URL sources and text evidence.',
  'overview.loadError': 'Could not load project',
  'overview.retry': 'Retry',
  'overview.loadingAria': 'Loading project overview',
  'overview.statusSummary': 'Status summary',
  'overview.records': 'Project records',
  'overview.basicInfo': 'Basics',
  'overview.nextStep': 'Next step',
  'overview.nextStepUser': 'Open Research to register sources and evidence, or discuss in Agent.',
  'overview.nextStepR0': 'Review the case structure, or discuss in Agent.',
  'overview.agentNoBind': 'Agent does not automatically read or write this project; context comes only from this page.',
  'overview.disclaimer': 'Public web excerpts · not live heat · not a real client project',
  'overview.market': 'Market',
  'overview.category': 'Category',
  'projectNotFound.title': 'Project not found',
  'notFound.title': 'Page not found',
  'notFound.back': 'Back to projects',
  'sidebar.expand': 'Expand sidebar',
  'sidebar.collapse': 'Collapse sidebar',
  'sidebar.currentHeading': 'Current project',
  'sidebar.workNav': 'Work navigation',
  'agent.leadTitle': 'Fashion Harness · Agent collaboration',
  'agent.leadSubtitle': 'Clarify design goals and evidence in chat — without auto-writing the project',
  'agent.collaboration': 'Discuss research leads, opportunity hypotheses, and direction drafts; durable project data stays in Projects / Overview.',
  'agent.noProject': 'No project selected — return to the project list, or continue a general conversation.',
  'agent.projectLoading': 'Resolving the current UI project…',
  'agent.sessionUnbound': 'UI context only: this project is not bound to the session; Agent will not automatically read or write the Project.',
  'agent.openOverview': 'Open project overview',
  'agent.backProjects': 'Back to projects',
  'agent.stripNoProject': 'No project selected',
  'agent.stripUnbound': 'UI context only — not bound to this session',
  'agent.readonlyAssist': 'Read-only assistance — the Agent will not modify the project',
  'agent.boundStatus': 'Bound to this project',
  'agent.dataScopeLabel': 'Data authorized this turn',
  'agent.snapshotVersion': 'Context version',
  'agent.projectUpdated': 'Project updated',
  'agent.contextFailed': 'Project context failed to generate; no project data was injected this turn',
  'agent.projectUnavailable': 'The project is missing, inaccessible, or the binding is invalid. Project context injection has stopped.',
  'agent.conflictOther': 'This session is already bound to another project and will not switch silently. Create a new session for this project, or return to the overview.',
  'agent.needsConfirm': 'This session already has messages and is not bound. Confirm the bind, or create a new session for this project.',
  'agent.confirmBind': 'Confirm bind to this project',
  'agent.createBoundSession': 'New session for this project',
  'agent.scope.project': 'Project',
  'agent.scope.research': 'Research',
  'agent.scope.analysis': 'Analysis',
  'agent.scope.brief': 'Brief',
  'agent.scope.directions': 'Directions',
  'agent.scope.review': 'Review',
  'agent.scope.deliverable': 'Deliverable',
  'agent.scope.feedback': 'Feedback',
  'agent.scope.evaluation': 'Evaluation',
  'agent.scope.improvement': 'Improvement',
  'origin.user': 'Your design project',
  'origin.publicRebuild': 'Public rebuild case',
  'access.editable': 'Editable',
  'access.readOnly': 'Read-only example',
  'capability.foundationReady': 'Foundation project ready',
  'capability.publicRebuild': 'Public rebuild / read-only example',
  'nextStep.openOverview': 'Open overview',
  'nextStep.viewPublicCase': 'View case overview',
  'section.recent': 'Recent projects',
  'section.public': 'Public cases',
  'pipeline.recorded': 'Recorded',
  'pipeline.candidate': 'Candidate',
  'pipeline.pending': 'Pending',
  'pipeline.comingSoon': 'Not available yet',
  'filter.all': 'All',
  'filter.mine': 'My projects',
  'filter.public': 'Public cases',
  'filter.empty': 'No matching projects',
  'filter.clear': 'Clear filters',
  'section.recentEmpty': 'No user projects yet',
  'stage.research': 'Research',
  'stage.opportunity': 'Opportunity',
  'stage.direction': 'Direction',
  'stage.review': 'Review',
  'stage.export': 'Export',
  'r0.cardDisclaimer': 'Not live data / not a real client project',
  'r0.coverAlt': 'Khaki decorative swatch',
  'overview.openResearch': 'Open research',
  'overview.openDirections': 'Open directions',
  'research.homeTitle': 'Research tasks',
  'research.homeHint': 'Organize traceable sources and evidence; no live scrape and no trend conclusions.',
  'research.r0Readonly': 'R0 public-rebuild research is read-only; page changes do not overwrite recorded semantics.',
  'research.loading': 'Loading research…',
  'research.loadError': 'Could not load research data',
  'research.retry': 'Retry',
  'research.empty': 'No research tasks yet',
  'research.emptySources': 'No sources yet',
  'research.emptySamples': 'No samples yet',
  'research.emptyEvidence': 'No evidence yet',
  'research.createTask': 'Create research task',
  'research.taskTitle': 'Task title',
  'research.taskNote': 'Note (optional)',
  'research.creating': 'Submitting…',
  'research.createEmpty': 'Fill required fields',
  'research.createFailed': 'Submit failed; try again',
  'research.backOverview': 'Back to overview',
  'research.backTasks': 'Back to tasks',
  'research.backTask': 'Back to task',
  'research.readOnlyBanner': 'Read-only: create and edit are disabled',
  'research.sources': 'Sources',
  'research.samples': 'Samples',
  'research.evidence': 'Evidence',
  'research.addSource': 'Register URL source',
  'research.sourceTitle': 'Source title',
  'research.sourceUrl': 'URL (http/https)',
  'research.sourceAttribution': 'Attribution',
  'research.sourceKind': 'Source kind',
  'research.invalidUrl': 'Enter a valid http(s) URL without credentials',
  'research.addSample': 'Add sample',
  'research.sampleLabel': 'Sample label',
  'research.addEvidence': 'Add evidence',
  'research.observation': 'Observation (directly visible)',
  'research.claim': 'Claim (optional)',
  'research.claimType': 'Claim type',
  'research.grade': 'Evidence grade',
  'research.method': 'Method (required for derived)',
  'research.limitations': 'Limitations (one per line)',
  'research.excerpt': 'Excerpt (optional)',
  'research.reviewConfirm': 'Confirm',
  'research.reviewReject': 'Reject',
  'research.reviewNote': 'Review note',
  'research.reviewing': 'Reviewing…',
  'research.reviewFailed': 'Review failed',
  'research.submitting': 'Submitting…',
  'research.notFound': 'Research object not found',
  'research.sessionUnbound': 'This session is not bound to project data; Agent will not automatically read research evidence.',
  'research.status': 'Status',
  'research.accessedAt': 'Accessed at',
  'research.usageBoundary': 'Usage boundary',
  'research.availability': 'Registered status',
  'research.availabilityHint': 'This is the status recorded when the source was registered, not a live access check. Access Denied in the current environment is observation evidence only and must not overwrite this registration automatically.',
  'research.correctAvailability': 'Correct registered status',
  'research.availabilitySave': 'Save registered status',
  'research.enum.unknown': 'Unknown',
  'research.enum.taskStatus.draft': 'Draft',
  'research.enum.taskStatus.active': 'Active',
  'research.enum.taskStatus.readyForReview': 'Ready for review',
  'research.enum.taskStatus.closed': 'Closed',
  'research.enum.taskStatus.archived': 'Archived',
  'research.enum.sampleStatus.draft': 'Draft',
  'research.enum.sampleStatus.readyForReview': 'Ready for review',
  'research.enum.sampleStatus.confirmed': 'Confirmed',
  'research.enum.sampleStatus.rejected': 'Rejected',
  'research.enum.sampleStatus.archived': 'Archived',
  'research.enum.sourceKind.webPage': 'Web page',
  'research.enum.sourceKind.report': 'Report',
  'research.enum.sourceKind.productPage': 'Product page',
  'research.enum.sourceKind.categoryPage': 'Category page',
  'research.enum.sourceKind.editorial': 'Editorial',
  'research.enum.sourceKind.socialContent': 'Social content',
  'research.enum.sourceKind.internalFile': 'Internal file',
  'research.enum.sourceKind.other': 'Other',
  'research.enum.usageBoundary.publicAttributed': 'Public attributed',
  'research.enum.usageBoundary.projectPrivate': 'Project private',
  'research.enum.usageBoundary.viewOnly': 'View only',
  'research.enum.availability.available': 'Registered as reachable',
  'research.enum.availability.unavailable': 'Unavailable',
  'research.enum.availability.removed': 'Removed',
  'research.enum.reviewStatus.draft': 'Draft',
  'research.enum.reviewStatus.pendingReview': 'Pending review',
  'research.enum.reviewStatus.confirmed': 'Confirmed',
  'research.enum.reviewStatus.rejected': 'Rejected',
  'research.enum.reviewStatus.invalidated': 'Invalidated',
  'research.enum.claimType.none': 'None',
  'claim.observed': 'Observed',
  'claim.derived': 'Derived',
  'claim.needs_validation': 'Needs validation',
  'analysis.homeTitle': 'Analysis',
  'analysis.homeHint': 'Normalize confirmed evidence into market items, signals, clusters, and opportunities. No hot score.',
  'analysis.r0Readonly': 'R0 public-rebuild analysis is read-only; recorded decisions are documentation, not designer adoption.',
  'analysis.loading': 'Loading analysis…',
  'analysis.loadError': 'Failed to load analysis',
  'analysis.retry': 'Retry',
  'analysis.empty': 'No analysis objects yet',
  'analysis.backTask': 'Back to task',
  'analysis.backAnalysis': 'Back to analysis',
  'analysis.items': 'Market items',
  'analysis.signals': 'Popularity signals',
  'analysis.clusters': 'Trend clusters',
  'analysis.opportunities': 'Design opportunities',
  'analysis.publicRebuild': 'Public rebuild recorded',
  'analysis.publicRebuildBanner': 'Recorded public-rebuild decision only — not a real designer adoption.',
  'analysis.staleBanner': 'This opportunity is stale after upstream evidence changed; it cannot enter F3.',
  'analysis.noHotScore': 'Signals keep platform metric semantics; there is no cross-platform hot score.',
  'analysis.notFound': 'Analysis object not found',
  'analysis.brand': 'Brand / creator',
  'analysis.brandNotRecorded': 'Not recorded',
  'analysis.windowNotRecorded': 'Not recorded',
  'analysis.observations': 'Observation links',
  'analysis.method': 'Method version',
  'analysis.window': 'Window',
  'analysis.limitations': 'Limitations',
  'analysis.members': 'Members',
  'analysis.counterEvidence': 'Counter-evidence',
  'analysis.gaps': 'Biases and gaps',
  'analysis.targetMarket': 'Target market',
  'analysis.unknowns': 'Unknowns',
  'analysis.risks': 'Copying / IP risks',
  'analysis.decisionNote': 'Decision note',
  'analysis.decisionNoteRequired': 'Enter a decision note',
  'analysis.decisionFailed': 'Decision failed',
  'analysis.decideSelect': 'Select',
  'analysis.decideReject': 'Reject',
  'analysis.decideMore': 'Needs more research',
  'analysis.openAnalysis': 'Open analysis',
  'analysis.createHint': 'Create analysis objects from confirmed sources, samples, and evidence. Confirming evidence does not automatically become a trend conclusion.',
  'analysis.createItem': 'Create market item',
  'analysis.createSignal': 'Create popularity signal',
  'analysis.createCluster': 'Create trend cluster',
  'analysis.createOpportunity': 'Create design opportunity',
  'analysis.displayName': 'Display name',
  'analysis.itemType': 'Item type',
  'analysis.itemTypeGarment': 'Garment product',
  'analysis.itemTypeContent': 'Content post',
  'analysis.itemTypeTopic': 'Trend topic',
  'analysis.brandOptional': 'Brand / creator (optional)',
  'analysis.category': 'Category',
  'analysis.selectSample': 'Select sample',
  'analysis.selectSource': 'Select source',
  'analysis.selectEvidence': 'Select confirmed evidence',
  'analysis.selectItems': 'Cite market items',
  'analysis.selectSignals': 'Cite signals',
  'analysis.selectClusters': 'Cite trend clusters',
  'analysis.confirmedOnly': 'Only confirmed evidence can enter a valid analysis object.',
  'analysis.noConfirmedEvidence': 'This task has no confirmed evidence yet.',
  'analysis.needConfirmed': 'Fill required fields and select confirmed sources, samples, or evidence.',
  'analysis.createFailed': 'Create failed',
  'analysis.submitCreate': 'Create',
  'analysis.platform': 'Platform',
  'analysis.rawValue': 'Raw value',
  'analysis.rawUnit': 'Raw unit',
  'analysis.signalType': 'Signal type',
  'analysis.methodVersion': 'Method version',
  'analysis.clusterName': 'Cluster name',
  'analysis.clusterDefinition': 'Definition',
  'analysis.timeContext': 'Time context',
  'analysis.marketRegions': 'Market regions (comma-separated)',
  'analysis.evidenceGrade': 'Evidence grade',
  'analysis.opportunityTitle': 'Opportunity title',
  'analysis.opportunityStatement': 'Opportunity statement',
  'analysis.targetUser': 'Target user hypothesis',
  'analysis.timing': 'Timing',
  'design.directionsTitle': 'Design directions',
  'design.directionsHint': 'Three comparable directions on a confirmed Brief. F3-01 does not approve or export.',
  'design.r0Readonly': 'R0 public-rebuild design is read-only; offline drafts are not real customer work.',
  'design.loading': 'Loading design…',
  'design.loadError': 'Failed to load design',
  'design.empty': 'No design Brief or directions yet',
  'design.notFound': 'Design object not found',
  'design.backOverview': 'Back to overview',
  'design.backDirections': 'Back to directions',
  'design.backConcept': 'Back to concept',
  'design.openBrief': 'Open Brief',
  'design.briefTitle': 'Design Brief',
  'design.conceptSetStatus': 'Concept set status',
  'design.comparisonTitle': 'Structured comparison',
  'design.comparisonPass': 'All pairwise structural differences passed (color alone does not count).',
  'design.comparisonFail': 'Differentiation precheck failed; fix structural fields.',
  'design.noApprove': 'This module has no approve / reject / export.',
  'design.season': 'Season',
  'design.targetUser': 'Target user',
  'design.mustKeep': 'Must keep',
  'design.mustAvoid': 'Must avoid',
  'design.unknowns': 'Open questions',
  'design.silhouette': 'Silhouette',
  'design.proportion': 'Proportion and length',
  'design.material': 'Material direction',
  'design.construction': 'Construction and details',
  'design.function': 'Functional value',
  'design.scenarios': 'Use scenarios',
  'design.transformation': 'Original transformation',
  'design.similarityRisk': 'Similarity risk (not legal advice)',
  'design.productionUnknown': 'Production unknowns',
  'design.visualsTitle': 'Visual drafts',
  'design.visualTitle': 'Visual draft detail',
  'design.visualNotProduction': 'Visual drafts are not production specs; no fabric performance or IP clearance claims.',
  'design.aiDisclosure': 'AI / source disclosure',
  'design.usageBoundary': 'Usage boundary',
  'design.artifactRef': 'Artifact ref',
  'design.artifactRefNone': 'No artifact yet',
  'design.contentCredential': 'Content Credential',
  'design.contentCredentialNone': 'No credential recorded',
  'design.conceptRevision': 'Revision',
  'design.form.reviseConcept': 'Revise direction',
  'design.form.reviseHint': 'Saving creates a new revision and re-runs the structural difference check; the concept set returns to draft.',
  'design.form.saveRevision': 'Save revision',
  'design.form.cancelRevision': 'Cancel revision',
  'design.error.conflict': 'This record changed since it was loaded. Refresh and try again.',
  'design.error.notFound': 'The referenced design record does not exist or was replaced.',
  'design.error.precondition': 'The current state does not allow this action (for example the upstream is not selected, the Brief is not confirmed, or the directions are too few or too similar).',
  'design.error.readOnly': 'This project is read-only.',
  'design.error.failed': 'Saving failed. Try again later.',
  'design.status.draft': 'Draft',
  'design.status.confirmed': 'Confirmed',
  'design.status.reviewReady': 'Ready for review',
  'design.status.stale': 'Stale',
  'design.status.archived': 'Archived',
  'design.diff.other': 'A differentiation check did not pass.',
  'design.diff.colorOnly': 'only color differs, which is not a structural difference',
  'design.diff.structuralHits': 'structural dimensions that differ',
  'design.noConceptSet': 'No concept set yet. Confirm the Brief and create a concept set on the Brief page.',
  'design.markReviewReady': 'Mark ready for review',
  'design.goReview': 'Go to design review',
  'design.form.market': 'Market',
  'design.form.category': 'Category',
  'design.form.brandContext': 'Brand context (optional)',
  'design.form.differentiationGoals': 'Differentiation goals',
  'design.form.materialsConstraints': 'Material constraints',
  'design.form.costConstraints': 'Cost constraints',
  'design.form.productionConstraints': 'Production constraints',
  'design.form.requiredMissing': 'Fill in every required field; write "unknown" explicitly when unknown.',
  'design.form.createBrief': 'Create Brief draft',
  'design.form.createBriefHint': 'Create a Brief draft from the selected opportunity; its revision and selection decision come from that record.',
  'design.form.fromOpportunity': 'Source opportunity',
  'design.form.opportunityRevision': 'Opportunity revision',
  'design.form.opportunityNotSelected': 'This opportunity is not selected by a human or is no longer active, so no Brief can be created.',
  'design.form.constraintHint': 'One entry per line in multi-line fields; write "unknown" when a required constraint is unknown.',
  'design.form.saving': 'Saving…',
  'design.form.confirmBrief': 'Confirm Brief',
  'design.form.createConceptSet': 'Create concept set',
  'design.form.conceptName': 'Direction name',
  'design.form.designIntent': 'Design intent',
  'design.form.colorDirection': 'Color direction',
  'design.form.addConcept': 'Add direction',
  'design.form.conceptCount': 'Directions so far',
  'design.form.conceptHint': 'One entry per line; each direction needs at least one original transformation and one production unknown, and every pair must differ on at least two structural dimensions.',
  'review.homeTitle': 'Design review',
  'review.homeHint': 'Human select and approve one direction; after approval generate an auditable decision package.',
  'review.r0Readonly': 'R0 public-rebuild review is read-only; recorded decisions are documentation, not real designer or customer approval.',
  'review.r0DemoBanner': 'Public rebuild recorded demo — not real designer or customer approval; writes disabled.',
  'review.loading': 'Loading review…',
  'review.loadError': 'Failed to load review',
  'review.notFound': 'Review round not found',
  'review.backOverview': 'Back to overview',
  'review.backReviews': 'Back to reviews',
  'review.openReview': 'Open review',
  'review.opening': 'Opening…',
  'review.openFailed': 'Could not open review',
  'review.roundTitle': 'Review round',
  'review.roundItem': 'Review round',
  'review.roundStatus': 'Status',
  'review.openedAt': 'Opened at',
  'review.enum.status.open': 'Open',
  'review.enum.status.changesRequested': 'Changes requested',
  'review.enum.status.needsResearch': 'Needs research',
  'review.enum.status.rejected': 'Rejected',
  'review.enum.status.approved': 'Approved',
  'review.enum.status.invalidated': 'Invalidated',
  'review.enum.status.archived': 'Archived',
  'review.validityTitle': 'Approval validity',
  'review.validityValid': 'Current approval is valid',
  'review.validityInvalid': 'Approval invalid or missing',
  'review.conceptsTitle': 'Candidate directions',
  'review.selected': 'Selected',
  'review.selectConcept': 'Select this direction',
  'review.approveSelected': 'Approve selected direction',
  'review.approving': 'Approving…',
  'review.requestRevision': 'Request revision',
  'review.reject': 'Reject',
  'review.needsResearch': 'Needs more research',
  'review.revokeApproval': 'Revoke approval',
  'review.generateDeliverable': 'Generate decision package',
  'review.generating': 'Generating…',
  'review.openDeliverable': 'Open R0 public package',
  'review.openDeliverables': 'Open exports',
  'review.actionFailed': 'Action failed',
  'review.notRealApproval': 'Local review is not real designer or customer acceptance.',
  'deliverable.homeTitle': 'Export packages',
  'deliverable.homeHint': 'Frozen audience-filtered snapshots and export artifacts; public_portfolio is not automatic publish.',
  'deliverable.r0Readonly': 'R0 public-rebuild exports are read-only; artifact bytes are immutable.',
  'deliverable.loadError': 'Failed to load exports',
  'deliverable.notFound': 'Deliverable not found',
  'deliverable.backOverview': 'Back to overview',
  'deliverable.backReviews': 'Back to review',
  'deliverable.backDeliverables': 'Back to exports',
  'deliverable.detailTitle': 'Decision package detail',
  'deliverable.status': 'Status',
  'deliverable.kind': 'Kind',
  'deliverable.kindJson': 'Structured data (JSON)',
  'deliverable.kindMarkdown': 'Readable document (Markdown)',
  'deliverable.kindManifest': 'File manifest',
  'deliverable.audience': 'Audience',
  'deliverable.snapshotHash': 'Snapshot hash',
  'deliverable.limitations': 'Limitations',
  'deliverable.artifactsTitle': 'Export artifacts',
  'deliverable.verify': 'Verify artifact hashes',
  'deliverable.verifying': 'Verifying…',
  'deliverable.verifyOk': 'Hash verification passed',
  'deliverable.verifyFail': 'Hash verification failed',
  'overview.openReview': 'Open review',
  'overview.openDeliverables': 'Open exports',
  'overview.openFeedback': 'Record feedback',
  'overview.openOutcomes': 'Open development events and market outcomes',
  'overview.openEvaluations': 'Open fixed evaluations',
  'overview.openImprovements': 'Open improvement items',
  'overview.followUp': 'Post-delivery tracking',
  'overview.followUpHint': 'Order: deliverables → designer feedback → development events and market outcomes → fixed evaluations → human assessment → improvement items. Human assessment is recorded inside one fixed-evaluation run.',
  'overview.followUpReadOnly': 'The public case is read-only: recorded feedback and outcomes can be read, but no new feedback or outcome can be written.',
  'deliverable.openFollowUp': 'Record feedback and outcomes for this deliverable',
  'feedback.homeTitle': 'Designer feedback',
  'feedback.r0Banner': 'Public-case rebuild / recorded demo feedback / no real later market data',
  'feedback.empty': 'No feedback yet. Unknown outcomes are not stored as 0.',
  'feedback.subjective': 'Self-estimate',
  'outcomes.homeTitle': 'Later outcomes',
  'outcomes.notAvailable': 'Outcome not available',
  'outcomes.noZero': 'Not yet observed, not available, and not authorized are not shown as numeric 0.',
  'evaluations.homeTitle': 'Evaluations',
  'evaluations.r0Banner': 'Public-case rebuild / recorded rule evaluation / no real designer assessment / no real commercial outcome',
  'evaluations.empty': 'No evaluation runs yet.',
  'evaluations.noScore': 'No composite quality score or pass-rate KPI.',
  'evaluations.autoRules': 'Automatic rule results',
  'evaluations.humanNotAssessed': 'Human rubric not assessed yet.',
  'improvements.homeTitle': 'Improvement candidates',
  'improvements.empty': 'No improvement candidates yet.',
  'improvements.acceptHint': 'Accept does not authorize Cursor to start work.',
  'improvements.accept': 'Accept candidate',
  'improvements.decisionReason': 'Acceptance reason',
  'improvements.acceptFailed': 'Failed to accept candidate.',
  'improvements.userTest': 'User test / internal demo',
  'improvements.source': 'Source',
  'improvements.project': 'Project',
  'improvements.dataReality': 'Data reality',
  'improvements.reason': 'Reason',
  'feedback.formTitle': 'Record feedback',
  'feedback.subjectType': 'Subject type',
  'feedback.subjectId': 'Subject id',
  'feedback.subjectRevision': 'Subject revision',
  'feedback.revision.concept': 'Direction revision',
  'feedback.revision.brief': 'Brief revision',
  'feedback.revision.opportunity': 'Opportunity revision',
  'feedback.revision.evidence': 'Evidence revision',
  'feedback.revision.workflowStep': 'Workflow step revision',
  'feedback.action': 'Action',
  'feedback.chooseAction': 'Choose an action',
  'feedback.reasonCode': 'Reason code',
  'feedback.reasonText': 'Reason',
  'feedback.modificationArea': 'Modification area',
  'feedback.modificationSummary': 'Modification summary',
  'feedback.professionalValidity': 'Professional validity',
  'feedback.revisionEffort': 'Revision effort',
  'feedback.timeSaved': 'Time-saved estimate',
  'feedback.followUp': 'Follow-up needed',
  'feedback.dataReality': 'Data reality',
  'feedback.visibility': 'Visibility',
  'feedback.submit': 'Submit feedback',
  'feedback.submitting': 'Submitting…',
  'feedback.success': 'A new feedback record was written.',
  'feedback.conflict': 'This conflicts with the current record. Reload the latest record before submitting again.',
  'feedback.readOnly': 'This public case is read-only. Feedback and outcomes cannot be written.',
  'feedback.validation': 'Enter a subject id, a non-negative integer revision, and a reason.',
  'feedback.error': 'Submit failed.',
  'feedback.correct': 'Correct (writes a new record)',
  'feedback.correctionReason': 'Correction reason',
  'feedback.exactTarget': 'Exact subject',
  'feedback.supersedes': 'Supersedes',
  'outcomes.deliverableId': 'Deliverable id',
  'outcomes.conceptId': 'Concept id',
  'outcomes.revision': 'Revision',
  'outcomes.availability': 'Availability',
  'outcomes.reason': 'Reason',
  'outcomes.asOf': 'As of',
  'outcomes.availabilityForm': 'Outcome availability',
  'outcomes.developmentForm': 'Development stage',
  'outcomes.metricForm': 'Metric observation',
  'outcomes.submitAvailability': 'Write availability',
  'outcomes.submitDevelopment': 'Write development stage',
  'outcomes.submitMetric': 'Write metric observation',
  'outcomes.success': 'Written.',
  'outcomes.stage': 'Development stage',
  'outcomes.context': 'Business context',
  'outcomes.metricKey': 'Metric key',
  'outcomes.metricValue': 'Value',
  'outcomes.unavailable': 'Unavailable (not stored as 0)',
  'outcomes.windowStart': 'Window start',
  'outcomes.windowEnd': 'Window end',
  'outcomes.region': 'Region',
  'outcomes.channel': 'Channel',
  'outcomes.limitations': 'Limitations',
  'evaluations.run': 'Run evaluation',
  'evaluations.loading': 'Loading evaluation data…',
  'evaluations.loadError': 'Could not load evaluation data. Records are not shown; this does not mean there are none.',
  'evaluations.retry': 'Retry',
  'evaluations.running': 'Running…',
  'evaluations.runFailed': 'Evaluation run failed.',
  'evaluations.definition': 'Definition',
  'evaluations.cases': 'Cases',
  'evaluations.assessmentReason': 'Assessment reason',
  'evaluations.submitAssessment': 'Submit human assessment',
  'evaluations.exportReport': 'Export report',
  'evaluations.exported': 'Report written.',
  'evaluations.exporting': 'Exporting report…',
  'evaluations.exportFailed': 'Report export failed; no files were written.',
  'evaluations.reportArtifacts': 'Report files',
  'evaluations.artifactJson': 'JSON report',
  'evaluations.artifactMarkdown': 'Markdown report',
  'evaluations.viewArtifact': 'View',
  'evaluations.hideArtifact': 'Hide',
  'evaluations.downloadArtifact': 'Download',
  'evaluations.status.pass': 'Pass ✓',
  'evaluations.status.fail': 'Fail ✗',
  'evaluations.status.warning': 'Warning !',
  'evaluations.status.notApplicable': 'Not applicable —',
  'evaluations.status.error': 'Error ×',
  'deliverable.package': 'Decision package',
  'deliverable.revision': 'Deliverable revision',
  'deliverable.verifyMismatch': 'Hash verification failed: these files differ from the frozen snapshot',
  'deliverable.verifyError': 'Verification could not run, so file integrity is unknown. Try again later.',
  'deliverable.verifyMissingArtifact': 'Missing export file',
  'deliverable.verifySnapshotMismatch': 'Frozen snapshot content differs from its recorded hash',
  'deliverable.verifyArtifactCount': 'Export file count does not match the package',
  'deliverable.verifyOtherCheck': 'Another integrity check failed',
  'deliverable.enum.audience.internalReview': 'Internal review',
  'deliverable.enum.audience.designerHandoff': 'Designer handoff',
  'deliverable.enum.audience.publicPortfolio': 'Public portfolio',
  'deliverable.enum.status.generating': 'Generating',
  'deliverable.enum.status.ready': 'Ready',
  'deliverable.enum.status.failed': 'Failed',
  'deliverable.enum.status.invalidated': 'Invalidated',
  'deliverable.enum.status.withdrawn': 'Withdrawn',
  'deliverable.enum.status.archived': 'Archived',
  'review.enum.cause.upstreamStale': 'Upstream record is stale',
  'review.enum.cause.briefRevisionChanged': 'Brief revision changed',
  'review.enum.cause.conceptSetRevisionChanged': 'Concept set revision changed',
  'review.enum.cause.conceptRevisionChanged': 'Concept revision changed',
  'review.enum.cause.visualReferenceWithdrawn': 'Visual reference withdrawn',
  'review.enum.cause.approvalRevoked': 'Approval revoked',
  'review.enum.cause.evidenceWithdrawn': 'Evidence withdrawn',
  'review.enum.cause.artifactIntegrityFailed': 'Artifact integrity check failed',
  'review.decisionReason': 'Decision reason (required to approve, request changes, reject, request research, or revoke approval; optional when selecting a direction)',
  'review.decisionReasonRequired': 'Enter a decision reason first.',
  'feedback.targetDeliverable': 'Feedback target (deliverable)',
  'feedback.conceptRevision': 'Selected concept revision',
  'feedback.followUpMissing': 'The originating deliverable was not found. Choose an existing deliverable below.',
  'feedback.followUpStale': 'The originating deliverable has a newer revision. Submitting uses the current revision shown below.',
  'feedback.enum.subject.deliverable': 'Deliverable',
  'feedback.enum.subject.concept': 'Concept',
  'feedback.enum.subject.brief': 'Brief',
  'feedback.enum.subject.opportunity': 'Opportunity',
  'feedback.enum.subject.evidence': 'Evidence',
  'feedback.enum.subject.workflowStep': 'Workflow step',
  'feedback.enum.action.adopted': 'Adopted',
  'feedback.enum.action.modified': 'Modified',
  'feedback.enum.action.rejected': 'Rejected',
  'feedback.enum.action.ignored': 'Ignored',
  'feedback.enum.action.needsFollowUp': 'Needs follow-up',
  'feedback.enum.action.unableToAssess': 'Unable to assess',
  'feedback.enum.reason.evidenceUseful': 'Evidence was useful',
  'feedback.enum.reason.evidenceMissing': 'Evidence was missing',
  'feedback.enum.reason.other': 'Other',
  'feedback.enum.validity.valid': 'Valid',
  'feedback.enum.validity.partlyValid': 'Partly valid',
  'feedback.enum.validity.invalid': 'Invalid',
  'feedback.enum.validity.unknown': 'Unknown',
  'feedback.enum.effort.none': 'None',
  'feedback.enum.effort.light': 'Light',
  'feedback.enum.effort.moderate': 'Moderate',
  'feedback.enum.effort.heavy': 'Heavy',
  'feedback.enum.effort.unknown': 'Unknown',
  'feedback.enum.time.notEstimated': 'Not estimated',
  'feedback.enum.time.none': 'None',
  'feedback.enum.time.under15m': 'Under 15 minutes',
  'feedback.enum.time.m15to30': '15–30 minutes',
  'feedback.enum.time.m30to60': '30–60 minutes',
  'feedback.enum.time.over60m': 'Over 60 minutes',
  'feedback.enum.reality.userTest': 'User test',
  'feedback.enum.reality.realWork': 'Real work',
  'feedback.enum.reality.recordedDemo': 'Recorded demo',
  'feedback.enum.visibility.projectPrivate': 'Project private',
  'feedback.enum.visibility.internalDemo': 'Internal demo',
  'feedback.enum.visibility.viewOnly': 'View only',
  'outcomes.enum.availability.notYetObserved': 'Not yet observed',
  'outcomes.enum.availability.notAvailable': 'Not available',
  'outcomes.enum.availability.notAuthorized': 'Not authorized',
  'outcomes.enum.availability.availablePartial': 'Partly available',
  'outcomes.enum.availability.available': 'Available',
  'outcomes.enum.stage.handedOff': 'Handed off',
  'outcomes.enum.stage.sampled': 'Sampled',
  'outcomes.enum.stage.revisedAfterSample': 'Revised after sample',
  'outcomes.enum.stage.produced': 'Produced',
  'outcomes.enum.stage.listed': 'Listed',
  'outcomes.enum.stage.selling': 'Selling',
  'outcomes.enum.stage.closed': 'Closed',
  'outcomes.enum.stage.stopped': 'Stopped',
  'evaluations.runLabel': 'Evaluation run',
  'evaluations.followUpContext': 'Originating deliverable:',
  'evaluations.followUpProjectScope': 'Fixed evaluations run per project and cover all project records, not only this deliverable.',
  'evaluations.enum.rating.meets': 'Meets',
  'evaluations.enum.rating.partlyMeets': 'Partly meets',
  'evaluations.enum.rating.doesNotMeet': 'Does not meet',
  'evaluations.enum.rating.unableToAssess': 'Unable to assess',
  'evaluations.enum.verdict.pass': 'Pass',
  'evaluations.enum.verdict.partial': 'Partial',
  'evaluations.enum.verdict.fail': 'Fail',
  'evaluations.enum.verdict.error': 'Error',
  'evaluations.enum.execution.completed': 'Completed',
  'evaluations.enum.execution.partial': 'Partial',
  'evaluations.enum.execution.failed': 'Failed',
  'evaluations.enum.execution.cancelled': 'Cancelled',
  'evaluations.enum.definition.draft': 'Draft',
  'evaluations.enum.definition.published': 'Published',
  'evaluations.enum.definition.retired': 'Retired',
  'evaluations.enum.severity.blocker': 'Blocker',
  'evaluations.enum.severity.major': 'Major',
  'evaluations.enum.severity.minor': 'Minor',
  'evaluations.enum.severity.info': 'Info',
  'evaluations.caseNegative': 'Isolated negative case',
  'evaluations.criterion': 'Criterion',
  'improvements.enum.status.proposed': 'Proposed',
  'improvements.enum.status.accepted': 'Accepted',
  'improvements.enum.status.deferred': 'Deferred',
  'improvements.enum.status.planned': 'Planned',
  'improvements.enum.status.resolved': 'Resolved',
  'improvements.enum.status.wontFix': "Won't fix",
  'improvements.enum.status.superseded': 'Superseded',
  'improvements.enum.status.reopened': 'Reopened',
  'analysis.enum.dedupe.unreviewed': 'Not deduplicated',
  'analysis.enum.dedupe.candidateMatch': 'Possible duplicate',
  'analysis.enum.dedupe.confirmedSame': 'Confirmed duplicate',
  'analysis.enum.dedupe.confirmedDistinct': 'Confirmed distinct',
  'analysis.enum.objectStatus.active': 'Active',
  'analysis.enum.objectStatus.stale': 'Stale',
  'analysis.enum.objectStatus.invalidated': 'Invalidated',
  'analysis.enum.objectStatus.archived': 'Archived',
  'analysis.enum.review.candidate': 'Candidate',
  'analysis.enum.review.selected': 'Selected',
  'analysis.enum.review.rejected': 'Rejected',
  'analysis.enum.review.needsMoreResearch': 'Needs more research',
  'analysis.enum.signalType.searchGrowth': 'Search growth',
  'analysis.enum.signalType.rankPosition': 'Rank position',
  'analysis.enum.signalType.viewCount': 'View count',
  'analysis.enum.signalType.engagement': 'Engagement',
  'analysis.enum.signalType.saveRate': 'Save rate',
  'analysis.enum.signalType.selloutClaim': 'Sellout claim',
  'analysis.enum.signalType.crossSourcePresence': 'Cross-source presence',
  'common.labelSeparator': ': ',
  'common.listSeparator': '; ',
  'overview.stagesLoading': 'Reading stage records…',
  'overview.stagesError': 'Stage records could not be read, so stage status is not shown.',
}
