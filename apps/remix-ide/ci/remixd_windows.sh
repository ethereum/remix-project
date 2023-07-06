#!/usr/bin/env bash

set -e
BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0
yarn run ganache-cli &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &
sleep 5

npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js dist/apps/remix-ide-e2e/src/tests/remixd_group1.test.js --env=edge

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi