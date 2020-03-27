
.PHONY: lint

lint:
	npm run-script lint

.PHONY: test
test:
	npm test

NODE_VERSION := 12.13.0
PKG_VERSION := 1.0.2

.PHONY: binaries
binaries:
	## https://github.com/nexe/nexe/blob/master/test/target.spec.ts#L10
	## npx rollup -i dist/cli.js | npx nexe -o binaries/archivator_1.0.2~macos_x64 -t macos-x64-12.13.0
	-mkdir -p binaries
	npx rollup -i archivator.js | npx nexe --resource './dist/**/*' -o binaries/archivator_$(PKG_VERSION)~macos_x64 -t macos-x64-$(NODE_VERSION)
	npx rollup -i archivator.js | npx nexe --resource './dist/**/*' -o binaries/archivator_$(PKG_VERSION)~windows_x64 -t windows-x64-$(NODE_VERSION)
	npx rollup -i archivator.js | npx nexe --resource './dist/**/*' -o binaries/archivator_$(PKG_VERSION)~linux_x86 -t linux-x86-$(NODE_VERSION)

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



