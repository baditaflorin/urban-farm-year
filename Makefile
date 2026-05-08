SHELL := /bin/sh

VERSION ?= $(shell node -p "require('./package.json').version")
SOURCE_COMMIT ?= $(shell git log -1 --format=%h -- src package.json package-lock.json data cmd internal index.html vite.config.ts 2>/dev/null || echo local)
GOPKGS ?= $(shell go list ./... | grep -v '/node_modules/')

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push docs-export

help:
	@printf "%s\n" "Targets:"
	@printf "%s\n" "  make install-hooks     Wire local git hooks"
	@printf "%s\n" "  make dev               Run the Vite dev server"
	@printf "%s\n" "  make build             Build Pages-ready frontend into docs/"
	@printf "%s\n" "  make data              Regenerate static data artifacts"
	@printf "%s\n" "  make test              Run unit tests"
	@printf "%s\n" "  make test-integration  Run integration tests"
	@printf "%s\n" "  make smoke             Build and run Playwright smoke tests"
	@printf "%s\n" "  make lint              Run linters and typecheck"
	@printf "%s\n" "  make fmt               Format code"
	@printf "%s\n" "  make pages-preview     Serve docs/ like GitHub Pages"
	@printf "%s\n" "  make release           Tag a semver release"
	@printf "%s\n" "  make clean             Remove generated transient output"

install-hooks:
	git config core.hooksPath .githooks

dev:
	npm run dev

build:
	rm -rf docs/assets docs/models docs/data docs/manifest.webmanifest docs/sw.js docs/404.html
	VITE_APP_VERSION=$(VERSION) VITE_GIT_COMMIT=$(SOURCE_COMMIT) npm run build
	cp docs/index.html docs/404.html
	npx prettier --write docs/index.html docs/404.html >/dev/null
	test -s docs/index.html

data:
	go run ./cmd/build-data --start 0 --end 0 --concurrency 1 --saveEvery 100
	npx prettier --write public/data/v1/*.json >/dev/null

test:
	npm run test
	go test $(GOPKGS)

test-integration:
	@printf "%s\n" "No integration tests are required for v1 Mode B."

smoke: build
	npm run test:e2e

lint:
	npm run lint
	npm run fmt:check
	npm run typecheck
	go vet $(GOPKGS)

fmt:
	npm run fmt
	gofmt -w cmd internal

pages-preview: build
	npm run preview -- --host 127.0.0.1 --port 4174

release: build
	git diff --quiet
	git tag v$(VERSION)
	git push origin main v$(VERSION)

clean:
	rm -rf coverage playwright-report test-results dist dist-data tmp

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

docs-export:
	pandoc docs/data.md -o docs/data.html
