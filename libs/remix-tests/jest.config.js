module.exports = {
    name: 'remix-tests',
    preset: '../../jest.config.js',
    transform: {
      '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json', 'sol'],
    coverageDirectory: '../../coverage/libs/remix-tests',
  };
  