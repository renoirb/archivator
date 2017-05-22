
.PHONY: lint
lint:
	npm run-script lint

.PHONY: test
test:
	npm test

.PHONY: run
run:
	babel-node src/cli.js

dist:
	babel src/ --minified -d dist/ -s

.PHONY: watch
watch:
	babel src/ -d dist/ -w -s


