#!/usr/bin/env bash

# set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

# install foundry
curl -L https://foundry.paradigm.xyz | bash
# export /home/circleci/.foundry/bin to PATH
export PATH=$PATH:/home/circleci/.foundry/bin
foundryup
forge init foundry
ls -la foundry

# install truffle with yarn
yarn global add truffle
# install truffle metacoin box
mkdir MetaCoin
cd MetaCoin
truffle unbox metacoin
cd ..

# install hardhat
yarn global add hardhat


sleep 5

yarn run build:e2e

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
