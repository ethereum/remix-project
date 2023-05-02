#!/usr/bin/env bash

echo "Downloading latest soljson.js from https://binaries.soliditylang.org/wasm/list.json"
set -e
# check if curl is installed
if ! command -v curl &> /dev/null
then
    echo "curl could not be found"
    exit
fi


# download https://binaries.soliditylang.org/wasm/list.json as json
curl -s https://binaries.soliditylang.org/wasm/list.json > list.json
# get the latest version without jq
latest=$(grep 'latestRelease' list.json | cut -d '"' -f 4)
echo "latest version: $latest"
# get url 
url=$(grep "\"$latest\":" list.json | cut -d '"' -f 4)
echo "url: $url"
path="https://binaries.soliditylang.org/bin/$url"
echo "path: $path"
# download the file to ./apps/remix-ide/src/assets/js/soljson.js
curl -s $path > ./apps/remix-ide/src/assets/js/soljson.js
# if directory ./apps/remix-ide/src/assets/js/soljson does not exist, create it
if [ ! -d "./apps/remix-ide/src/assets/js/soljson" ]; then
    mkdir ./apps/remix-ide/src/assets/js/soljson
fi
cp ./apps/remix-ide/src/assets/js/soljson.js ./apps/remix-ide/src/assets/js/soljson/$url

# remove list.json
rm list.json

