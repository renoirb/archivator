
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
	bin/archivator archive

.PHONY: analyze
analyze:
	bin/archivator analyze

markdownify:
	yarn markdownify

dist:
	yarn dist



