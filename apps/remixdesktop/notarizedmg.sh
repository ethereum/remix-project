#!/bin/bash

# Path to the JSON file containing the DMG paths
JSON_FILE="dmgs.json"

# Read the DMGs array from the JSON file
DMG_PATHS=$(jq -r '.dmgs[]' "$JSON_FILE")

xcrun notarytool store-credentials "notarytool-password" \
               --apple-id ${APPLE_ID} \
               --team-id ${APPLE_TEAM_ID} \
               --password ${APPLE_ID_PASSWORD}

# Loop over the DMG paths
for DMG_PATH in $DMG_PATHS; do
    # Remove single quotes from the path if present
    DMG_PATH_CLEANED=$(echo $DMG_PATH | tr -d "'")

    echo "Submitting $DMG_PATH_CLEANED for notarization..."

    # Run your notarytool submit command here
    # Ensure you replace `your-app-specific-args` with actual arguments for your app
    notarytool submit "$DMG_PATH_CLEANED" --keychain-profile "notarytool-password" --wait

    # Check for success/failure if necessary
    if [ $? -eq 0 ]; then
        echo "Successfully submitted $DMG_PATH_CLEANED for notarization."
    else
        echo "Failed to submit $DMG_PATH_CLEANED for notarization."
    fi
done

echo "All DMG submissions completed."
