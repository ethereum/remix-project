#!/usr/bin/env bash

set -e

cleanup() {
    echo "Cleaning up processes..."
    pkill -f ganache || true
    pkill -f remixd || true
    pkill -f "http-server" || true
}

trap cleanup EXIT

wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local timeout=30

    echo "Waiting for $service to be ready..."
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            echo "$service is ready!"
            return 0
        fi
        echo "Waiting for $service... ($i/$timeout)"
        sleep 1
    done
    echo "$service failed to start within $timeout seconds"
    return 1
}

setupRemixd() {
    mkdir -p remixdSharedfolder
    cd apps/remix-ide/contracts
    echo 'Sharing folder: '
    echo $PWD
    ../../../node_modules/.bin/remixd -s $PWD --remix-ide http://127.0.0.1:8080 &
    cd ../../..
}

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "Build ID: $BUILD_ID"
TEST_EXITCODE=0

npx ganache --chain.hardfork shanghai --chain.allowUnlimitedContractSize --chain.vmErrorsOnRPCResponse true &

wait_for_service "127.0.0.1" "8545" "Ganache"

yarn run serve &

wait_for_service "127.0.0.1" "8080" "Development server"

setupRemixd

sleep 5

export NIGHTWATCH_TIMEOUT=120000
export NIGHTWATCH_PAGE_TIMEOUT=60000

yarn run nightwatch_parallel || TEST_EXITCODE=1

TESTFILES=$(circleci tests glob "./apps/remix-ide/test-browser/tests/**/*.test.js" | circleci tests split)
for TESTFILE in $TESTFILES; do
    echo "Running test: $TESTFILE"
    for i in {1..3}; do
        if ./node_modules/.bin/nightwatch --config ./apps/remix-ide/nightwatch.js --env chrome "$TESTFILE"; then
            break
        else
            if [ $i -eq 3 ]; then
                TEST_EXITCODE=1
                echo "Test failed after 3 attempts: $TESTFILE"
            else
                echo "Retrying test ($i/3): $TESTFILE"
                sleep 2
            fi
        fi
    done
done

echo "Test exit code: $TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]; then
    echo "Some tests failed!"
    exit 1
else
    echo "All tests passed successfully!"
    exit 0
fi