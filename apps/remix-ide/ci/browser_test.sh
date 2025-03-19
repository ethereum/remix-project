#!/usr/bin/env bash

set -e



BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0
npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &
sleep 5

set -x  # Enable debug mode

echo "Raw test files before filtering:"
node apps/remix-ide/ci/splice_tests.js $2 $3

# Get initial test files
TESTFILES=$(node apps/remix-ide/ci/splice_tests.js $2 $3 | grep -v 'metamask' || true)

echo "Filtered test files (without metamask):"
echo "$TESTFILES"

# If $4 is provided, filter by it
if [ -n "$4" ]; then
  FILTER_PATTERN=$(echo "$4" | sed -E 's/[,[:space:]]+/|/g')
  echo "Filtering by pattern: $FILTER_PATTERN"

  if [ -n "$TESTFILES" ]; then
    TESTFILES=$(echo "$TESTFILES" | grep -E "$FILTER_PATTERN" || true)
  fi
fi

# Log final test files
echo "Running the following test files:"
echo "$TESTFILES"

set +x  # Disable debug mode

# Check if TESTFILES has content
if [ -z "$TESTFILES" ]; then
  echo "No test files found after filtering. Exiting."
  exit 0  # ✅ Exit gracefully (change to exit 1 if failure is preferred)
fi

# Split tests only if there are valid test files
TESTFILES=$(echo "$TESTFILES" | circleci tests split --split-by=timings)

if [ -z "$TESTFILES" ]; then
  echo "No test files found after splitting. Exiting."
  exit 0  # ✅ Exit gracefully (change to exit 1 if failure is preferred)
fi

for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1 || npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1 || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
