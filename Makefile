# TODO: Setup BROWSERSLIST before building all.
# nvm use 12
# set -gx BROWSERSLIST "node 12"

.DEFAULT: all
.PHONY: all
all: .envrc sort-package-json common/temp/package.json

.PHONY: update
update:
	-node common/scripts/install-run-rush.js update --recheck

.envrc:
	cp .envrc.dev .envrc

.PHONY: sort-package-json
sort-package-json:
	-npx sort-package-json '{libraries,packages,apps}/*/package.json'

common/temp/package.json:
	-node common/scripts/install-run-rush.js update

