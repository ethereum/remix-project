module.exports = {
  "extends": "../../babel.config.js",
  "plugins": [
    [
    "module:fast-async",
    {
        "runtimePattern": null,
        "compiler": {
        "es7": true,
        "noRuntime": true,
        "promises": true,
        "wrapAwait": true
        }
    }
    ],
    ["module:babel-plugin-yo-yoify"],
    ["@babel/plugin-transform-object-assign"],
    ["@babel/plugin-transform-modules-amd"]
  ],
  "presets": [
      "@babel/preset-env"
  ]
}
