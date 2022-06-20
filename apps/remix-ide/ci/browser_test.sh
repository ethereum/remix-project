#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

yarn run ganache-cli &
yarn run serve:production &
echo 'sharing folder: ' $PWD '/apps/remix-ide/contracts' &
yarn run remixd &

sleep 5

yarn run build:e2e

TESTFILES=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | sort | circleci tests split )
for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js $TESTFILE --env=$1  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
