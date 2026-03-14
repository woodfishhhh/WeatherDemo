# PLAYWRIGHT E2E GUIDE

## OVERVIEW
`tests/e2e/` contains browser-level Playwright specs for complete user flows against the local Vite dev server.

## STRUCTURE
```text
tests/e2e/
├── home.spec.ts
├── city-*.spec.ts
├── workspace.spec.ts
└── settings.spec.ts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Runner config | `../../playwright.config.ts` | base URL, trace mode, dev server contract |
| Home/search flow | `home.spec.ts` | entry flow coverage |
| City detail flow | `city-detail.spec.ts`, `city-air-quality.spec.ts`, `city-trends.spec.ts` | detail, AQI, trends |
| Workspace flow | `workspace.spec.ts` | compare/dashboard journey |
| Settings flow | `settings.spec.ts` | persisted settings behavior |

## CONVENTIONS
- Playwright uses `http://127.0.0.1:4173` and starts the app with `npm run dev`.
- Specs should stay user-journey oriented: navigation, visible state, and browser-observable behavior.
- Failures keep traces via `retain-on-failure`; prefer assertions that help trace real UI regressions.
- Keep browser tests here even when related unit tests live under `src/`.

## ANTI-PATTERNS
- Do not add Vitest-style unit tests here.
- Do not hardcode a different dev-server port unless config changes with it.
- Do not move browser flow coverage into `src/**/__tests__`.
