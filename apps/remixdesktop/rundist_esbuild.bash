#!/bin/bash

# Read the version from package.json
version=$(awk -F'"' '/"version":/ {print $4}' package.json)

# Determine the command to run based on the version
if [[ $version == *"beta"* ]]; then
  command="yarn esbuild -c beta.json"
elif [[ $version == *"alpha"* ]]; then
  command="yarn esbuild -c alpha.json"
elif [[ $version == *"insiders"* ]]; then
  command="yarn esbuild -c insiders.json"
else
  command="yarn esbuild -c latest.json"
fi

# Append any arguments passed in CLI
for arg in "$@"; do
  command+=" $arg"
done

# Print and run the command
echo "Running command: $command"
$command
