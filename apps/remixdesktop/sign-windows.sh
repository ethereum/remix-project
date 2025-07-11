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

# Select cert
log "Selecting certificate..."
CERT_OUTPUT=$("$SSM/smctl.exe" cert ls)
CERT_ID=$(echo "$CERT_OUTPUT" | grep ACTIVE | awk '{print $1}')
CERT_ALIAS=$(echo "$CERT_OUTPUT" | grep ACTIVE | awk '{print $2}')

if [[ -z "$CERT_ID" || -z "$CERT_ALIAS" ]]; then
  echo "❌ No ACTIVE certificates found."
  exit 1
fi

log "Using certificate ID $CERT_ID alias $CERT_ALIAS"

# Find keypair alias
log "Finding keypair..."
KEYPAIR_OUTPUT=$("$SSM/smctl.exe" keypair ls)
KEY_ALIAS=$(echo "$KEYPAIR_OUTPUT" | grep "$CERT_ID" | awk '{print $3}')

if [[ -z "$KEY_ALIAS" ]]; then
  echo "❌ No keypair found for certificate $CERT_ID."
  exit 1
fi

log "Using keypair alias $KEY_ALIAS"
SIGTOOL_EXE="C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe"
if [[ ! -f "$SIGTOOL_EXE" ]]; then
  echo "❌ signtool.exe not found at $SIGTOOL_EXE."
  exit 1
fi

export PATH="$PATH:/c/Program Files (x86)/Windows Kits/10/App Certification Kit"
 

# Sign all files
for file in "${FILE_ARRAY[@]}"; do
  log "Signing $file..."
  "$SSM/smctl.exe" sign --keypair-alias "$KEY_ALIAS" --input "$file" --verbose

  log "Verifying $file..."
  cmd.exe /c "signtool.exe verify /pa /v \"$file\""
done

log "✅ All files signed successfully."