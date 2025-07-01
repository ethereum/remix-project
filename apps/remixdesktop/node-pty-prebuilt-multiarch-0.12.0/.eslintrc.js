module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "src/tsconfig.json",
    "sourceType": "module"
  },
  "ignorePatterns": [
    "**/typings/*.d.ts",
    "scripts/**/*"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/array-type": [
      "error",
      {
        "default": "array-simple",
        "readonly": "generic"
      }
    ],
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        "allowExpressions": true
      }
    ],
    "@typescript-eslint/indent": [
      "error",
      2
    ],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      { "selector": "default", "format": ["camelCase"] },
      // variableLike
      { "selector": "variable", "format": ["camelCase", "UPPER_CASE"] },
      { "selector": "variable", "filter": "^I.+Service$", "format": ["PascalCase"], "prefix": ["I"] },
      // memberLike
      { "selector": "memberLike", "modifiers": ["private"], "format": ["camelCase"], "leadingUnderscore": "require" },
      { "selector": "memberLike", "modifiers": ["protected"], "format": ["camelCase"], "leadingUnderscore": "require" },
      { "selector": "enumMember", "format": ["UPPER_CASE"] },
      // memberLike - Allow enum-like objects to use UPPER_CASE
      { "selector": "property", "modifiers": ["public"], "format": ["camelCase", "UPPER_CASE"] },
      { "selector": "method", "modifiers": ["public"], "format": ["camelCase", "UPPER_CASE"] },
      // typeLike
      { "selector": "typeLike", "format": ["PascalCase"] },
      { "selector": "interface", "format": ["PascalCase"], "prefix": ["I"] },
      // class
      { "selector": "class", "format": ["PascalCase"] },
    ],
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/quotes": [
      "error",
      "single",
      { "allowTemplateLiterals": true }
    ],
    "@typescript-eslint/semi": [
      "error",
      "always"
    ],
    "@typescript-eslint/type-annotation-spacing": "error",
    "comma-dangle": [
      "error",
      {
        "objects": "never",
        "arrays": "never",
        "functions": "never"
      }
    ],
    "curly": [
      "error",
      "multi-line"
    ],
    "eol-last": "error",
    "eqeqeq": [
      "error",
      "always"
    ],
    "keyword-spacing": "error",
    "new-parens": "error",
    "no-duplicate-imports": "error",
    "no-else-return": [
      "error",
      {
        allowElseIf: false
      }
    ],
    "no-eval": "error",
    "no-irregular-whitespace": "error",
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          ".*\\/out\\/.*"
        ]
      }
    ],
    "no-trailing-spaces": "error",
    "no-unsafe-finally": "error",
    "no-var": "error",
    "one-var": [
      "error",
      "never"
    ],
    "prefer-const": "error",
    "spaced-comment": [
      "error",
      "always",
      {
        "markers": ["/"],
        "exceptions": ["-"]
      }
    ]
  }
};
