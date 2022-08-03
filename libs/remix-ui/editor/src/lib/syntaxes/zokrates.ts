/* eslint-disable */
export const zokratesLanguageConfig = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>']
  ],
  autoClosingPairs: [
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '<', close: '>', notIn: ['string', 'comment'] }
  ]
}

export const zokratesTokensProvider = {
  defaultToken: "",
  tokenPostfix: ".zok",

  keywords: [
    "log",
    "assert",
    "as",
    "bool",
    "const",
    "def",
    "else",
    "false",
    "field",
    "for",
    "if",
    "import",
    "from",
    "in",
    "mut",
    "private",
    "public",
    "return",
    "struct",
    "true",
    "type",
    "u8",
    "u16",
    "u32",
    "u64",
  ],

  typeKeywords: ["bool", "field", "u8", "u16", "u32", "u64"],

  operators: [
    "=",
    ">",
    "<",
    "!",
    "?",
    ":",
    "==",
    "<=",
    ">=",
    "!=",
    "&&",
    "||",
    "+",
    "-",
    "*",
    "**",
    "/",
    "&",
    "|",
    "^",
    "%",
    "<<",
    ">>",
  ],

  decimalSuffix: /(u16|u32|u64|u8|f)?/,

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-zA-Z]\w*/,
        {
          cases: {
            "@typeKeywords": "type.identifier",
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // numbers
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/\d+(@decimalSuffix)/, "number"],

      // delimiter
      [/[;,.]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
    ],

    comment: [
      [/[^\/*]+/, "comment"],
      [/\/\*/, "comment", "@push"], // nested comment
      ["\\*/", "comment", "@pop"],
      [/[\/*]/, "comment"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"],
    ],
  },
}
