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
    # exit without error
    exit 0
  fi
else
  echo "Unsupported OS."
  exit 0
fi

MAJORVERSION=$(echo "$version" | grep -Eo '[0-9]+' | head -1)
echo "CHROME DRIVER INSTALL $MAJORVERSION"

# Determine target platform for ChromeDriver download
case "$OS" in
  Darwin)
    if [[ "$(uname -m)" == "arm64" ]]; then
      PLATFORM="mac-arm64"
    else
      PLATFORM="mac-x64"
    fi
    ;;
  Linux)
    PLATFORM="linux64"
    ;;
  *)
    echo "Unsupported OS: $OS"; exit 1
    ;;
esac
echo "Detected platform for download: $PLATFORM"

# Determine ChromeDriver version and download URL
if [ "$MAJORVERSION" -lt 115 ]; then
  # Chrome <115: use storage.googleapis.com
  CHROMEDRIVER_VERSION=$(curl -sS "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${MAJORVERSION}" | tr -d '\r')
  CHROMEDRIVER_DOWNLOAD_URL="https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_${PLATFORM}.zip"
else
  # Chrome >=115: use Chrome for Testing JSON feed
  FEED_URL="https://googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone-with-downloads.json"
  CHROMEDRIVER_VERSION=$(curl -sS "$FEED_URL" | jq -r ".milestones.\"$MAJORVERSION\".version")
  CHROMEDRIVER_DOWNLOAD_URL=$(curl -sS "$FEED_URL" \
    | jq -r ".milestones.\"$MAJORVERSION\".downloads.chromedriver[] \
      | select(.platform==\"$PLATFORM\").url")
fi

echo "Matching ChromeDriver version: $CHROMEDRIVER_VERSION"
echo "Downloading ChromeDriver from $CHROMEDRIVER_DOWNLOAD_URL"
 
# Prepare install directory
mkdir -p "$INSTALL_DIR"

# Download and install ChromeDriver
ZIP_PATH="${INSTALL_DIR}/chromedriver_${PLATFORM}.zip"
curl -sS -o "$ZIP_PATH" "$CHROMEDRIVER_DOWNLOAD_URL"
unzip -o "$ZIP_PATH" -d "$INSTALL_DIR"

# Move the extracted chromedriver binary to the root of INSTALL_DIR
EXTRACTED_DIR="${INSTALL_DIR}/chromedriver-${PLATFORM}"
ALT_DIR="${INSTALL_DIR}/chromedriver_${PLATFORM}"

if [ -f "${EXTRACTED_DIR}/chromedriver" ]; then
  mv "${EXTRACTED_DIR}/chromedriver" "$INSTALL_DIR/chromedriver"
elif [ -f "${ALT_DIR}/chromedriver" ]; then
  mv "${ALT_DIR}/chromedriver" "$INSTALL_DIR/chromedriver"
else
  # Fallback: try to find chromedriver file inside any subdir
  FOUND=$(find "$INSTALL_DIR" -type f -name chromedriver | head -n1)
  if [ -n "$FOUND" ]; then
    mv "$FOUND" "$INSTALL_DIR/chromedriver"
  else
    echo "Error: chromedriver binary not found"
    exit 1
  fi
fi

chmod +x "$INSTALL_DIR/chromedriver"
# Cleanup extracted directory and zip
rm -rf "$EXTRACTED_DIR"
rm -f "$ZIP_PATH"

echo "ChromeDriver installed at $INSTALL_DIR/chromedriver"