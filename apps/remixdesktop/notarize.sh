#!/bin/bash

echo "Argument 1: $1"
echo "Argument 2: $2"

xcrun notarytool store-credentials "notarytool-password" \
--apple-id ${APPLE_ID} \
--team-id ${APPLE_TEAM_ID} \
--password ${APPLE_ID_PASSWORD}
# Assuming your app is packaged as a dmg or zip for notarization
xcrun notarytool submit "$1" \
--keychain-profile "notarytool-password" \
--wait

# Assuming your app is packaged as a dmg or zip for notarization
xcrun notarytool submit "$2" \
--keychain-profile "notarytool-password" \
--wait

xcrun stapler staple "$1"
xcrun stapler staple "$2"

spctl -a -t open -vvv --context context:primary-signature "$1"
spctl -a -t open -vvv --context context:primary-signature "$2"