# Professional Weather Platform Expansion

## TL;DR
> **Summary**: Evolve the current two-page Vue weather app into a modular professional weather platform by introducing typed provider adapters, Pinia-based state management, automated testing, and expanded weather intelligence while preserving the existing monochrome GSAP/Lenis visual language.
> **Deliverables**:
> - Pinia-based platform architecture with typed feature modules
> - Refactored home, city detail, dashboard, and settings experiences
> - Expanded weather intelligence: hourly, daily, air quality, history/trends, multi-city compare
> - Automated verification stack: Vitest + Playwright + MSW
> - Security/config hardening for env usage and provider boundaries
> **Effort**: XL
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 6 → Task 7 → Task 10

## Context
### Original Request
- 全面拓展此 app 功能。
- UI 设计保持原样。
- 使用 skills。
- 视觉方向：Minimalist avant-garde / black & white / Nordic minimal / flowing wave lines / scroll-driven animation / asymmetric layout / large whitespace / clean sans-serif / restrained motion.

### Interview Summary
- Product direction locked to **professional weather platform**.
- Scope locked to **full platform edition in one master plan**.
- Test strategy locked to **add automated testing from scratch**.
- UI boundary locked to **same design language may expand with new charts/panels**.
- State strategy locked to **direct Pinia adoption**.
- Provider direction locked to **full QWeather migration** for geo/weather capabilities, with the user-provided API key kept out of version control and only referenced through env/config.

### Metis Review (gaps addressed)
- Provider capability is a real scope boundary, so the plan standardizes on **QWeather** as the single weather/geo provider target behind typed adapters, replacing the earlier AMap/Open-Meteo split.
- If a capability from the original expansion plan is unavailable in the chosen QWeather-accessible API surface, implementation must prefer an explicit unavailable/fallback state over introducing a second provider.
- The user-provided QWeather API key is runtime-only input and must never be committed; all access must flow through the typed env/config layer.
- Current component-local `axios` calls and `SavedCity` persistence are insufficient for platform growth; the plan centralizes network access and defines a canonical location model.
- Anonymous local/cloud sync stays in scope, but auth, billing, severe-alert integrations, and radar-heavy map work stay out of scope for this plan.
- Testing must be established early; deterministic mocked network flows are mandatory before feature expansion.
- Global GSAP/Lenis shell must be preserved; new modules extend the design system rather than rewriting the shell.

## Work Objectives
### Core Objective
Transform the app from a search + saved-city viewer into a modular weather platform with professional-grade weather intelligence, compare/workspace flows, durable preferences, and automated verification, without breaking the existing brand language.

### Deliverables
- Pinia installation and feature-store architecture
- Typed weather domain models and QWeather-first provider adapters
- Shared network/config layer with env validation
- Home search refactor with cancellable suggestions and typed results
- City intelligence page with current, hourly, daily, air quality, and historical trend modules
- Workspace dashboard for multi-city monitoring and grouped saved locations
- Settings/personalization route for units, timezone, motion, and workspace defaults
- Reusable monochrome panels, charts, skeletons, and error states
- Vitest + Playwright + MSW test harness
- `.env.example`, provider/config documentation artifacts, and QWeather icon integration called for by the implementation tasks

### Definition of Done (verifiable conditions with commands)
- `npm run type-check` exits 0
- `npm run build` exits 0
- `npm run test:unit` exits 0
- `npx playwright test` exits 0
- Home, detail, dashboard, and settings routes render successfully with mocked network responses
- Saved location sync works across reload using the migrated persistence layer
- No feature module performs direct `axios` calls inside route views or presentational components

### Must Have
- Preserve existing monochrome typography-led layout and global motion shell
- Add Pinia stores by feature instead of a single app-wide mega store
- Normalize provider responses into shared domain types before UI consumption
- Mock external providers in automated tests
- Use route-thin view composition for new heavy pages
- Keep local/cloud saved-location sync, but move it behind the new architecture

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No redesign into colorful dashboard chrome or generic SaaS UI
- No replacement of Lenis/GSAP route shell in `src/App.vue`
- No direct provider calls from components after refactor
- No single `useAppStore()` owning all state
- No auth/billing/team features
- No radar/severe-alert provider expansion in this plan
- No persistence of raw weather payloads into localStorage/Firebase
- No committed real secrets; env hardening is mandatory

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: **Task 1 bootstraps the stack, then TDD for services/stores and tests-after for shell-level UI composition where markup is introduced before assertion wiring**
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: foundation and architecture (Tasks 1-5)
- test/tooling foundation
- typed domain/provider layer
- Pinia/store scaffold
- persistence migration
- config/env/security hardening

Wave 2: core weather experience (Tasks 6-9)
- home search refactor
- city intelligence refactor
- air quality + comfort metrics
- historical trend visualization

Wave 3: platform surface and polish (Tasks 10-13)
- dashboard/workspace route
- settings/personalization route
- reusable monochrome UI system expansion
- performance/caching/error-hardening pass

