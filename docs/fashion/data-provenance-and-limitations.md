# Data Provenance and Limitations

English | [中文](data-provenance-and-limitations.zh.md)

## 1. Current data strategy

The current implementation builds a small traceable research chain:

`ResearchTask → Source → Sample → Evidence → AnalysisRun → TrendCluster → DesignOpportunity`

`Source` records provenance and access information, `Sample` captures the analyzed item, and `Evidence` stores a claim for human review. Analysis results should not be detached from these objects and presented as live market fact.

## 2. Role of the R0 seed

The repository includes an R0 seed to demonstrate object relationships and workflow. Publication work downgraded precise values that could not be stably reverified: affected evidence remains pending review, volatile exact values are no longer presented as verified facts, and a derived price statement remains explicitly derived and pending review with its basis recorded.

R0 is not a complete dataset, does not represent a live market overview, and is not a commercial forecast. Real brand pages or URLs are used only as provenance examples and do not imply partnership, authorization, or endorsement.

## 3. Known limitations

The following boundaries must remain public:

1. **Analysis-reference existence and ownership are incomplete**: not every path enforces that a referenced research object exists and belongs to the same project;
2. **There is no complete Brief revision interface**: the current interface does not cover every field, revision difference, and complete revision experience;
3. **Improvement candidates are not strongly consistent**: an `ImprovementItem` is a suggestion, not an automatic fix or a strongly consistent projection of every source object;
4. **Evaluation depends on a Git checkout**: some evaluation evidence uses repository and Git context and should not be described as portable to every deployment;
5. **Final verification is incomplete**: full build and no-key browser flow remain `Pending T-06`.

## 4. Privacy and credential boundary

- the repository must not contain a real API key, access token, or personal credential;
- `.env.example` contains empty variable names only;
- local storage, settings, credentials, and user data are not public material;
- no real client Brief, unauthorized conversation, or personal data is used in demonstrations;
- the fictional walkthrough cannot be presented as real-user evidence.

## 5. Rights and brand

This project is based on DeepSeek Harness `dsh-v0.1.5-rc.2` (upstream commit `fb2c4b9e698e30edb738bca4cf0618587db7d203`) and is an independent derivative. Rights in upstream code and marks remain with their owners; Fashion-specific design and new material follow the repository notices. There is no official affiliation, partnership, or endorsement by DeepSeek AI.

See the root `NOTICE.md`, `LICENSE`, and `BRAND_GUIDELINES.md`.

## 6. Long-term data direction is not current capability

The long-term plan combines a Fashion Dataset, Fashion Ontology, designer feedback, an evaluation system, and a model-improvement loop. The current repository does not implement large-scale collection authorization, complete data governance, vertical-model training, or real market-outcome feedback, so planning is not used as substitute evidence.
