#!/usr/bin/env bash

set -e

setupRemixd () {
  mkdir remixdSharedfolder
  cd contracts
  echo 'sharing folder: '
  echo $PWD
  ./../node_modules/remixd/bin/remixd -s $PWD --remix-ide http://127.0.0.1:8080 &
  cd ..
}

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run ganache-cli &
npm run serve &
setupRemixd

sleep 5

npm run nightwatch_local_libraryDeployment || TEST_EXITCODE=1
npm run nightwatch_local_solidityImport || TEST_EXITCODE=1
npm run nightwatch_local_recorder || TEST_EXITCODE=1
npm run nightwatch_local_transactionExecution || TEST_EXITCODE=1
npm run nightwatch_local_staticAnalysis || TEST_EXITCODE=1
npm run nightwatch_local_signingMessage || TEST_EXITCODE=1
npm run nightwatch_local_specialFunctions || TEST_EXITCODE=1
npm run nightwatch_local_solidityUnitTests || TEST_EXITCODE=1
npm run nightwatch_local_remixd || TEST_EXITCODE=1
npm run nightwatch_local_terminal || TEST_EXITCODE=1

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
