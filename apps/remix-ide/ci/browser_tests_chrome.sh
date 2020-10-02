#!/usr/bin/env bash

set -e

setupRemixd () {
  cd apps/remix-ide/contracts
  echo 'sharing folder: '
  echo $PWD
  npx nx serve remixd --folder=./ --remixide=http://127.0.0.1:8080 &
  cd ../../..
}

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run ganache-cli &
npm run serve &
setupRemixd

sleep 5

npx nx build remix-ide-e2e

TESTFILES=$(circleci tests glob "dist/apps/remix-ide-e2e/src/tests/**/*.test.js" | circleci tests split --split-by=timings)
for TESTFILE in $TESTFILES; do
    npx nx e2e remix-ide-e2e --filePath=$TESTFILE --env=chrome  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
