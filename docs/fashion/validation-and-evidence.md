# Validation and Evidence

English | [中文](validation-and-evidence.zh.md)

## 1. Evidence principle

A validation conclusion must be tied to the stage that actually ran and the corresponding code state. T-04 proves only its publication-focused checks; it does not replace final T-06 application acceptance.

## 2. T-04 verified

| Check | Result | Meaning |
| --- | --- | --- |
| Focused Fashion tests | 7 test files / 60 tests passed | Covered behavior affected by publication changes |
| Focused brand rerun | 1 test file / 2 tests passed | Rechecked Fashion identity after adjustments |
| Package invariants | Passed | Fashion package metadata and constraints |
| TypeScript path references | Passed | Project-reference consistency |
| Cordis configuration | Passed | Configuration structure |
| Client UI i18n | Passed | UI internationalization constraints |
| Diff whitespace check | Passed | No whitespace errors in the diff |

These results are **T-04 verified**. They do not represent the full repository test count or mean that final browser acceptance has passed.

## 3. T-06 pending

| Check | Current status | Acceptance criterion |
| --- | --- | --- |
| Lockfile installation | Pending T-06 | Install from the lockfile without unexpected changes |
| Full build | Pending T-06 | `pnpm run build` succeeds |
| Full typecheck | Pending T-06 | The project typecheck succeeds |
| Focused Fashion suite | Pending T-06 | Target tests pass on the final application commit |
| Fashion profile startup | Pending T-06 | Starts with a fresh local data directory |
| Page availability | Pending T-06 | Fashion page loads successfully |
| No-key experience | Pending T-06 | Onboarding does not obscure the Fashion flow; no real key is entered |
| Core browser flow | Pending T-06 | The evidence script completes and produces reviewable records |
| Screenshots | Pending T-06 | Captured only from the final application commit with SHA and scenario |

The intended run path is:

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm dsh --profile fashion
```

These commands are the T-06 run entry, not a claim that final verification has already passed.

## 4. Evidence layers

- **Code evidence**: domain objects, controllers, configuration, tests, and package structure;
- **Automated evidence**: test and static-gate logs;
- **Runtime evidence**: T-06 startup records, browser path, and final screenshots;
- **Human evidence**: review of revision binding, design differentiation, and disclosed limitations;
- **Version evidence**: the final application commit and a separate later evidence commit.

The screenshot directory currently contains only a manifest, with no placeholder image or simulated interface. See the [screenshot evidence manifest](assets/screenshots/screenshot-manifest.md).

## 5. Conclusions that cannot be drawn yet

- T-04 does not prove that every repository build and test passes;
- a fictional walkthrough does not prove designer satisfaction or commercial value;
- an R0 seed does not prove live market state;
- code presence does not prove independent mastery of every technology;
- no screenshot or SHA may be labeled final evidence before T-06.
