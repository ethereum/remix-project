/* eslint-disable */
export const noirLanguageConfig = (monaco) => ({
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*#region\\b'),
      end: new RegExp('^\\s*#endregion\\b')
    }
  }
})

export const noirTokensProvider = {
  defaultToken: "",

  tokenPostfix: ".nr",

  keywords: [
    'fn', 'let', 'const', 'pub', 'private', 'struct', 'enum', 'return',
    'if', 'else', 'for', 'while', 'break', 'continue', 'match', 'true', 'false',
  ],

  typeKeywords: [
    'Field', 'Bool', 'Integer', 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64',
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--',
    '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=',
    '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>=',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  escapes:
      /\\(?:[abfnrtv\\"'`]|x[0-9A-Fa-f]{1,2}|u\{[0-9A-Fa-f]{1,6}\})/,

  tokenizer: {
    root: [
      // Match function definitions
      [/(\bfn\b)(\s+)([a-zA-Z_$][\w$]*)/, ['keyword', '', 'function']],

      // Match function calls
      [/[a-zA-Z_$][\w$]*(?=\s*\()/, 'function.call'],

      // identifiers and keywords
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@typeKeywords': 'type',
          '@default': 'identifier'
        }
      }],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],

      // comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],
  },
}
