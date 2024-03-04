#!/bin/bash

echo "Argument 1: $1"
echo "Argument 2: $2"

xcrun notarytool store-credentials "notarytool-password" \
--apple-id ${APPLE_ID} \
--team-id ${APPLE_TEAM_ID} \
--password ${APPLE_ID_PASSWORD}
# Assuming your app is packaged as a dmg or zip for notarization
xcrun notarytool submit 'release/Remix IDE 2-0.0.11-Alpha.dmg' \
--keychain-profile "notarytool-password" \
--wait

# Assuming your app is packaged as a dmg or zip for notarization
xcrun notarytool submit 'release/Remix IDE 2-0.0.11-Alpha-Arm64.dmg' \
--keychain-profile "notarytool-password" \
--wait

xcrun stapler staple 'release/Remix IDE 2-0.0.11-Alpha.dmg'
xcrun stapler staple 'release/Remix IDE 2-0.0.11-Alpha-Arm64.dmg'

spctl -a -t open -vvv --context context:primary-signature 'release/Remix IDE 2-0.0.11-Alpha.dmg'
spctl -a -t open -vvv --context context:primary-signature 'release/Remix IDE 2-0.0.11-Alpha-Arm64.dmg'