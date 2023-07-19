/* eslint-disable */
export const circomLanguageConfig = (monaco) => ({
  wordPattern:
      /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

  comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
  },

  brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
  ],

  onEnterRules: [
    {
        // e.g. /** | */
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: {
            indentAction: monaco.languages.IndentAction.IndentOutdent,
            appendText: " * ",
        },
    },
    {
        // e.g. /** ...|
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        action: {
            indentAction: monaco.languages.IndentAction.None,
            appendText: " * ",
        },
    },
    {
        // e.g.  * ...|
        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
        action: {
            indentAction: monaco.languages.IndentAction.None,
            appendText: "* ",
        },
    },
    {
        // e.g.  */|
        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
        action: {
            indentAction: monaco.languages.IndentAction.None,
            removeText: 1,
        },
    },
],

  autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: "`", close: "`", notIn: ["string", "comment"] },
      { open: "/**", close: " */", notIn: ["string"] },
  ],

  folding: {
      markers: {
          start: new RegExp("^\\s*//\\s*#?region\\b"),
          end: new RegExp("^\\s*//\\s*#?endregion\\b"),
      },
  },
})

export const circomTokensProvider = {
  defaultToken: "",
  tokenPostfix: ".circom",

  keywords: [
      "signal",
      "input",
      "output",
      "public",
      "template",
      "component",
      "parallel",
      "custom",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "log",
      "assert",
      "include",
      "pragma",
  ],

  typeKeywords: ["input", "output", "public"],

  operators: [
      "!",
      "~",
      "-",
      "||",
      "&&",
      "==",
      "!=",
      "<",
      ">",
      "<=",
      ">=",
      "|",
      "&",
      "<<",
      ">>",
      "+",
      "-",
      "*",
      "/",
      "\\",
      "%",
      "**",
      "^",
      "=",
      "<--",
      "<==",
  ],

  // we include these common regular expressions
  // symbols:  /[=><!~?:&|+\-*\/\^%]+/,

  // C# style strings
  escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages

  tokenizer: {
      root: [
          // identifiers and keywords
          [
              /[a-z_$][\w$]*/,
              {
                  cases: {
                      "@typeKeywords": "keyword",
                      "@keywords": "keyword",
                      "@default": "identifier",
                  },
              },
          ],
          [/[A-Z][\w\$]*/, "type.identifier"], // to show class names nicely

          // whitespace
          { include: "@whitespace" },

          // delimiters and operators
          [/[{}()\[\]]/, "@brackets"],

          // [/[<>](?!@symbols)/, "@brackets"],
          // [
          //     /@symbols/,
          //     { cases: { "@operators": "operator", "@default": "" } },
          // ],

          // @ annotations.
          // As an example, we emit a debugging log message on these tokens.
          // Note: message are supressed during the first load -- change some lines to see them.
          [
              /@\s*[a-zA-Z_\$][\w\$]*/,
              { token: "annotation", log: "annotation token: $0" },
          ],

          // numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
          [/0[xX][0-9a-fA-F]+/, "number.hex"],
          [/\d+/, "number"],

          // delimiter: after number because of .\d floats
          [/[;,.]/, "delimiter"],

          // strings
          [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
          [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

          // characters
          [/'[^\\']'/, "string"],
          [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
          [/'/, "string.invalid"],
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
