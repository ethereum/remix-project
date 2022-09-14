#!/usr/bin/env bash

set -e

setupRemixd () {
  mkdir remixdSharedfolder
  cd apps/remix-ide/contracts
  echo 'sharing folder: '
  echo $PWD
  ../../../node_modules/.bin/remixd -s $PWD --remix-ide http://127.0.0.1:8080 &
  cd ../../..
}

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

yarn run ganache-cli &
yarn run serve &
setupRemixd

sleep 5

yarn run nightwatch_parallel || TEST_EXITCODE=1
TESTFILES=$(circleci tests glob "./apps/remix-ide/test-browser/tests/**/*.test.js" | circleci tests split )
for TESTFILE in $TESTFILES; do
    ./node_modules/.bin/nightwatch --config ./apps/remix-ide/nightwatch.js --env chrome $TESTFILE || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
