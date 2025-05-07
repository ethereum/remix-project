#!/usr/bin/env bash

set -e

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

npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &

# Wait for Ganache (default port 8545) via JSON-RPC
echo "Waiting for Ganache on port 8545 (eth_blockNumber)..."
until curl --silent --fail \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' \
  http://127.0.0.1:8545 > /dev/null; do
  sleep 1
done

# Wait for http-server on port 9090
echo "Waiting for http-server on port 9090..."
until curl --silent --fail http://127.0.0.1:9090 > /dev/null; do
  sleep 1
done

# Wait for Remix serve:production on port 8080
echo "Waiting for Remix server on port 8080..."
until curl --silent --fail http://127.0.0.1:8080 > /dev/null; do
  sleep 1
done

for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js $TESTFILE --env=$1  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
