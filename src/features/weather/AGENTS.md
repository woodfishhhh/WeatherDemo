# WEATHER FEATURE GUIDE

## OVERVIEW
`src/features/weather/` owns QWeather integration, provider normalization, weather-facing domain types, and city-detail data orchestration.

## STRUCTURE
```text
weather/
├── composables/   # view orchestration such as `useCityWeatherView`
├── services/      # QWeather adapter + service tests
├── stores/        # app-facing weather state
├── types.ts       # normalized weather domain contracts
└── utils/         # small weather-specific helpers
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Provider requests | `services/qweather.ts` | main adapter; largest hotspot in repo |
| Provider edge cases | `services/__tests__/` | Vitest + MSW coverage for normalization and errors |
| Weather state | `stores/weather.ts` | app-facing bundle and summaries |
| City detail orchestration | `composables/useCityWeatherView.ts` | route-driven loading flow |
| Shared weather contracts | `types.ts` | bilingual text, bundle, trend, AQI state |

## CONVENTIONS
- Keep raw provider handling and normalization inside `services/`; UI-facing code should consume normalized types.
- Add new provider behavior tests beside the service under `services/__tests__/`.
- Keep cross-page weather state in `stores/weather.ts`; keep page wiring in composables.
- Reuse `types.ts` for feature contracts instead of recreating ad hoc weather shapes elsewhere.
- Treat air-quality and historical-trend availability as dataset-state concerns, not UI-only booleans.

## ANTI-PATTERNS
- Do not leak raw QWeather payloads beyond the service layer.
- Do not put route or component concerns into `qweather.ts`.
- Do not duplicate normalized weather types in components, stores, or other features.
