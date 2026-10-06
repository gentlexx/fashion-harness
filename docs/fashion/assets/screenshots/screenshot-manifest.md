# Screenshot Evidence Manifest

English | [中文](screenshot-manifest.zh.md)

Status: `T06_CAPTURED_AND_VERIFIED`

These screenshots were captured from the locally frozen application commit during T-06 independent verification. They are evidence of visible product states, not claims of live market data, commercial outcomes, or a passing full-repository documentation suite.

## Shared capture metadata

- Capture date: `2026-10-06`
- Application commit: `c1a8010b72764876b17744776d674fefc35d4ea9`
- Screenshot evidence commit: `0a24188df7953fbc61bf21e001349b63bdd3d00e`
- Startup: `pnpm dsh --profile fashion` with a fresh local `DSH_HOME`
- API key: none entered, read, or displayed; the first-run dialog was dismissed with **Configure later**
- Runtime check: local page returned HTTP 200
- Automated checks on the application commit: build passed with 252 client artifacts; typecheck passed; 46 Fashion-focused test files / 284 tests passed
- Browser scope: the public case and main Research → Analysis → Design → Review → Deliverable/Evaluation path were inspected manually

## Evidence index

| File | Visible scene and boundary | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| `01-fashion-home.png` | Fashion profile home, independent Fashion Harness identity, public case entry, and local project entry. | 1330×1292 | `5c06ad7cf79cbc3470947de333a49cf45474d9a7adb48b16acb8a7a86ec965fa` |
| `02-project-brief.png` | Local project overview and workflow stages. This also exposes the current boundary: project creation accepts a name, but there is no complete Brief revision interface. | 1330×1292 | `775394d64af00325ea6cab0d3f6e2c3923d5728630d10f7de047a442bd4fee5d` |
| `03-research-evidence.png` | Research task with Source, Sample, Evidence, review status, and traceability. Linked-source existence and attribution are not fully reverified for public use. | 1330×1292 | `d03accb2285d2ef4ab8382cecb51393702174a21c2be88c000033d83a7e6b2e0` |
| `04-analysis-opportunity.png` | Structured market items, signals, trend cluster, and design opportunity. The content is a fixed demonstration case, not live market intelligence. | 1330×1292 | `1faec5128ac4783b8821b862e54b59ea5402095dfa666b2d89ad5ad638fc0b58` |
| `05-three-concepts-review.png` | Three design directions, human review, and selected direction. Improvement candidates do not guarantee strong consistency across every derived record. | 1330×1292 | `0094a67b3bface683e1d55a34c2911155d2aa3aa4e027f40c1e9f2a720e3469a` |
| `06-deliverable-evaluation.png` | Deliverable and fixed evaluation view. It is not real designer validation or commercial evidence; evaluation verification depends on a Git checkout. | 1330×1292 | `2071c3769ba1fd59a83ca6e737d93ee16c65e3ac4cf0ca322da5e51f46c27c8a` |

## Interpretation boundary

The screenshots validate what was visible in one local run of the stated application commit. They do not independently validate source rights, factual market claims, model quality, long-term persistence, production security, designer adoption, or business value. The complete T-06 result includes disclosed upstream-document link debt outside the new public materials.
