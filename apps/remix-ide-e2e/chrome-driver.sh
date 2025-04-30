#!/usr/bin/env bash
# Usage: chrome-driver.sh [install_dir]
# Determine install directory from first argument or ORB_PARAM_DRIVER_INSTALL_DIR
INSTALL_DIR=${1:-${ORB_PARAM_DRIVER_INSTALL_DIR:-"./tmp/webdrivers"}}
echo "Installing ChromeDriver into $INSTALL_DIR"

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



# Determine download URL: use Chrome for Testing API for Chrome >=115
if [ "$MAJORVERSION" -ge 115 ]; then
  CHROME_FOR_TESTING_JSON="https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"
  CHROMEDRIVER_DOWNLOAD_URL=$(curl -sS "$CHROME_FOR_TESTING_JSON" \
    | jq -r ".versions[] | select(.version==\"$MAJORVERSION\") \
      | .downloads.chromedriver[] | select(.platform==\"$PLATFORM\").url")
  if [ -z "$CHROMEDRIVER_DOWNLOAD_URL" ]; then
    echo "No matching URL in Chrome for Testing JSON; falling back to storage.googleapis.com"
    CHROMEDRIVER_DOWNLOAD_URL="https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_${PLATFORM}.zip"
  fi
else
  CHROMEDRIVER_DOWNLOAD_URL="https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_${PLATFORM}.zip"
fi
echo "Downloading ChromeDriver from $CHROMEDRIVER_DOWNLOAD_URL"
 
# Prepare install directory
mkdir -p "$INSTALL_DIR"

# Select platform
PLATFORM="linux64"
if [[ "$(uname -s)" == "Darwin" ]]; then
  PLATFORM="mac64"
fi

# Download and install ChromeDriver
ZIP_PATH="${INSTALL_DIR}/chromedriver_${PLATFORM}.zip"
curl -sS -o "$ZIP_PATH" "$CHROMEDRIVER_DOWNLOAD_URL"
unzip -o "$ZIP_PATH" -d "$INSTALL_DIR"
chmod +x "${INSTALL_DIR}/chromedriver"
echo "ChromeDriver installed at ${INSTALL_DIR}/chromedriver"