# Validation and Evidence

English | [中文](validation-and-evidence.zh.md)

## 1. Evidence principle

A validation conclusion is tied to the code state and stage that actually ran. T-04 covered publication-focused changes. T-06 independently exercised the frozen application commit; it did not turn retained upstream documentation debt into a pass.

## 2. Frozen states

- Application commit: `c1a8010b72764876b17744776d674fefc35d4ea9`
- Screenshot evidence commit: `0a24188df7953fbc61bf21e001349b63bdd3d00e`
- Validation date: `2026-10-06`
- Validation copy: a separate local clone created from the application commit
- Runtime data: a fresh isolated local `DSH_HOME`
- Credentials: no real API key was entered, read, or displayed

## 3. T-06 result

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Offline frozen-lockfile installation | Passed | 1,267 packages; zero downloads; non-blocking workspace warnings recorded |
| Full build | Passed | 252 client artifacts and 2 public values recorded; bundle-size warnings are non-blocking |
| Typecheck | Passed | Repository typecheck completed successfully |
| Fashion-focused suite | Passed | 46 test files / 284 tests passed |
| Client UI i18n | Passed | 651 client UI source files checked |
| Package invariants | Passed | 39 hand-owned companions checked |
| TypeScript paths | Passed | Generated aliases were current |
| Cordis configuration | Passed | 144 config files checked |
| Mermaid, third-party notices, public repository links | Passed | Corresponding repository gates completed successfully |
| Fresh-home Fashion startup | Passed | Fashion profile started with isolated local state |
| Page availability | Passed | Local page returned HTTP 200 with content |
| No-key browsing | Passed with a visible step | The first-run API-key dialog appeared, could be dismissed with **Configure later**, and no key was supplied; it reappears on a fresh direct load |
| Manual main flow | Passed for the inspected deterministic case | Project, Research, Analysis, Design, Review, Deliverable, and fixed Evaluation views were inspected |
| Screenshot evidence | Passed | Six 1330×1292 screenshots recorded with SHA-256 values and scene boundaries |

The verified run path was:

```bash
pnpm install --offline --frozen-lockfile
pnpm run build
pnpm run typecheck
pnpm dsh --profile fashion
```

## 4. Disclosed non-passing repository checks

T-06 does **not** claim that every repository gate passes:

- corpus-wide translation pairing reported 208 violations. Fashion-specific violations were zero; the reported pairs are retained upstream documents whose English and Chinese links point to intentionally excluded `.agents` content;
- the Markdown-link gate reported 923 broken links: 920 in retained upstream documents pointing to excluded `.agents` / `.github` content, plus three pre-existing Fashion package README self-anchor mismatches;
- the new root portfolio README, `NOTICE.md`, `docs/fashion/`, and the fictional walkthrough did not contribute a reported safety-scan finding or a broken link in the T-06 classification;
- these failures must be repaired or deliberately removed from the publication scope before a claim of repository-wide documentation health.

## 5. Browser and product boundaries observed

- a newly created local project currently accepts a project name but does not expose a complete Brief revision interface;
- the built-in R0 case is fixed demonstration content, not live market intelligence;
- linked-source existence and attribution are not fully reverified for public use;
- Improvement candidates do not guarantee strong consistency across all later source-state changes;
- fixed evaluation is not real designer validation or commercial evidence and some repository evidence depends on a Git checkout;
- no-key access proves deterministic browsing after dismissing the dialog, not live Agent/model execution.

## 6. Evidence layers

- **Code evidence**: domain objects, controllers, configuration, tests, and package structure;
- **Automated evidence**: installation, build, typecheck, focused tests, and static-gate logs;
- **Runtime evidence**: isolated startup, HTTP response, and browser inspection;
- **Visual evidence**: six screenshots listed in the [screenshot evidence manifest](assets/screenshots/screenshot-manifest.md);
- **Version evidence**: separate application and evidence commits;
- **Human boundary review**: explicit observation of what the interface does not yet implement.

## 7. Public conclusion

The frozen Fashion Harness application candidate is reproducibly buildable and its inspected deterministic Fashion path is runnable without entering an API key after dismissing the first-run dialog. This supports a portfolio claim of product/system design, AI-assisted implementation coordination, testing, and evidence-based delivery. It does not support claims of live market data, autonomous multi-agent production, real-designer outcomes, commercial value, or a completely clean repository-wide documentation suite.
