#!/bin/bash

# Determine the OS platform
OS="$(uname)"

if [ "$OS" == "Darwin" ]; then
  # macOS systems
  if [ -e "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    version=$("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version)
    echo "Google Chrome version on macOS: $version"
  else
    echo "Google Chrome is not installed on your macOS."
  fi
elif [ "$OS" == "Linux" ]; then
  # Linux systems
  if command -v google-chrome >/dev/null; then
    version=$(google-chrome --version)
    echo "Google Chrome version on Linux: $version"
  else
    echo "Google Chrome is not installed on your Linux."
  fi
else
  echo "Unsupported OS."
fi

MAJORVERSION=$(echo "$version" | grep -Eo '[0-9]+\.' | head -1 | cut -d'.' -f1)
echo "CHROME DRIVER INSTALL $MAJORVERSION"

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
yarn add -D chromedriver@$MAJORVERSION geckodriver --cwd  "$directory" ||  yarn add -D chromedriver@$MAJORVERSION geckodriver --cwd  "$directory" || yarn add -D chromedriver geckodriver --cwd  "$directory" || exit 1
