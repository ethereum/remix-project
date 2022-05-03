#!/usr/bin/env bash

set -e

npm run build:e2e
TESTFILES=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "\.flaky" | sort )

# count test files
fileCount=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "\.flaky" | wc -l )
# if fileCount is 0
if [ $fileCount -eq 0 ]
then
  echo "No flaky tests found"
  exit 0
fi

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run ganache-cli &
npm run serve:production &
echo 'sharing folder: ' $PWD '/apps/remix-ide/contracts' &
npm run remixd &

sleep 5

for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js $TESTFILE --env=$1  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
