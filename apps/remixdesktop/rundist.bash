#!/bin/bash

# Read the version from package.json
version=$(awk -F'"' '/"version":/ {print $4}' package.json)

# Default to false for test_only
test_only=false

# Check for test_only argument
for arg in "$@"; do
  if [[ $arg == "test_only" ]]; then
    test_only=true
    break
  fi
done

# Determine the command to run based on the version and test_only flag
if [ "$test_only" = true ]; then
  command="yarn dist -c test_only.json"
else
  if [[ $version == *"beta"* ]]; then
    command="yarn dist -c beta.json"
  elif [[ $version == *"alpha"* ]]; then
    command="yarn dist -c alpha.json"
  elif [[ $version == *"insiders"* ]]; then
    command="yarn dist -c insiders.json"
  else
    command="yarn dist -c latest.json"
  fi
fi

# Append any remaining arguments passed in CLI (except test_only)
for arg in "$@"; do
  if [[ $arg != "test_only" ]]; then
    command+=" $arg"
  fi
done

# Print and run the command
echo "Running command: $command"
$command
