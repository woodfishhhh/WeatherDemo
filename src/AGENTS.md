# SOURCE TREE GUIDE

## OVERVIEW
`src/` contains all app code, generated Vue declarations, feature modules, and the shared Vitest/MSW test harness.

## STRUCTURE
```text
src/
├── composables/   # root-level app hooks shared across routes/features
├── views/         # route wrappers; keep page shells light
├── components/    # shared UI used across routes/features
├── features/      # domain modules; primary home for business logic
├── router/        # route table and title hook
├── config/        # env parsing and config contracts
├── lib/           # low-level shared infrastructure
├── test/          # Vitest setup + MSW handlers
├── services/      # compatibility shim layer
├── auto-imports.d.ts
└── components.d.ts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App mount | `main.ts`, `App.vue` | bootstrap, app shell, navigation |
| Root app hooks | `composables/` | cross-route helpers such as theme behavior |
| New route page | `views/`, `router/index.ts` | keep route wrapper thin |
| Shared visual component | `components/` | use for cross-feature UI |
| Feature behavior/state | `features/` | composables, stores, services, feature-local tests |
| Environment wiring | `config/env.ts`, `firebase.ts`, `lib/http/client.ts` | provider + infra boundaries |
| Unit test setup | `test/setup.ts`, `test/msw/` | shared mocks and global test setup |

## CONVENTIONS
- Prefer new business logic in `features/`, not in `views/`.
- Keep reusable UI in `components/`; keep feature-specific UI inside its feature when it is not cross-cutting.
- `services/savedCities.ts` is a re-export shim into `features/locations/services/persistence.ts`.
- Unit tests live next to source under `__tests__` or `*.spec.ts`; shared test support lives in `src/test/`.
- Treat `auto-imports.d.ts` and `components.d.ts` as generated artifacts.

## ANTI-PATTERNS
- Do not add heavy orchestration directly to `views/` if the logic belongs in a feature composable/store.
- Do not add Playwright specs inside `src/`.
- Do not bypass `@` imports with long relative paths when crossing major source boundaries.
