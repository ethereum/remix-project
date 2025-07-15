#!/usr/bin/env bash

set -e



BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0
npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &
sleep 5

# grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | xargs -I {} basename {} .test.js | grep -E "\b[${2}]"
# TESTFILES=$(grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | xargs -I {} basename {} .test.js | grep -E "\b[$2]" | circleci tests split --split-by=timings )
node apps/remix-ide/ci/splice_tests.js $2 $3
TESTFILES=$(node apps/remix-ide/ci/splice_tests.js $2 $3 | grep -v 'metamask' | circleci tests split --split-by=timings)
for TESTFILE in $TESTFILES; do
    if ! npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1; then
      if ! npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1; then
        TEST_EXITCODE=1
        break
      fi
    fi
done

echo "$TEST_EXITCODE"
# Fail the test early and cancel the workflow
if [ "$TEST_EXITCODE" -eq 1 ]; then
  echo "❌ Test failed. Attempting to cancel the workflow..."
  curl -s -X POST \
    -H "Authorization: Basic $FAIL_FAST_TOKEN" \
    -H "Content-Type: application/json" \
    "https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}/cancel"
  exit 1
fi
