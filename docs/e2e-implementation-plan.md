# E2E Implementation Plan

## Goal
Implement Playwright-based end-to-end testing for local and Docker environments, with configurable real or mocked API mode, and coverage for critical routes.

## PR Breakdown

- [x] PR 1: E2E foundation
  - [x] Add Playwright configuration and runtime env loading
  - [x] Add local and Docker execution scripts
  - [x] Add Docker test compose + lifecycle shell scripts
  - [x] Add test helpers, fixtures, and base POMs
  - [x] Add tests README and initial auth/critical-route specs
- [x] PR 2: Desktop critical flows expansion
  - [x] Budget periods flow coverage
  - [x] Accounts flow coverage
  - [x] Categories flow coverage
  - [x] Transactions flow coverage
  - [x] Dashboard assertions with realistic data checks
- [x] PR 3: Mobile critical flows expansion
  - [x] Mobile auth checks
  - [x] Mobile navigation checks
  - [x] Mobile dashboard/transactions checks

## Constraints
- Use isolated fixture users (unique test emails).
- Support both API modes (`mock` and `real`) via configuration.
- Support both execution targets with separate scripts:
  - local app/backend
  - Docker stack
- CI integration intentionally deferred.

## Execution Notes
- Network access is restricted in this environment, so dependency additions are avoided unless already present.
- Playwright test runner imports use `playwright/test` (available via current dependencies).

## Progress Log
- 2026-02-09: Created plan and started PR 1 foundation work.
- 2026-02-09: Completed PR 1 foundation implementation (config, fixtures, mock/real modes, scripts, baseline desktop/mobile critical route specs).
- 2026-02-09: Completed PR 2 desktop flow expansion with stateful mock API and desktop route flow specs for periods, accounts, categories, transactions, and dashboard.
- 2026-02-09: Completed PR 3 mobile flow expansion with dedicated mobile transactions and dashboard specs.
