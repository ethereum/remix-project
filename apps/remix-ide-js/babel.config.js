module.exports = { 
    extends: '../../babel.config.js',
    plugins: [
        [
            "fast-async",
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
        [
            "babel-plugin-yo-yoify"
        ],
        [
            "@babel/plugin-transform-object-assign"
        ]
    ],
    presets: [
        "@babel/preset-env"
    ]
}