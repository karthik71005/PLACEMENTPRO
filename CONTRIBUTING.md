# Contributing to PlacementPro

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-description>` | `feature/resume-wizard` |
| Bug fix | `fix/<short-description>` | `fix/login-token-refresh` |
| Chore | `chore/<short-description>` | `chore/update-deps` |
| Docs | `docs/<short-description>` | `docs/api-readme` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <short description>

[optional body]
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `refactor` | Code restructure (no behavior change) |

**Examples:**
```
feat(backend): add criteria engine filter endpoint
fix(frontend): correct token refresh on 401 response
chore(infra): add nginx gzip compression config
```

## Pull Request Process

1. Branch off `develop` — never directly off `main`
2. Keep PRs focused: one feature / one fix per PR
3. All CI checks must pass (lint + tests) before merge
4. At least one peer review required

## Secrets Policy

- **Never commit `.env` files or `serviceAccountKey.json`**
- Use `.env.example` with placeholder values for reference
- All secrets go into GitHub Secrets for CI, and environment variables for Docker

## Code Style

| Layer | Linter / Formatter |
|-------|--------------------|
| Python | `ruff` (lint) + `black` (format) |
| JavaScript/JSX | ESLint + Prettier |

Run before committing:
```bash
# Python
ruff check backend/ && black backend/

# Frontend
cd frontend && npm run lint
```
