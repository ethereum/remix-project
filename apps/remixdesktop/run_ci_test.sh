#!/usr/bin/env bash
set -e

yarn run build:e2e && node ./splice_tests.js
TESTFILES=$(./splice_tests.js | circleci tests split --split-by=timings)
for TESTFILE in $TESTFILES; do
    yarn run test --test ${TESTFILE} || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
