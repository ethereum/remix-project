module.exports = {
    "presets": ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"],
    "plugins": [
        "babel-plugin-replace-ts-export-assignment", 
        "@babel/plugin-transform-modules-commonjs", 
        "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-proposal-private-property-in-object", { "loose": false }],
    ["@babel/plugin-proposal-private-methods", { "loose": false }]]
}