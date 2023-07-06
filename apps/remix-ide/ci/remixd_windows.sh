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

# kill process on port 9090 on windows
npx -y kill-port 8080
npx -y kill-port 8545
npx -y kill-port 9090

if [ "$TEST_EXITCODE" -eq 1 ]
then
  echo "Tests failed"
  exit 1
else
  echo "Tests passed"
  exit 0
fi