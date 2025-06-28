#!/bin/bash

# Path to the JSON file containing the DMG paths
JSON_FILE="dmgs.json"

# Read the DMGs array from the JSON file
MG_PATHS=$(grep -o '"[^"]*.dmg"' "$JSON_FILE" | sed 's/"//g')

echo $DMG_PATHS

xcrun notarytool store-credentials "notarytool-password" \
    --apple-id ${APPLE_ID} \
    --team-id ${APPLE_TEAM_ID} \
    --password ${APPLE_ID_PASSWORD} \
    --keychain /Users/distiller/Library/Keychains/build.keychain-db || exit 1

xcrun notarytool list-keychain-credentials --keychain /Users/distiller/Library/Keychains/build.keychain-db

# Use jq to parse the DMGs array and read each line
while IFS= read -r DMG_PATH; do
    # Remove single quotes from the path if present
    DMG_PATH_CLEANED=$(echo $DMG_PATH | tr -d "'")

    echo "Submitting $DMG_PATH_CLEANED for notarization..."

    # Replace `your-app-specific-args` with the actual arguments for your app
    # Ensure your notarytool command and arguments are correct for your application
xcrun notarytool submit "$DMG_PATH_CLEANED" \
    --keychain /Users/distiller/Library/Keychains/build.keychain-db \
    --keychain-profile "notarytool-password" \
    --wait

    # Check the command's success
    if [ $? -eq 0 ]; then
        echo "Successfully submitted $DMG_PATH_CLEANED for notarization."
        xcrun stapler staple "$DMG_PATH_CLEANED"
        echo "Successfully stapled $DMG_PATH_CLEANED."
        spctl -a -t open -vvv --context context:primary-signature "$DMG_PATH_CLEANED"
        echo "Successfully checked $DMG_PATH_CLEANED."
    else
        echo "Failed to submit $DMG_PATH_CLEANED for notarization."
    fi
done < <(jq -r '.dmgs[]' "$JSON_FILE")

echo "All DMG submissions completed."
