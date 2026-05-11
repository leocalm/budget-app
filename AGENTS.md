# AGENTS.md

## Purpose

This repo is the PiggyPulse web frontend. Agents should keep it a thin, secure React client over the PiggyPulse API, aligned with AgentBrain, current source, and the product's calm finance UI principles.

## Memory-first workflow

AgentBrain is the durable project memory source. Before meaningful work:

1. Read the memory manifest.
2. Read PiggyPulse project context.
3. Read relevant project memory files.
4. Search decisions.
5. Check open questions.
6. Inspect this repo.

If AgentBrain and code disagree, stop and report the mismatch. Pay attention to API path/version differences: some older README text says `/api/v1`, while current generated types and backend memory emphasize v2.

## Required memory reads

- Always: `Context.md`, `ArchitectureOverview.md`, `ProductPrinciples.md`, `KnownIssues.md`.
- Frontend/UI work: `Frontend.md`, `DesignSystem.md`, `Testing.md`.
- Feature work: relevant `Features/*`, especially `Auth.md`, `Dashboard.md`, `BudgetPeriods.md`, `Transactions.md`, `Accounts.md`, `Categories.md`, `Projections.md`.
- API integration: `APIConventions.md`, `SecurityModel.md`.
- App Store/mobile assets: `Integrations/AppStore.md`.

## Memory write-back rules

After meaningful work, record durable decisions, open questions, interaction/session summaries, and requested daily/global summaries.

Use MCP tools if available: `record_decision`, `upsert_open_question`, `record_interaction`, `append_daily_log`, `append_global_daily_summary`.

If MCP is unavailable, write to `AgentBrain/10_Projects/PiggyPulse/`. Do not store secrets, `.env` contents, credentials, private keys, tokens, or raw chain-of-thought.

## Repo overview

React 19 + TypeScript web app built with Vite 8, Mantine 9, TanStack React Query, React Router v7, Storybook 10, Vitest, Playwright, and MSW. Package manager is Yarn 4 with `nodeLinker: node-modules`.

## Important directories

- `src/api/` - API client and generated OpenAPI types (`v2.d.ts`).
- `src/components/` - reusable UI components.
- `src/pages/` - route-level pages.
- `src/hooks/`, `src/context/`, `src/lib/`, `src/utils/` - app logic and utilities.
- `src/theme/`, `src/theme.ts`, `src/global.css` - Mantine theme and global styling.
- `src/locales/` - i18n translations.
- `src/mocks/` - MSW handlers.
- `src/stories/` and `.storybook/` - Storybook.
- `tests/` - Playwright E2E and screenshot tests.
- `redesign/` and `public/logo/` - design previews and assets.

## Commands

Verified from `package.json`, `tests/README.md`, and config files.

### Install

- `yarn install`

### Development

- `yarn dev`
- `yarn dev:https`
- `yarn preview`
- `yarn storybook`

### Build

- `yarn build`
- `yarn storybook:build`
- `yarn api:generate`

### Test

- `yarn test`
- `yarn vitest`
- `yarn vitest:watch`
- `yarn vitest:storybook`
- `yarn test-storybook`
- `yarn e2e`
- `yarn e2e:local:mock`
- `yarn e2e:local:real`
- `yarn e2e:docker:mock`
- `yarn e2e:docker:real`
- `yarn e2e:screenshots`

### Lint / format

- `yarn typecheck`
- `yarn lint`
- `yarn eslint`
- `yarn stylelint`
- `yarn prettier`
- `yarn prettier:write`

### Database / migrations

Not applicable in this repo. Use backend repo for migrations.

### Mobile platform commands

Not applicable.

## Conventions

- Use Mantine 9 and existing theme tokens; keep the Nebula dark theme and calm finance tone.
- Use Tabler icons where an icon is needed.
- Keep the frontend thin. Domain invariants belong on the backend.
- Use TanStack React Query for server state and React Router for routing.
- Use generated API types and existing API client patterns; do not introduce ad hoc fetch calls.
- Keep auth cookie-based for web. Do not store JWTs or tokens in `localStorage` or `sessionStorage`.
- Always use `src/components/Utils/CurrencyValue.tsx` for displayed monetary values. Do not hand-format currency with hardcoded symbols or `toFixed`.
- Keep i18n strings in locale files when touching user-facing copy.
- Tests should prefer semantic selectors; use `data-testid` only when needed.

## Testing expectations

- Small component/utility changes: run `yarn vitest` or the relevant focused test, plus `yarn typecheck`.
- UI/theme/story changes: run `yarn storybook` or `yarn test-storybook` where practical.
- Routing/API/auth changes: run `yarn test` and relevant Playwright mode.
- E2E mock changes: run `yarn e2e:local:mock`.
- Real backend E2E changes: run `yarn e2e:local:real` only with a safe local API.

## Security / privacy rules

- Never commit secrets or `.env` values.
- Never store API tokens, credentials, private keys, service-account files, or raw user financial data in docs or memory.
- Follow `SecurityModel.md` for auth/API changes.
- Keep API base URLs, cookies, CSRF assumptions, and secure contexts aligned with backend security.
- Do not expose production-only config in client code.
- Follow `PrivacyRules.md` only if the task touches personal/career/user memory; otherwise project security rules apply.

## Environment variables

Document names only, never values. Verified names include:

- `VITE_API_BASE_URL`
- `VITE_API_PROXY_TARGET`
- `VITE_DEV_HTTPS`
- `E2E_TARGET`
- `E2E_API_MODE`
- `E2E_BASE_URL`
- `E2E_API_URL`
- `E2E_API_HEALTH_PATH`
- `E2E_REGISTER_ENDPOINTS`

## When to stop and ask/report

Stop and report if memory contradicts source code, required commands are missing, tests fail for unrelated reasons, a task requires secrets, generated OpenAPI types conflict with backend behavior, public API/security behavior would change, or the requested change conflicts with recorded decisions.

## Completion checklist

Before final response, verify:

- [ ] Relevant AgentBrain memory was read.
- [ ] Relevant source files were inspected.
- [ ] Existing decisions and open questions were checked.
- [ ] Commands run are listed.
- [ ] Tests/lint/build were run where appropriate, or skipped with reason.
- [ ] Durable decisions were recorded or proposed.
- [ ] Open questions were recorded or proposed.
- [ ] No secrets or `.env` values were exposed.
- [ ] Any memory/code contradictions were reported.
