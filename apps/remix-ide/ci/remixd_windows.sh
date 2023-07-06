#!/usr/bin/env bash

set -e
TEST_EXITCODE=0
yarn run ganache-cli &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &
sleep 5

TESTFILES=$(grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests" | grep remixd | circleci tests split)
for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js ${TESTFILE} --env=edge || npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js ${TESTFILE} --env=edge || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi