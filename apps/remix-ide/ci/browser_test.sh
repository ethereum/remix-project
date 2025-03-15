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
# Get initial test files (without 'metamask' tests)
TESTFILES=$(node apps/remix-ide/ci/splice_tests.js $2 $3 | grep -v 'metamask')

# If $4 is provided, filter by it

if [ -n "$4" ]; then
  # log the filter
  echo "Filtering by $4"
  TESTFILES=$(echo "$TESTFILES" | grep "$4")
fi

# Check if TESTFILES has content
if [ -z "$TESTFILES" ]; then
  echo "No test files found after filtering. Exiting."
  exit 0  # ✅ Exit gracefully (change to exit 1 if failure is preferred)
fi

#log the files
echo "Running the following test files:"
echo "$TESTFILES"

# Split tests only if there are valid test files
TESTFILES=$(echo "$TESTFILES" | circleci tests split --split-by=timings)

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
