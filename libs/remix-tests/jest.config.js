module.exports = {
    name: 'remix-tests',
    preset: '../../jest.config.js',
    verbose: true,
    transform: {
      '^.+\\.[tj]sx?$': 'ts-jest',
    },
    testTimeout: 30000,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json', 'sol'],
    coverageDirectory: '../../coverage/libs/remix-tests'
  };
  