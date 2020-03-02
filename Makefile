# TODO: Setup BROWSERSLIST before building all.
# nvm use 12
# set -gx BROWSERSLIST "node 12"

common/temp/package.json:
	-node common/scripts/install-run-rush.js update

.PHONY: sort-package-json
sort-package-json:
	-npx sort-package-json '{libraries,packages}/**/package.json'
