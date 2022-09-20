#!/usr/bin/env bash

set -e

wget --no-check-certificate https://binaries.soliditylang.org/wasm/soljson-v0.8.7+commit.e28d00a7.js -O ./apps/remix-ide/src/assets/js/soljson-v0.8.7+commit.e28d00a7.js
wget --no-check-certificate https://binaries.soliditylang.org/wasm/soljson-v0.8.16+commit.07a7930e.js -O ./apps/remix-ide/src/assets/js/soljson-v0.8.16+commit.07a7930e.js
wget --no-check-certificate https://binaries.soliditylang.org/wasm/soljson-v0.8.15+commit.e14f2714.js -O ./apps/remix-ide/src/assets/js/soljson-v0.8.15+commit.e14f2714.js
wget --no-check-certificate https://binaries.soliditylang.org/wasm/soljson-v0.7.4+commit.3f05b770.js -O ./apps/remix-ide/src/assets/js/soljson-v0.7.4+commit.3f05b770.js
