import { remixPluginPluginWebworker } from "./remix-plugin-plugin-webworker";

describe("remixPluginPluginWebworker", () => {
  it("should work", () => {
    expect(remixPluginPluginWebworker()).toEqual(
      "remix-plugin-plugin-webworker"
    );
  });
});
