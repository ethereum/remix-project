#!/bin/bash

set -euo pipefail

# Set paths
REPO_URL="https://github.com/remix-project-org/metamask-dist.git"
TMP_DIR="tmp-metamask-dist"
TARGET_DIR="apps/remix-ide-e2e/src/extensions/chrome/metamask"

# Clone the repo shallowly
git clone --depth=1 "$REPO_URL" "$TMP_DIR"

# Ensure target dir exists
mkdir -p "$TARGET_DIR"

# Copy the contents of dist/ into the target directory
cp -r "$TMP_DIR/dist/." "$TARGET_DIR/"

# Clean up
rm -rf "$TMP_DIR"

echo "✅ MetaMask dist files copied to $TARGET_DIR"