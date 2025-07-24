#!/usr/bin/env bash
set -e
TEST_EXITCODE=0

# Setup virtual display for CI environments
if [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
    echo "Setting up CI environment for Electron tests..."
    ./setup-ci-display.sh
fi

yarn run build:e2e && node ./splice_tests.js

# Get test files (splice_tests.js handles sharding via SHARD/TOTAL_SHARDS env vars)
TESTFILES=$(node ./splice_tests.js)

for TESTFILE in $TESTFILES; do
    yarn run test --test ./build-e2e/remixdesktop/test/tests/app/${TESTFILE} || yarn run test --test ./build-e2e/remixdesktop/test/tests/app/${TESTFILE} || TEST_EXITCODE=1
done

# Run offline tests only on the first shard (equivalent to CIRCLE_NODE_INDEX=1)
if [ "${SHARD:-1}" -eq 1 ]; then
  yarn test:offline || TEST_EXITCODE=1
fi

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
