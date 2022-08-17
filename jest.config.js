module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  moduleNameMapper:{
    "@remix-project/remix-analyzer": "<rootDir>/../../dist/libs/remix-analyzer/src/index.js",
    "@remix-project/remix-astwalker": "<rootDir>/../../dist/libs/remix-astwalker/src/index.js",
    "@remix-project/remix-debug": "<rootDir>/../../dist/libs/remix-debug/src/index.js",
    "@remix-project/remix-lib": "<rootDir>/../../dist/libs/remix-lib/src/index.js",
    "@remix-project/remix-simulator": "<rootDir>/../../dist/libs/remix-simulator/src/index.js",
    "@remix-project/remix-solidity": "<rootDir>/../../dist/libs/remix-solidity/src/index.js",
    "@remix-project/remix-tests": "<rootDir>/../../dist/libs/remix-tests/src/index.js",
    "@remix-project/remix-url-resolver": 
      "<rootDir>/../../dist/libs/remix-url-resolver/src/index.js"
    ,
    "@remix-project/remix-ws-templates": 
      "<rootDir>/../../dist/libs/remix-ws-templates/src/index.js"
    ,
    "@remix-project/remixd": "<rootDir>/../../dist/libs/remixd/index.js"
  }
};
