# FEATURE MODULE GUIDE

## OVERVIEW
`src/features/` is the main domain layer: search/saved locations, weather data, workspace comparison, settings, and air-quality utilities.

## STRUCTURE
```text
features/
├── air-quality/   # utility-heavy support logic
├── locations/     # search, persistence, geolocation, saved-city store
├── settings/      # settings store + tests
├── weather/       # QWeather adapter, normalization, weather store, view orchestration
└── workspace/     # compare/group dashboard components + orchestration
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Saved-city persistence/sync | `locations/services/` | local storage + cloud sync logic |
| Search + current location | `locations/stores/`, `locations/composables/` | home flow entry point |
| Weather provider behavior | `weather/services/` | normalization and adapter rules |
| Weather view orchestration | `weather/composables/` | city detail behavior |
| Workspace compare flows | `workspace/composables/`, `workspace/components/` | route-driven dashboard logic |
| App settings | `settings/stores/` | hydration + persistence |

## CONVENTIONS
- Each feature owns its local `stores/`, `services/`, `composables/`, `utils/`, and `components/` only as needed.
- Keep tests close to the feature code under `__tests__`.
- Put feature-specific types in the feature unless they are truly shared across unrelated domains.
- Shared UI that serves multiple features still belongs in `src/components/`.
- Route wrappers in `src/views/` should delegate into these feature modules rather than duplicating stateful logic.

## ANTI-PATTERNS
- Do not add new domain logic to root `src/services/` when a feature-owned service fits.
- Do not move cross-feature reusable UI into a single feature folder.
- Do not duplicate persistence or provider normalization logic across feature boundaries.
