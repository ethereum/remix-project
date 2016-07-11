#!/usr/bin/env bash


SAUCECONNECT_URL="https://saucelabs.com/downloads/sc-4.3.16-linux.tar.gz"
SAUCECONNECT_USERNAME="yann300"
SAUCECONNECT_ACCESSKEY="e6f430f2-daa0-48bb-90fd-8bee20f429eb"
SAUCECONNECT_JOBIDENTIFIER="remix_tests_${TRAVIS_JOB_NUMBER}"
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

npm run nightwatch_remote_firefox || TEST_EXITCODE=1
npm run nightwatch_remote_chrome || TEST_EXITCODE=1
npm run nightwatch_remote_safari || TEST_EXITCODE=1
npm run nightwatch_remote_ie || TEST_EXITCODE=1

node ci/sauceDisconnect.js $SAUCECONNECT_USERNAME $SAUCECONNECT_ACCESSKEY $SAUCECONNECT_JOBIDENTIFIER

echo $TEST_EXITCODE
if [ $TEST_EXITCODE -eq 1 ]
then
  exit 1
fi
