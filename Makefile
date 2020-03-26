
.PHONY: lint

lint:
	npm run-script lint

.PHONY: test
test:
	npm test

##
## For build target below,
## refer to dist/README.md
##
.PHONY: archive
archive:
	yarn archive

.PHONY: analyze
analyze:
	yarn analyze

dist:
	babel src/ --minified -d dist/ -s



