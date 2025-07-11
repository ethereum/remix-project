#!/usr/bin/env bash
set -euo pipefail

# Helper
log() {
  echo -e "[$(date +'%H:%M:%S')] $*"
}

# Input: semicolon-separated paths
FILES_TO_SIGN="${1:-}"

if [[ -z "$FILES_TO_SIGN" ]]; then
  echo "❌ No files to sign passed as argument."
  exit 1
fi

IFS=';' read -r -a FILE_ARRAY <<< "$FILES_TO_SIGN"

log "Signing the following files:"
for f in "${FILE_ARRAY[@]}"; do
  echo "  - $f"
done

# Validate env vars
for var in SM_API_KEY SM_CLIENT_CERT_FILE_B64 SM_CLIENT_CERT_PASSWORD SSM; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌ Environment variable $var not set."
    exit 1
  fi
done

# Decode cert
CERT_PATH="C:\\Certificate_pkcs12.p12"
log "Decoding client certificate to $CERT_PATH"
echo "$SM_CLIENT_CERT_FILE_B64" | base64 -d > /c/Certificate_pkcs12.p12
export SM_CLIENT_CERT_FILE="$CERT_PATH"

# Ensure smtools installed
SMCTL_EXE="$SSM\\smctl.exe"

if [ ! -f "$SMCTL_EXE" ]; then
  INSTALLER_PATH="$TEMP\\smtools-windows-x64.msi"
  log "Downloading smtools..."
  curl -fSL \
    -H "x-api-key:$SM_API_KEY" \
    "https://one.digicert.com/signingmanager/api-ui/v1/releases/smtools-windows-x64.msi/download" \
    -o "$INSTALLER_PATH"

  log "Installing smtools..."
  msiexec.exe /i "$INSTALLER_PATH" /quiet /qn /l*v C:\\smtools-install.log
else
  log "smtools already installed, skipping download."
fi

# Sync cert
log "Syncing certificate..."
"$SMCTL_EXE" windows certsync

# Select cert
log "Selecting certificate..."
CERT_OUTPUT=$("$SMCTL_EXE" cert ls)
CERT_ID=$(echo "$CERT_OUTPUT" | grep ACTIVE | awk '{print $1}')
CERT_ALIAS=$(echo "$CERT_OUTPUT" | grep ACTIVE | awk '{print $2}')

if [[ -z "$CERT_ID" || -z "$CERT_ALIAS" ]]; then
  echo "❌ No ACTIVE certificates found."
  exit 1
fi

log "Using certificate ID $CERT_ID alias $CERT_ALIAS"

# Find keypair alias
log "Finding keypair..."
KEYPAIR_OUTPUT=$("$SMCTL_EXE" keypair ls)
KEY_ALIAS=$(echo "$KEYPAIR_OUTPUT" | grep "$CERT_ID" | awk '{print $3}')

if [[ -z "$KEY_ALIAS" ]]; then
  echo "❌ No keypair found for certificate $CERT_ID."
  exit 1
fi

log "Using keypair alias $KEY_ALIAS"

# Check signtool
if ! command -v signtool.exe >/dev/null 2>&1; then
  echo "❌ signtool.exe not found in PATH."
  exit 1
fi

# Sign all files
for file in "${FILE_ARRAY[@]}"; do
  log "Signing $file..."
  "$SMCTL_EXE" sign --keypair-alias "$KEY_ALIAS" --input "$file" --verbose

  log "Verifying $file..."
  signtool.exe verify /pa /v "$file"
done

log "✅ All files signed successfully."