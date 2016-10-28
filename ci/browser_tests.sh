#!/usr/bin/env bash

set -e

SC_VERSION="4.4.0"
SAUCECONNECT_URL="https://saucelabs.com/downloads/sc-$SC_VERSION-linux.tar.gz"
SAUCECONNECT_USERNAME="yanneth"
SAUCECONNECT_ACCESSKEY="1f5a4560-b02b-41aa-b52b-f033aad30870"
SAUCECONNECT_JOBIDENTIFIER="remix_tests_${TRAVIS_JOB_NUMBER}"
SAUCECONNECT_READYFILE="sc.ready"
TEST_EXITCODE=0

npm run build
npm run serve &

wget $SAUCECONNECT_URL
tar -zxvf sc-"$SC_VERSION"-linux.tar.gz
./sc-"$SC_VERSION"-linux/bin/sc -u $SAUCECONNECT_USERNAME -k $SAUCECONNECT_ACCESSKEY -i $SAUCECONNECT_JOBIDENTIFIER --readyfile $SAUCECONNECT_READYFILE &
while [ ! -f $SAUCECONNECT_READYFILE ]; do
  sleep .5
done

npm run nightwatch_remote_parallel || TEST_EXITCODE=1

node ci/sauceDisconnect.js $SAUCECONNECT_USERNAME $SAUCECONNECT_ACCESSKEY $SAUCECONNECT_JOBIDENTIFIER

echo $TEST_EXITCODE
if [ $TEST_EXITCODE -eq 1 ]
then
  exit 1
fi
