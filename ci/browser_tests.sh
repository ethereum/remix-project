#!/bin/bash


SAUCECONNECT_URL="http://saucelabs.com/downloads/sc-4.3.16-linux.tar.gz"
SAUCECONNECT_USERNAME="chriseth"
SAUCECONNECT_ACCESSKEY="b781828a-9e9c-43d8-89d4-2fbb879595ca"
SAUCECONNECT_JOBIDENTIFIER="browsersolidity_tests_${TRAVIS_JOB_NUMBER}"
SAUCECONNECT_READYFILE="sc.ready"
TEST_EXITCODE=0

npm run build
npm run serve &

wget $SAUCECONNECT_URL
tar -zxvf sc-4.3.16-linux.tar.gz
./sc-4.3.16-linux/bin/sc -u $SAUCECONNECT_USERNAME -k $SAUCECONNECT_ACCESSKEY -i $SAUCECONNECT_JOBIDENTIFIER --readyfile $SAUCECONNECT_READYFILE &
while [ ! -f $SAUCECONNECT_READYFILE ]; do
  sleep .5
done

function updateTestExitCode() {
  if [ $? -eq 1 ]
  then
    TEST_EXITCODE=1
  fi
}

npm run browser-test-remote-firefox
updateTestExitCode
npm run browser-test-remote-chrome
updateTestExitCode
npm run browser-test-remote-safari
updateTestExitCode
npm run browser-test-remote-ie
updateTestExitCode

node ci/sauceDisconnect.js $SAUCECONNECT_USERNAME $SAUCECONNECT_ACCESSKEY $SAUCECONNECT_JOBIDENTIFIER

echo $TEST_EXITCODE
if [ $TEST_EXITCODE -eq 1 ]
then
  exit 1
fi
