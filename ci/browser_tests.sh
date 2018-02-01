#!/usr/bin/env bash

set -e

setupRemixd () {
  mkdir remixdSharedfolder
  cd contracts
  echo 'sharing folder: '
  echo $PWD
  node ../node_modules/remixd/src/main.js -s $PWD &
  cd ..
}

SC_VERSION="4.4.0"
SAUCECONNECT_URL="https://saucelabs.com/downloads/sc-$SC_VERSION-linux.tar.gz"
SAUCECONNECT_USERNAME="chriseth"
SAUCECONNECT_ACCESSKEY="b781828a-9e9c-43d8-89d4-2fbb879595ca"
SAUCECONNECT_JOBIDENTIFIER="browsersolidity_tests_${TRAVIS_JOB_NUMBER}"
SAUCECONNECT_READYFILE="sc.ready"
TEST_EXITCODE=0

npm run serve &

setupRemixd

wget "$SAUCECONNECT_URL"
tar -zxvf sc-"$SC_VERSION"-linux.tar.gz
./sc-"$SC_VERSION"-linux/bin/sc -u "$SAUCECONNECT_USERNAME" -k "$SAUCECONNECT_ACCESSKEY" -i "$SAUCECONNECT_JOBIDENTIFIER" --no-ssl-bump-domains all --readyfile "$SAUCECONNECT_READYFILE" &
while [ ! -f "$SAUCECONNECT_READYFILE" ]; do
  sleep .5
done

# npm run nightwatch_remote_chrome || TEST_EXITCODE=1
# npm run nightwatch_remote_firefox || TEST_EXITCODE=1
# npm run nightwatch_remote_safari || TEST_EXITCODE=1
# npm run nightwatch_remote_ie || TEST_EXITCODE=1
npm run nightwatch_remote_parallel || TEST_EXITCODE=1

node ci/sauceDisconnect.js "$SAUCECONNECT_USERNAME" "$SAUCECONNECT_ACCESSKEY" "$SAUCECONNECT_JOBIDENTIFIER"

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
