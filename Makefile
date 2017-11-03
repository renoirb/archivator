
.PHONY: lint

lint:
	npm run-script lint

.PHONY: test
test:
	npm test

.PHONY: archive
archive:
	yarn archive

.PHONY: analyze
analyze:
	yarn analyze

dist:
	babel src/ --minified -d dist/ -s



