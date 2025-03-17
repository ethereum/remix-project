/* eslint-disable no-useless-escape */
export const vyperLanguageConfig = {
  comments: {
    lineComment: "#",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "[", close: "]" },
    { open: "{", close: "}" },
    { open: "(", close: ")" },
    { open: "'", close: "'", notIn: ["string"]},
    { open: '"', close: '"', notIn: ["string"]},
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "'", close: "'" },
    { open: '"', close: '"' },
  ],
};

export const vyperTokenProvider = {
  keywords: [
    "contract", "def", "if", "elif", "else", "for", "while", "break", "continue", "return", "assert", "pass", "log", "struct",
    "event", "indexed", "public", "private", "pure", "view", "payable", "nonpayable", "external", "internal", "self", "send",
    "call", "delegatecall", "transfer", "mod", "range", "True", "False", "None",
  ],

  typeKeywords: [
    "address", "bool", "bytes", "bytes32", "decimal", "int128", "uint256", "string", "mapping", "immutable",
  ],

  operators: [
    "=", "+", "-", "*", "/", "%", "**", "//", "&", "|", "^", "~", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "**=", "//=",
    "&=", "|=", "^=", "<<=", ">>=", "==", "!=", "<", "<=", ">", ">=", "and", "or", "not",
  ],

  symbols: /[=><!~?:&|+\-*\/^%]+/,

  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})/,

  tokenizer: {
    root: [
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          "@typeKeywords": "type.identifier",
          "@keywords": "keyword",
          "@default": "variable",
        },
      }],
      [/[{}()\[\]]/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/\d+/, "number"],
      [/[;,.]/, "delimiter"],
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
      [/'[^\\']'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
      [/#[^\n]*/, "comment"],
    ],
    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],
  },
};
