# Contributing

Thanks for improving Urban Farm Year.

## Local Workflow

1. Install Node.js, Go, Make, and optional security tools listed in the README.
2. Run `make install-hooks`.
3. Make focused commits with Conventional Commits messages.
4. Run `make test`, `make build`, and `make smoke` before pushing.

## Commit Style

Use Conventional Commits:

- `feat: add planner crop search`
- `fix: preserve harvest totals offline`
- `docs: document data artifact schema`
- `data: regenerate crop calendar artifact`

Do not commit secrets, API keys, private certificates, or real `.env` files.
