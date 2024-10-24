#!/usr/bin/env bash

echo "Downloading specified soljson.js version based on defaultVersion in package.json"

set -e

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "curl could not be found"
    exit 1
fi

# Read the defaultVersion from package.json
defaultVersion=$(grep '"defaultVersion"' package.json | awk -F '"' '{print $4}')
echo "Specified version from package.json: $defaultVersion"

# Fetch the list.json from the Solidity binaries
listJson=$(curl -s --connect-timeout 5 --max-time 5 https://binaries.soliditylang.org/wasm/list.json)

# Check if the download was successful
if [ -z "$listJson" ]; then
    echo "Failed to fetch version list. No internet connection or the connection is too slow."
    exit 0  # Silently exit
fi

# Overwrite the local list.json with the fetched content
echo "$listJson" > ./apps/remix-ide/src/assets/list.json

# Check if the specified version exists in the list
check=$(echo "$listJson" | grep "\"$defaultVersion\"")

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

# Download the soljson.js file to ./apps/remix-ide/src/assets/js/soljson.js
echo "Downloading soljson.js from $fullPath to ./apps/remix-ide/src/assets/js/soljson.js"
curl -s "$fullPath" > ./apps/remix-ide/src/assets/js/soljson.js

# Copy the downloaded soljson.js to the specific version directory
cp ./apps/remix-ide/src/assets/js/soljson.js "./apps/remix-ide/src/assets/js/soljson/$defaultVersion.js"

echo "Download and setup of soljson.js complete"
