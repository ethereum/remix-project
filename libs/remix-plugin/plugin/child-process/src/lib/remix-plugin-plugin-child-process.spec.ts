import { remixPluginPluginChildProcess } from "./remix-plugin-plugin-child-process";

describe("remixPluginPluginChildProcess", () => {
  it("should work", () => {
    expect(remixPluginPluginChildProcess()).toEqual(
      "remix-plugin-plugin-child-process"
    );
  });
});
