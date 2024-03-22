#!/usr/bin/env bash

echo "Downloading specified soljson.js version based on defaultVersion in package.json"

set -e

# Check if curl and jq are installed
if ! command -v curl &> /dev/null; then
    echo "curl could not be found"
    exit 1
fi

# Read the defaultVersion from package.json
defaultVersion=$(grep '"defaultVersion"' package.json | awk -F '"' '{print $4}')
echo "Specified version from package.json: $defaultVersion"

# Download the list.json file containing available versions
curl -s https://binaries.soliditylang.org/wasm/list.json > list.json

# Use jq to extract the path for the specified version from the builds array
check=$(grep "\"$defaultVersion\"" list.json)
if [ -z "$check" ]; then
    echo "The specified version $defaultVersion could not be found in the list"
    exit 1
fi

echo "Path for the specified version: $defaultVersion"
fullPath="https://binaries.soliditylang.org/bin/$defaultVersion"
echo "Download fullPath: $fullPath"

# Ensure the target directory exists
if [ ! -d "./apps/remix-ide/src/assets/js/soljson" ]; then
    mkdir -p ./apps/remix-ide/src/assets/js/soljson
fi

# Download the file to ./apps/remix-ide/src/assets/js/soljson.js
echo "Downloading soljson.js from "$fullPath" to ./apps/remix-ide/src/assets/js/soljson.js"
curl -s "$fullPath" > ./apps/remix-ide/src/assets/js/soljson.js

# Copy the downloaded soljson.js to the specific version directory
cp ./apps/remix-ide/src/assets/js/soljson.js "./apps/remix-ide/src/assets/js/soljson/$path"
cp list.json ./apps/remix-ide/src/assets/list.json

# Clean up by removing the list.json
rm list.json
