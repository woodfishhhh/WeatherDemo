# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + Vue 3 weather app written in TypeScript-flavored Vue files. Application code lives in `src/`: `views/` holds route-level pages, `components/` contains reusable UI, `router/` defines navigation, and `services/` stores browser-side data helpers such as saved cities. Global bootstrapping starts in `src/main.ts`, shared styling lives in `src/style.css`, and static assets belong in `public/`. Build output is generated in `dist/` and should not be edited manually.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server on port `4173`.
- `npm run build`: run `vue-tsc --build` and then create the production bundle.
- `npm run preview`: serve the built app locally for a production-like check.
- `npm run type-check`: run Vue/TypeScript type checking without bundling.

Run `npm run build` before opening a PR so both type checks and production bundling are exercised.

## Coding Style & Naming Conventions
Follow the existing Vue 3 structure: prefer single-file components, keep reusable UI in `src/components`, and reserve `src/views` for route pages. Use PascalCase for component filenames (`CityCard.vue`), camelCase for utilities (`savedCities.ts`), and keep route names and URL segments consistent with existing patterns. Match the surrounding file style when editing; this codebase currently mixes quote styles and spacing, so consistency within a file matters more than reformatting unrelated code. No ESLint or Prettier config is committed yet, so keep diffs focused and readable.

## Testing Guidelines
There is no dedicated unit-test suite yet. Until one is added, treat `npm run type-check`, `npm run build`, and a quick manual browser pass through the home and city detail views as the minimum verification set. If you add tests later, place them next to the feature or under a `tests/` folder and use `*.spec.ts` naming.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commits such as `chore: remove hardcoded api keys to .env`; follow that pattern and prefer prefixes like `feat:`, `fix:`, and `chore:`. Keep each commit scoped to one change. PRs should include a brief summary, note any environment or Firebase changes, link related issues, and attach screenshots or short recordings for UI updates.

## Security & Configuration Tips
Secrets currently load from `.env`. Never commit real API keys or Firebase credentials, and document any new environment variables in the PR description until a checked-in `.env.example` is added.
