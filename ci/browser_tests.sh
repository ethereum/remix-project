#!/usr/bin/env bash

SAUCECONNECT_URL="https://saucelabs.com/downloads/sc-4.3.16-linux.tar.gz"
SAUCECONNECT_USERNAME="yanneth"
SAUCECONNECT_ACCESSKEY="1f5a4560-b02b-41aa-b52b-f033aad30870"
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

npm run nightwatch_remote_firefox
if [ $? -eq 1 ]
then
  TEST_EXITCODE=1
fi

npm run nightwatch_remote_chrome
if [ $? -eq 1 ]
then
  TEST_EXITCODE=1
fi

npm run nightwatch_remote_safari
if [ $? -eq 1 ]
then
  TEST_EXITCODE=1
fi

npm run nightwatch_remote_ie
if [ $? -eq 1 ]
then
  TEST_EXITCODE=1
fi

node ci/sauceDisconnect.js $SAUCECONNECT_USERNAME $SAUCECONNECT_ACCESSKEY $SAUCECONNECT_JOBIDENTIFIER

echo $TEST_EXITCODE
if [ $TEST_EXITCODE -eq 1 ]
then
  exit 1
fi
