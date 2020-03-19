# TODO: Setup BROWSERSLIST before building all.
# nvm use 12
# set -gx BROWSERSLIST "node 12"

.DEFAULT: sort-package-json
.PHONY: sort-package-json
sort-package-json:
	-npx sort-package-json '{libraries,packages,apps}/*/package.json'

common/temp/package.json:
	-node common/scripts/install-run-rush.js update

