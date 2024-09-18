#!/bin/bash

# Read the version from package.json
version=$(awk -F'"' '/"version":/ {print $4}' package.json)

# Determine the command to run based on the version
if [[ $version == *"beta"* ]]; then
  command="yarn dist -c beta.json"
elif [[ $version == *"alpha"* ]]; then
  command="yarn dist -c alpha.json"
elif [[ $version == *"insiders"* ]]; then
  command="yarn dist -c insiders.json"
else
  command="yarn dist -c latest.json"
fi

# Append any arguments passed in CLI
for arg in "$@"; do
  command+=" $arg"
done

# Print and run the command
echo "Running command: $command"
$command
