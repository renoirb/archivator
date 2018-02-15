
.PHONY: dev
dev:
	yarn dev

.PHONY: lint
lint:
	yarn lint

.PHONY: fix
fix:
	yarn lint:fix

.PHONY: test
test:
	yarn test

.PHONY: archive
archive:
	yarn archive

.PHONY: analyze
analyze:
	yarn analyze

dist:
	yarn dist



