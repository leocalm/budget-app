# Development Guide

This document describes how to run, test, and develop the piggy-pulse-app frontend locally.

## Requirements

- Node.js (via nvm/asdf/etc)
- Yarn (required)

## Common Commands

Dev server:

```bash
yarn dev
```

Full test suite (matches `npm run test`):

```bash
yarn test
```

## Conventional Commits (Required)

CI enforces **Conventional Commits** for both:

- PR titles
- Commit subjects in the PR (merge commits are ignored)

Required format:

- `type(scope)!: description`
- `type: description`

Allowed `type` values:

- `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

Examples:

- `feat(transactions): add cursor pagination`
- `fix(auth)!: redirect on invalid session cookie`
- `docs: document local dev setup`

Fixing failures:

- Reword commits: `git rebase -i origin/main` then change `pick` to `reword`
- Squash commits: interactive rebase and squash into a single Conventional Commit
