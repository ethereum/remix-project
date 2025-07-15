#!/usr/bin/env bash
set -e
TEST_EXITCODE=0

# Setup virtual display for CI environments
if [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
    echo "Setting up CI environment for Electron tests..."
    ./setup-ci-display.sh
fi

yarn run build:e2e && node ./splice_tests.js

# Get git-related test files (with sharding support from splice_tests.js)
TESTFILES=$(node ./splice_tests.js git)

for TESTFILE in $TESTFILES; do
    yarn run test --use-isogit --test ./build-e2e/remixdesktop/test/tests/app/${TESTFILE} || yarn run test --use-isogit --test ./build-e2e/remixdesktop/test/tests/app/${TESTFILE} || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
