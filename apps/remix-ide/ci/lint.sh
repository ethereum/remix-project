#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

python3 parse_workspace.py

TESTFILES=$(circleci tests glob "dist/apps/remix-ide-e2e/src/tests/**/*.test.js")
echo "$TESTFILES"

npm run lint  || TEST_EXITCODE=1
npm run lint:libs  || TEST_EXITCODE=1
npm run lint remix-ide-e2e || TEST_EXITCODE=1

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
