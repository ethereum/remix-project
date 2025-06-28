#!/bin/bash
# Specify the directory to check
directory="./tmp/webdrivers"

# Check if the directory exists
if [ -d "$directory" ]; then
    echo "Directory exists: $directory"
else
    echo "Directory does not exist. Creating directory: $directory"
    mkdir -p "$directory"
fi


yarn init -y --cwd "$directory" || exit 1
yarn add -D geckodriver --cwd  "$directory" ||  exit 1

bash apps/remix-ide-e2e/chrome-driver.sh || exit 1
