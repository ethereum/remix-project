module.exports = {
    "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    "plugins": ["@babel/plugin-transform-modules-commonjs", "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-proposal-private-property-in-object", { "loose": false }],
    ["@babel/plugin-proposal-private-methods", { "loose": false }]]
}