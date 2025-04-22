#!/usr/bin/env bash

set -e

./apps/remix-ide-e2e/update_metamask.sh

TESTFILES=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "metamask" | sort )

# count test files
fileCount=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "metamask" | wc -l )
# if fileCount is 0
if [ $fileCount -eq 0 ]
then
  echo "No metamask tests found"
  exit 0
fi

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &
sleep 5

for TESTFILE in $TESTFILES; do
    echo "Running metamask test: $TESTFILE"
    echo "running with env $1"
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-chrome.js $TESTFILE --env=$1  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