### Dependency Matrix (full, all tasks)
- Task 1 blocks Tasks 6-13
- Task 2 blocks Tasks 3-13
- Task 3 blocks Tasks 4, 6-13
- Task 4 blocks Tasks 6, 10, 11, 13
- Task 5 blocks Tasks 6-13
- Task 6 blocks Task 10
- Task 7 blocks Tasks 8, 9, 13
- Task 8 blocks Tasks 10, 13
- Task 9 blocks Tasks 10, 12
- Task 10 blocks Task 13
- Task 11 blocks Task 13
- Task 12 blocks Task 13

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 5 tasks → unspecified-high, deep, quick
- Wave 2 → 4 tasks → visual-engineering, unspecified-high, deep
- Wave 3 → 4 tasks → visual-engineering, unspecified-high, deep

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Bootstrap automated verification foundation

  **What to do**: Add Vitest, Vue Test Utils, Playwright, and MSW; define `test:unit`, `test:e2e`, and shared mock-server scripts; wire test configs into the existing Vite/TypeScript setup without disturbing the production build.
  **Must NOT do**: Must not rewrite the existing build pipeline, replace Vite plugins, or introduce Cypress/Jest in parallel.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: cross-cutting tooling work with config, scripts, and initial tests.
  - Skills: [`vue-best-practices`, `superpowers/test-driven-development`] — needed to keep Vue test structure clean and enforce test-first after the harness exists.
  - Omitted: [`frontend-ui-ux`] — no visual design decisions are needed here.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] | Blocked By: []

  **References**:
  - Pattern: `package.json:6-12` — current script structure that new test commands must extend rather than replace.
  - Pattern: `vite.config.ts:11-24` — active Vite plugin stack and alias setup.
  - Pattern: `tsconfig.node.json:4-10` — already anticipates `vitest.config.*` and `playwright.config.*`.
  - Pattern: `tsconfig.app.json:3-4` — existing app include/exclude behavior.
  - External: `https://pinia.vuejs.org/cookbook/testing.html` — testing Pinia stores/components.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit` exits 0 with at least one store/service spec and one component spec.
  - [ ] `npx playwright test --list` exits 0 and enumerates home/detail/dashboard/settings smoke specs.
  - [ ] `npm run type-check` exits 0 after test config files are added.

  **QA Scenarios**:
  ```
  Scenario: Unit and component test harness runs
    Tool: Bash
    Steps: Run `npm run test:unit`
    Expected: Vitest completes successfully; output includes at least one `*.spec.ts` under features and one UI component spec.
    Evidence: .sisyphus/evidence/task-1-test-foundation.txt

  Scenario: E2E harness resolves route smoke tests
    Tool: Bash
    Steps: Run `npx playwright test --list`
    Expected: Playwright config loads with specs for home, city detail, workspace dashboard, and settings routes.
    Evidence: .sisyphus/evidence/task-1-test-foundation-e2e.txt
  ```

  **Commit**: YES | Message: `test(platform): add automated verification foundation` | Files: [`package.json`, `vitest.config.ts`, `playwright.config.ts`, `src/test/**`, `tests/e2e/**`, `tsconfig*.json`]

- [ ] 2. Build typed weather domain and QWeather adapter layer

  **What to do**: Create feature-first weather modules under `src/features/weather/` with canonical types for `LocationRecord { id, name, province, countryCode, latitude, longitude, timezone, adcode? }`, `CurrentConditions`, `HourlyForecastPoint`, `DailyForecastPoint`, `AirQualitySnapshot`, and `HistoricalTrendPoint`; keep `axios` as the single HTTP client but only behind `src/lib/http/client.ts`; add QWeather adapters so city lookup/search, current weather, hourly forecast, daily forecast, air-quality-compatible datasets, and any supported historical/trend data normalize into shared domain models. If a planned dataset is not available through the chosen QWeather-accessible API surface, return a typed unavailable state instead of introducing another provider.
  **Must NOT do**: Must not expose raw QWeather payloads to components or stores; must not keep `axios` calls embedded in views.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: requires domain modeling, QWeather normalization, and future-proof API boundaries.
  - Skills: [`vue-best-practices`, `superpowers/test-driven-development`] — feature boundaries plus normalization tests are the core risk reducers.
  - Omitted: [`frontend-ui-ux`] — this is service/domain work, not interface design.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13] | Blocked By: [1]

  **References**:
  - Pattern: `src/views/HomeView.vue:74-106` — existing provider search request path to replace with typed service calls.
  - Pattern: `src/components/AsyncCityView.vue:112-131` — current current/forecast fetch flow to normalize.
  - Pattern: `src/components/CityList.vue:26-43` — existing saved-city weather hydration flow that currently suffers from N+1 requests.
  - API/Type: `src/services/savedCities.ts:9-14` — current `SavedCity` contract that must be migrated into a canonical location model.
  - External: `https://dev.qweather.com/docs/api/geoapi/` — GeoAPI city lookup/search capabilities.
  - External: `https://dev.qweather.com/docs/api/weather/weather-now/` — current weather endpoint.
  - External: `https://dev.qweather.com/docs/api/weather/weather-hourly-forecast/` — hourly forecast endpoint.
  - External: `https://dev.qweather.com/docs/api/weather/weather-daily-forecast/` — daily forecast endpoint.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/features/weather/**/*.spec.ts` exits 0.
  - [ ] Invalid provider payload fixtures fail normalization gracefully and produce typed fallback errors.
  - [ ] No new route/component file added in later tasks needs direct provider-shape knowledge.

  **QA Scenarios**:
  ```
  Scenario: Provider normalization returns canonical weather models
    Tool: Bash
    Steps: Run `npm run test:unit -- src/features/weather/services/__tests__/normalizeWeather.spec.ts`
    Expected: Fixture-based tests prove QWeather payloads normalize into stable internal types and typed unavailable states where upstream capability is absent.
    Evidence: .sisyphus/evidence/task-2-provider-normalization.txt

  Scenario: Malformed payloads surface typed adapter errors
    Tool: Bash
    Steps: Run `npm run test:unit -- src/features/weather/services/__tests__/providerErrorHandling.spec.ts`
    Expected: Tests pass only if malformed or partial payloads return domain-safe error objects instead of crashing.
    Evidence: .sisyphus/evidence/task-2-provider-errors.txt
  ```

  **Commit**: YES | Message: `feat(weather): add typed qweather adapter layer` | Files: [`src/features/weather/**`, `src/lib/http/**`, `src/test/fixtures/weather/**`]

- [ ] 3. Introduce Pinia and feature store scaffolding

  **What to do**: Install Pinia, register it in `src/main.ts`, and create feature stores for locations, weather intelligence, settings, and workspace state. Keep route-thin composition by moving orchestration into stores + feature composables under `src/features/**`, and persist durable preferences through explicit feature services rather than a generic persisted-state plugin.
  **Must NOT do**: Must not create a single mega store, and must not move route params/query objects directly into persisted store state.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: framework wiring plus state-boundary design with moderate repo impact.
  - Skills: [`vue-best-practices`, `superpowers/test-driven-development`] — Pinia/store structure must follow Composition API conventions and be test-covered.
  - Omitted: [`frontend-ui-ux`] — no net-new UI surfaces are introduced yet.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [4, 6, 7, 8, 9, 10, 11, 12, 13] | Blocked By: [1, 2]

  **References**:
  - Pattern: `src/main.ts:1-11` — current app bootstrap location for Pinia installation.
  - Pattern: `src/router/index.ts:3-31` — route definitions and title handling that stores/composables must respect.
  - Pattern: `src/views/CityView.vue:1-15` — route-thin async shell pattern to preserve.
  - External: `https://pinia.vuejs.org/core-concepts/` — official store, getters, and actions guidance.
  - External: `https://router.vuejs.org/guide/advanced/composition-api.html` — route/query watching boundaries.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/features/**/stores/**/*.spec.ts` exits 0.
  - [ ] `npm run type-check` exits 0 with Pinia and all new feature-store imports.
  - [ ] No store imports `useRoute()` or persists raw route objects.

  **QA Scenarios**:
  ```
  Scenario: Stores initialize cleanly with fresh Pinia instances
    Tool: Bash
    Steps: Run `npm run test:unit -- src/features/**/stores/**/*.spec.ts`
    Expected: All store tests pass with isolated Pinia setup and mocked services.
    Evidence: .sisyphus/evidence/task-3-pinia-stores.txt

  Scenario: Type-safe app bootstrap remains intact
    Tool: Bash
    Steps: Run `npm run type-check`
    Expected: Vue/TypeScript type-check succeeds after Pinia wiring and feature-store scaffolding.
    Evidence: .sisyphus/evidence/task-3-pinia-typecheck.txt
  ```

  **Commit**: YES | Message: `feat(platform): add Pinia feature store scaffold` | Files: [`package.json`, `src/main.ts`, `src/features/**/stores/**`, `src/features/**/composables/**`]

- [ ] 4. Migrate saved-location persistence into the new locations feature

  **What to do**: Replace direct `savedCities.ts` consumption with a feature-owned locations persistence service and Pinia store, add schema versioning, preserve localStorage + Firestore sync behavior, and define a canonical `LocationKey` based on adcode-first identity with coordinate fallback.
  **Must NOT do**: Must not break existing saved-location reload behavior, and must not persist provider payloads or transient request state.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: data migration, sync semantics, and backward compatibility make this a high-risk foundational task.
  - Skills: [`vue-best-practices`, `superpowers/test-driven-development`] — persistence logic must be isolated and regression-tested.
  - Omitted: [`frontend-ui-ux`] — this work is data/persistence centered.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [6, 10, 11, 13] | Blocked By: [1, 2, 3]

  **References**:
  - Pattern: `src/services/savedCities.ts:42-171` — existing cookie/localStorage/Firestore sync semantics to preserve while restructuring.
  - Pattern: `src/components/CityList.vue:17-18,45-67` — current consumers that rely on snapshot + sync callbacks.
  - Pattern: `src/components/AsyncCityView.vue:135-176` — current save/remove toggle behavior.
  - API/Type: `src/services/savedCities.ts:9-14` — legacy `SavedCity` contract to migrate without data loss.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/features/locations/**/*.spec.ts` exits 0.
  - [ ] A pre-migration localStorage payload in the legacy shape is upgraded without losing saved locations.
  - [ ] Firestore sync failure falls back to local data and exposes a typed recoverable state.

  **QA Scenarios**:
  ```
  Scenario: Legacy saved-city payload migrates successfully
    Tool: Bash
    Steps: Run `npm run test:unit -- src/features/locations/services/__tests__/migration.spec.ts`
    Expected: Tests prove old `savedCities` storage values become the new normalized location records with stable ids.
    Evidence: .sisyphus/evidence/task-4-location-migration.txt

  Scenario: Cloud sync failure preserves local workspace
    Tool: Bash
    Steps: Run `npm run test:unit -- src/features/locations/services/__tests__/syncFallback.spec.ts`
    Expected: Tests pass only if failed Firestore reads/writes keep local data available and mark sync state as recoverable.
    Evidence: .sisyphus/evidence/task-4-location-sync-fallback.txt
  ```

  **Commit**: YES | Message: `refactor(locations): migrate saved location persistence` | Files: [`src/features/locations/**`, `src/services/savedCities.ts`, `src/test/fixtures/locations/**`]

- [ ] 5. Harden env/config and provider access boundaries

  **What to do**: Create a typed env/config access layer, add `.env.example`, isolate QWeather URLs/keys and icon configuration behind config helpers, and document key variables and expected provider responsibilities so implementation stops reading `import.meta.env` directly from views/components.
  **Must NOT do**: Must not read secrets from runtime components after this change, and must not commit real credentials into new files.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: scoped config hardening with limited surface area but high policy value.
  - Skills: [`vue-best-practices`] — keep Vite/Vue env usage idiomatic.
  - Omitted: [`frontend-ui-ux`] — not relevant to config boundaries.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [6, 7, 8, 9, 10, 11, 12, 13] | Blocked By: [1, 2, 3]

  **References**:
  - Pattern: `src/views/HomeView.vue:63,80-82` — current direct env access for provider search.
  - Pattern: `src/components/AsyncCityView.vue:108,115-120` — current direct env access for weather requests.
  - Pattern: `src/components/CityList.vue:24,33-35` — current direct env access for card hydration requests.
  - Pattern: `src/firebase.ts:5-13` — existing Firebase env usage that should be aligned with typed config access.
  - Pattern: `AGENTS.md` — repo security guidance forbidding committed secrets.

  **Acceptance Criteria**:
  - [ ] `npm run type-check` exits 0 after replacing direct view-level env reads.
  - [ ] `.env.example` exists and documents all QWeather + Firebase variables without real values.
  - [ ] Feature services import configuration only from the new env module.

  **QA Scenarios**:
  ```
  Scenario: Config module compiles as the single env access point
    Tool: Bash
    Steps: Run `npm run type-check`
    Expected: Type-check succeeds and no component/view references `import.meta.env` directly except inside the central config module.
    Evidence: .sisyphus/evidence/task-5-env-typecheck.txt

  Scenario: Example env contract is complete
    Tool: Bash
    Steps: Run a repo search for `VITE_` variables and compare against `.env.example`
    Expected: Every runtime variable used by the app appears in `.env.example` with placeholder values and comments.
    Evidence: .sisyphus/evidence/task-5-env-audit.txt
  ```

  **Commit**: YES | Message: `chore(config): harden env and provider access` | Files: [`.env.example`, `src/config/**`, `src/firebase.ts`, `src/features/**/services/**`]

- [ ] 6. Refactor the home route into a typed intelligence entry surface

  **What to do**: Rebuild `HomeView` around feature stores/composables so search suggestions are cancellable, typed, and resilient; keep the current oversized search hero and saved-location section, but add platform-entry modules for recent locations, quick compare launch, and weather workspace shortcuts using the existing visual system.
  **Must NOT do**: Must not change the home route identity, collapse the whitespace-heavy layout into a dense dashboard, or keep debounced in-flight requests uncancelled.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: combines route refactor, interaction design preservation, and typed state wiring.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — needed to preserve the current visual tone while improving state orchestration.
  - Omitted: [`ui-ux-pro-max`] — the visual direction is already fixed and should not be reinvented.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [10] | Blocked By: [1, 2, 3, 4, 5]

  **References**:
  - Pattern: `src/views/HomeView.vue:2-35` — current hero structure and dropdown placement.
  - Pattern: `src/views/HomeView.vue:74-106` — search query flow to replace with typed store/service usage.
  - Pattern: `src/views/HomeView.vue:152-164` — current debounce watcher that needs cancellation support.
  - Pattern: `src/components/CityList.vue:1-9` — saved list placement that should stay visually subordinate to the search hero.
  - Pattern: `src/style.css:3-18` — monochrome tokens for new home modules.

  **Acceptance Criteria**:
  - [ ] `npx playwright test tests/e2e/home.spec.ts` exits 0.
  - [ ] Search requests cancel correctly when the user types quickly and stale results never overwrite fresh ones.
  - [ ] Home UI exposes stable selectors for the search input, results list, saved section, and workspace shortcuts.

  **QA Scenarios**:
  ```
  Scenario: Typing rapidly only shows the latest suggestion set
    Tool: Playwright
    Steps: Open `/`; fill `[data-testid="home-search-input"]` with `bei`; immediately replace with `beijing`; wait for `[data-testid="search-results"]`; inspect first result.
    Expected: Results correspond only to `beijing`; no stale `bei` list flashes after the final response resolves.
    Evidence: .sisyphus/evidence/task-6-home-search.png

  Scenario: Provider failure surfaces controlled empty/error state
    Tool: Playwright
    Steps: Mock search endpoint 500; open `/`; fill `[data-testid="home-search-input"]` with `shanghai`.
    Expected: `[data-testid="search-error"]` appears with non-breaking error copy; saved-locations section remains interactive.
    Evidence: .sisyphus/evidence/task-6-home-search-error.png
  ```

  **Commit**: YES | Message: `feat(home): refactor landing route for typed search and platform entry` | Files: [`src/views/HomeView.vue`, `src/features/home/**`, `tests/e2e/home.spec.ts`]

- [ ] 7. Rebuild the city route as the core weather intelligence page

  **What to do**: Replace `AsyncCityView`’s component-local fetch logic with store-backed feature composition, preserving the current dramatic hero temperature layout while adding structured current, hourly, and multi-day sections powered by the normalized provider layer.
  **Must NOT do**: Must not remove the route-thin `CityView.vue` shell pattern, and must not regress the existing save/remove preview flow.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: heavy page composition plus typed store integration and skeleton preservation.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — preserves view compositional quality while adding intelligence modules safely.
  - Omitted: [`ui-ux-pro-max`] — design direction is already fixed in the repo.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [8, 9, 13] | Blocked By: [1, 2, 3, 5]

  **References**:
  - Pattern: `src/views/CityView.vue:1-15` — keep the route wrapper thin with `Suspense` and a skeleton fallback.
  - Pattern: `src/components/AsyncCityView.vue:1-98` — existing page composition, hero balance, and empty-state placement.
  - Pattern: `src/components/AsyncCityView.vue:141-167` — current save/remove toggle semantics that must survive the refactor.
  - Pattern: `src/components/CityViewSkeleton.vue` — loading-state structure to preserve.
  - Pattern: `src/App.vue:12-18,98-108` — routed page transitions that the new page composition must remain compatible with.

  **Acceptance Criteria**:
  - [ ] `npx playwright test tests/e2e/city-detail.spec.ts` exits 0.
  - [ ] City detail renders current conditions, hourly strip, and multi-day forecast from mocked responses.
  - [ ] Save/remove actions update store state and persist through reload.

  **QA Scenarios**:
  ```
  Scenario: City intelligence page renders primary weather modules
    Tool: Playwright
    Steps: Mock current/hourly/daily responses; open `/weather/北京市/北京?adcode=110000`; wait for `[data-testid="city-current-panel"]`, `[data-testid="city-hourly-strip"]`, and `[data-testid="city-daily-grid"]`.
    Expected: All three modules render with mocked values; hero temperature remains visible and page has no console errors.
    Evidence: .sisyphus/evidence/task-7-city-detail.png

  Scenario: Save toggle persists across reload
    Tool: Playwright
    Steps: Open mocked city route; click `[data-testid="save-city-button"]`; reload page; inspect `[data-testid="save-city-button"]` and `[data-testid="saved-state-badge"]`.
    Expected: Saved state remains active after reload and local persistence reflects the location.
    Evidence: .sisyphus/evidence/task-7-city-detail-save.png
  ```

  **Commit**: YES | Message: `feat(city): rebuild detail route as weather intelligence page` | Files: [`src/views/CityView.vue`, `src/components/AsyncCityView.vue`, `src/features/city/**`, `tests/e2e/city-detail.spec.ts`]

- [ ] 8. Add air quality and comfort intelligence modules

  **What to do**: Extend the city experience with AQI, pollutant breakdown, UV/daylight/comfort metrics, and a QWeather-safe fallback strategy when specific variables are unavailable. Surface these as monochrome secondary panels rather than colorful dashboard widgets.
  **Must NOT do**: Must not introduce rainbow AQI styling, and must not hard-fail the page when a secondary metric is missing.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: this is feature UI on top of provider/domain logic with strong visual constraints.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — needed for typed metric composition and restrained panel design.
  - Omitted: [`ui-ux-pro-max`] — avoid broad stylistic drift.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [10, 13] | Blocked By: [1, 2, 3, 5, 7]

  **References**:
  - Pattern: `src/components/AsyncCityView.vue:18-43` — current three-column hero information balance to extend without clutter.
  - Pattern: `src/style.css:3-18` — keep new metric panels inside the monochrome token system.
  - Pattern: `src/components/CityCard.vue:15-29` — compact metadata labeling style to reuse for secondary stat rows.
  - External: `https://dev.qweather.com/docs/api/airquality/air-now/` — AQI and pollutant field support when available to the chosen QWeather plan.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/features/air-quality/**/*.spec.ts` exits 0.
  - [ ] `npx playwright test tests/e2e/city-air-quality.spec.ts` exits 0.
  - [ ] Missing AQI variables show an explicit unavailable state instead of breaking the layout.

  **QA Scenarios**:
  ```
  Scenario: AQI panel renders normalized metrics
    Tool: Playwright
    Steps: Mock AQI response; open city route; wait for `[data-testid="aqi-panel"]`; inspect `[data-testid="aqi-index"]` and `[data-testid="comfort-metrics"]`.
    Expected: AQI index, pollutant breakdown, and comfort metrics render with monochrome styling and readable labels.
    Evidence: .sisyphus/evidence/task-8-air-quality.png

  Scenario: Secondary provider variables unavailable
    Tool: Playwright
    Steps: Mock AQI response with missing pollutant fields; open city route.
    Expected: `[data-testid="aqi-unavailable"]` appears while the rest of the page remains fully usable.
    Evidence: .sisyphus/evidence/task-8-air-quality-fallback.png
  ```

  **Commit**: YES | Message: `feat(city): add air quality and comfort intelligence` | Files: [`src/features/air-quality/**`, `src/components/AsyncCityView.vue`, `tests/e2e/city-air-quality.spec.ts`]

- [ ] 9. Add historical trend visualization and reusable chart primitives

  **What to do**: Introduce a monochrome chart system with `Chart.js` + `vue-chartjs`, then expose historical temperature/precipitation/wind trends on the city page using QWeather-supported trend/history data where available. Standardize chart wrappers so future workspace charts reuse the same panel, axis, tooltip, and reduced-motion behavior. If the chosen QWeather-accessible API surface does not expose a required historical variable, render a typed unavailable state instead of adding another provider.
  **Must NOT do**: Must not add multiple chart libraries, and must not use colorful stock chart defaults.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: chart implementation is both UI-heavy and architecture-sensitive.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — chart primitives and feature reuse need both design discipline and test coverage.
  - Omitted: [`ui-ux-pro-max`] — no fresh design system invention needed.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [10, 12] | Blocked By: [1, 2, 3, 5, 7]

  **References**:
  - Pattern: `src/components/AsyncCityView.vue:47-91` — existing forecast list semantics that trend charts should complement rather than duplicate.
  - Pattern: `src/style.css:3-18` — axis, tooltip, and card chrome must derive from existing tokens.
  - Pattern: `src/App.vue:98-108` — chart route transitions must cooperate with page enter/leave motion.
  - External: `https://dev.qweather.com/docs/` — verify historical/trend endpoint availability for the selected QWeather-accessible API surface before implementation.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/components/charts/**/*.spec.ts` exits 0.
  - [ ] `npx playwright test tests/e2e/city-trends.spec.ts` exits 0.
  - [ ] Trend charts render correctly with mocked historical data and reduced-motion mode enabled.

  **QA Scenarios**:
  ```
  Scenario: Historical trend chart renders deterministic mocked series
    Tool: Playwright
    Steps: Mock historical trend data; open city route; wait for `[data-testid="trend-chart-temperature"]`; hover the chart.
    Expected: Monochrome tooltip appears with the mocked date/value pair and no layout shift occurs.
    Evidence: .sisyphus/evidence/task-9-trend-chart.png

  Scenario: Reduced-motion mode disables animated chart reveals
    Tool: Playwright
    Steps: Set reduced-motion preference; open city route with mocked trend data.
    Expected: Chart renders without animated sweep but remains visually correct and interactive.
    Evidence: .sisyphus/evidence/task-9-trend-chart-reduced-motion.png
  ```

  **Commit**: YES | Message: `feat(weather): add historical trend charts` | Files: [`src/components/charts/**`, `src/features/trends/**`, `tests/e2e/city-trends.spec.ts`]

- [x] 10. Add the multi-city workspace dashboard route

  **What to do**: Create a new route-level workspace at `/workspace` with route name `workspace` for multi-city monitoring, grouped saved locations, quick compare modules, and route-deep-linked dashboard filters. Default groups are `all`, `favorites`, and `recent`. Reuse the chart/panel system from Tasks 8-9 and the persistence model from Task 4.
  **Must NOT do**: Must not turn the app into a dense admin dashboard, and must not duplicate city-detail widgets instead of composing reusable modules.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: new route, reusable module composition, and strong aesthetic constraints.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — route composition and UI restraint both matter.
  - Omitted: [`ui-ux-pro-max`] — the visual identity is already established.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [13] | Blocked By: [1, 2, 3, 4, 5, 6, 8, 9]

  **References**:
  - Pattern: `src/router/index.ts:3-31` — add a new lazy-loaded route while preserving route metadata/title handling.
  - Pattern: `src/views/HomeView.vue:37-50` — saved-locations section hierarchy that should influence workspace information density.
  - Pattern: `src/components/CityList.vue:1-9` — list-driven composition and click-through behavior.
  - Pattern: `src/components/CityCard.vue:2-42` — card interaction and delete affordance language to reuse in grouped workspace cards.

  **Acceptance Criteria**:
  - [ ] `npx playwright test tests/e2e/workspace.spec.ts` exits 0.
  - [ ] Workspace filters round-trip through the URL query string.
  - [ ] Grouped saved locations, quick compare metrics, and trend mini-panels render from mocked data.

  **QA Scenarios**:
  ```
  Scenario: Workspace dashboard renders grouped multi-city monitoring
    Tool: Playwright
    Steps: Mock saved locations and summary weather payloads; open `/workspace`; wait for `[data-testid="workspace-groups"]` and `[data-testid="compare-panel"]`.
    Expected: Grouped saved locations render with compare summaries and route links for each city.
    Evidence: .sisyphus/evidence/task-10-workspace.png

  Scenario: URL-backed filters survive reload
    Tool: Playwright
    Steps: Open `/workspace`; select `[data-testid="workspace-filter-group"]` = `favorites`; reload page.
    Expected: The query string preserves the filter and the same filtered cards remain visible after reload.
    Evidence: .sisyphus/evidence/task-10-workspace-filter.png
  ```

  **Commit**: YES | Message: `feat(workspace): add multi-city monitoring route` | Files: [`src/router/index.ts`, `src/views/WorkspaceView.vue`, `src/features/workspace/**`, `tests/e2e/workspace.spec.ts`]

- [x] 11. Add settings and personalization controls

  **What to do**: Create a settings route at `/settings` with route name `settings` and a settings store for temperature units, wind units, timezone display policy (`location` vs `device`), reduced motion preference, dashboard defaults, and provider-safe personalization toggles; persist only durable preferences.
  **Must NOT do**: Must not persist temporary panel-open state, and must not bypass the browser’s reduced-motion preference.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: new route with UI controls, persistence, and accessibility concerns.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`, `superpowers/test-driven-development`] — settings UX must be explicit, typed, and accessible.
  - Omitted: [`ui-ux-pro-max`] — avoid needless stylistic drift.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [13] | Blocked By: [1, 2, 3, 4, 5]

  **References**:
  - Pattern: `src/components/BaseModal.vue:2-31` — modal/transition language that can inform settings sub-panels.
  - Pattern: `src/components/SiteNavigation.vue:2-31` — current top-level utility entry behavior and icon affordances.
  - Pattern: `src/style.css:27-45` — current Lenis hooks that reduced-motion toggles may need to influence.
  - External: `https://router.vuejs.org/guide/advanced/navigation-guards.html` — route meta and navigation behavior for a dedicated settings route.

  **Acceptance Criteria**:
  - [ ] `npx playwright test tests/e2e/settings.spec.ts` exits 0.
  - [ ] Settings changes persist across reload through the new settings store.
  - [ ] Reduced-motion preference measurably disables optional chart/page embellishment while leaving layout intact.

  **QA Scenarios**:
  ```
  Scenario: Unit and motion preferences persist
    Tool: Playwright
    Steps: Open `/settings`; change `[data-testid="temperature-unit-toggle"]` to `fahrenheit` and `[data-testid="reduced-motion-toggle"]` to `on`; reload.
    Expected: Both toggles retain their values after reload and affected weather labels update to the selected unit format.
    Evidence: .sisyphus/evidence/task-11-settings.png

  Scenario: Invalid persisted settings fall back safely
    Tool: Playwright
    Steps: Seed localStorage with malformed settings payload; open `/settings`.
    Expected: The page loads with default-safe values and surfaces no runtime crash.
    Evidence: .sisyphus/evidence/task-11-settings-fallback.png
  ```

  **Commit**: YES | Message: `feat(settings): add platform personalization controls` | Files: [`src/views/SettingsView.vue`, `src/features/settings/**`, `tests/e2e/settings.spec.ts`]

- [x] 12. Expand the reusable monochrome UI system and navigation shell

  **What to do**: Add reusable panel, stat row, chart frame, empty-state, skeleton, and error-state components so all new routes share one visual grammar; extend navigation to surface the workspace and settings routes while preserving the existing restrained brand behavior.
  **Must NOT do**: Must not redesign the shell into a generic sidebar app, and must not break the existing `SiteNavigation` modal/about behavior.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: reusable component craft and motion/detail consistency are the center of gravity.
  - Skills: [`vue-best-practices`, `frontend-ui-ux`] — this is primarily component decomposition and visual consistency work.
  - Omitted: [`superpowers/test-driven-development`] — still test it, but visual component design is the main driver.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [13] | Blocked By: [1, 3, 5, 9]

  **References**:
  - Pattern: `src/components/SiteNavigation.vue:2-31` — top navigation structure and icon/button rhythm.
  - Pattern: `src/components/BaseModal.vue:2-31` — reusable transition and panel framing language.
  - Pattern: `src/components/CityCard.vue:2-42` — border-led, hover-reveal card language.
  - Pattern: `src/components/CityCardSkeleton.vue` and `src/components/CityViewSkeleton.vue` — loading-state conventions to extend.
  - Pattern: `src/style.css:3-18,64-72` — token and wave-line styling baseline.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- src/components/platform/**/*.spec.ts` exits 0.
  - [ ] Navigation exposes workspace and settings entries without visual clutter.
  - [ ] New shared panels/charts/skeletons visibly match the existing monochrome language.

  **QA Scenarios**:
  ```
  Scenario: Navigation exposes new routes while preserving brand shell
    Tool: Playwright
    Steps: Open `/`; inspect `[data-testid="site-navigation"]`; click `[data-testid="nav-workspace-link"]` and `[data-testid="nav-settings-link"]`.
    Expected: Both routes are reachable, the about modal still opens from `[data-testid="nav-about-button"]`, and global shell motion remains intact.
    Evidence: .sisyphus/evidence/task-12-navigation.png

  Scenario: Shared empty and error states render consistently
    Tool: Playwright
    Steps: Mock empty workspace data and failed trend response; open affected routes.
    Expected: `[data-testid="empty-state"]` and `[data-testid="error-state"]` render with shared component styling and readable copy.
    Evidence: .sisyphus/evidence/task-12-ui-states.png
  ```

  **Commit**: YES | Message: `feat(ui): add reusable platform panels and navigation updates` | Files: [`src/components/platform/**`, `src/components/SiteNavigation.vue`, `tests/e2e/navigation.spec.ts`]

- [x] 13. Perform caching, resilience, and performance hardening

  **What to do**: Add cache TTL policy by dataset (`current`: 10 min, `hourly`: 30 min, `daily`: 60 min, `air quality`: 60 min, `historical trends`: 24 h, `search suggestions`: no cache), request deduplication, home-search cancellation, saved-location hydration batching, reduced-motion-safe animation guards, and route-level loading/error recovery so the platform behaves credibly under real usage.
  **Must NOT do**: Must not reintroduce direct component fetches, and must not leave N+1 saved-city hydration unresolved.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: this is cross-cutting correctness/performance work touching many modules.
  - Skills: [`vue-best-practices`, `superpowers/systematic-debugging`, `superpowers/test-driven-development`] — resilience and performance bugs require systematic verification.
  - Omitted: [`frontend-ui-ux`] — polish is already handled; this task is about behavior under stress.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [] | Blocked By: [1, 2, 3, 4, 5, 7, 8, 10, 11, 12]

  **References**:
  - Pattern: `src/components/CityList.vue:31-42` — current N+1 hydration path that must be eliminated or bounded.
  - Pattern: `src/views/HomeView.vue:152-164` — current debounce-without-cancel implementation to harden.
  - Pattern: `src/App.vue:38-89` — global motion setup that reduced-motion handling must respect.
  - Pattern: `src/services/savedCities.ts:143-171` — current local/cloud error fallback behavior to preserve.

  **Acceptance Criteria**:
  - [ ] `npm run test:unit` exits 0 after resilience refactors.
  - [ ] `npx playwright test` exits 0 with network-failure and degraded-data mocks enabled.
  - [ ] Saved-location hydration no longer performs one uncached weather request per card render cycle.

  **QA Scenarios**:
  ```
  Scenario: Network degradation preserves critical route usability
    Tool: Playwright
    Steps: Mock slow weather responses and partial failures; open `/workspace` and a city detail route.
    Expected: Loading skeletons appear, recoverable panels show retry/error states, and unaffected modules remain interactive.
    Evidence: .sisyphus/evidence/task-13-resilience.png

  Scenario: Saved-location hydration uses bounded request strategy
    Tool: Playwright
    Steps: Seed 10 saved locations; open `/`; capture network requests while `[data-testid="saved-locations-section"]` loads.
    Expected: Request count matches the designed batching/caching policy instead of naive N+1-per-render behavior.
    Evidence: .sisyphus/evidence/task-13-hydration-network.txt
  ```

  **Commit**: YES | Message: `refactor(platform): harden caching and resilience` | Files: [`src/features/**`, `src/views/**`, `tests/e2e/**`, `src/components/**`]

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Create small feature-aligned commits after each completed task or tightly coupled task pair.
- Prefer `feat:` for new modules/routes, `refactor:` for architecture migrations, `test:` for tooling-only additions, and `chore:` for config/env hardening.
- Keep Wave 1 commits especially isolated so later feature regressions can be bisected cleanly.

## Success Criteria
- The repo gains a maintainable feature architecture that matches Vue 3 + Pinia best practices.
- The product surface expands materially without abandoning the current design language.
- QWeather-specific complexity is hidden behind typed adapters and config boundaries.
- Weather icon rendering uses QWeather-supported icon assets/package instead of ad hoc icon mapping.
- Automated tests cover normalization logic, persistence flows, and key end-to-end experiences.
- Execution can proceed from this document without additional product or architecture decisions.
