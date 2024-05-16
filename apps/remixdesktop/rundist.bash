#!/bin/bash

# Read the version from package.json
version=$(grep -oP '"version":\s*"\K[0-9a-zA-Z.-]+' package.json)

# Determine the command to run based on the version
if [[ $version == *"beta"* ]]; then
  command="yarn dist -c beta.json"
elif [[ $version == *"alpha"* ]]; then
  command="yarn dist -c alpha.json"
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
