/* eslint-disable */
export default {
  displayName: "remix-plugin-plugin-child-process",
  preset: "../../../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory:
    "../../../../coverage/libs/remix-plugin/plugin/child-process",
};
