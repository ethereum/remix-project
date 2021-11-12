#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run build:e2e
KEYS=$(jq -r '.projects | keys' workspace.json  | tr -d '[],"')
TESTFILES=$(circleci tests glob "dist/apps/remix-ide-e2e/src/tests/**/*.test.js") 
echo $TESTFILES
TESTFILES=$(circleci tests glob "dist/apps/remix-ide-e2e/src/tests/**/*.test.js" | circleci tests split --split-by=timings)
echo $TESTFILES
TESTFILES=$(echo $KEYS | circleci tests split --split-by=timings)
echo $TESTFILES

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
