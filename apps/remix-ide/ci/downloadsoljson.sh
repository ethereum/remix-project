#!/usr/bin/env bash

set -e

# download https://binaries.soliditylang.org/wasm/list.json as json
curl https://binaries.soliditylang.org/wasm/list.json > list.json
# get the latest version
version=$(cat list.json | jq -r '.latestRelease')
echo $version
# the value of releases with key $version
url=$(cat list.json | npx jq -r '.releases[]' | grep $version)
echo $url
# set path to the url
path="https://binaries.soliditylang.org/bin/$url"
echo $path
# download the file to ./apps/remix-ide/src/assets/js/soljson.js
curl $path > ./apps/remix-ide/src/assets/js/soljson.js
# remove list.json
rm list.json
