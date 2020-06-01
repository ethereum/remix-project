#!/usr/bin/env bash

set -e

if test $(uname -s) = "Darwin"
then
  OS="osx"
  FILEFORMAT="zip"
else
  OS="linux"
  FILEFORMAT="tar.gz"
fi
SC_VERSION="4.4.11"
SAUCECONNECT_URL="https://saucelabs.com/downloads/sc-$SC_VERSION-$OS.$FILEFORMAT"
SAUCECONNECT_USERNAME="yanneth"
SAUCECONNECT_ACCESSKEY="1f5a4560-b02b-41aa-b52b-f033aad30870"
BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
SAUCECONNECT_JOBIDENTIFIER="remix_tests_${BUILD_ID}"
SAUCECONNECT_READYFILE="sc.ready"
TEST_EXITCODE=0

npm run build
npm run serve &

wget $SAUCECONNECT_URL
tar -zxvf sc-"$SC_VERSION"-"$OS"."$FILEFORMAT"
./sc-"$SC_VERSION"-$OS/bin/sc -u $SAUCECONNECT_USERNAME -k $SAUCECONNECT_ACCESSKEY -i $SAUCECONNECT_JOBIDENTIFIER --readyfile $SAUCECONNECT_READYFILE &
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
