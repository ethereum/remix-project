export default {
  "Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing \"SPDX-License-Identifier: <SPDX-License>\" to each source file. Use \"SPDX-License-Identifier: UNLICENSED\" for non-open-source code. Please see https://spdx.org for more information.": {
    "title": "Add open-source license",
    "message": "// SPDX-License-Identifier: GPL-3.0",
    "nodeType": "SourceUnit"
  },
  "Warning: Source file does not specify required compiler version! Consider adding" : {
    "title": "Add pragma line",
    "message": "pragma solidity ^0.*.*;",
    "nodeType": "PragmaDirective",
    "range": {
      startLineNumber: 2,
      endLineNumber: 2,
      startColumn: 1,
      endColumn: 1
    }
  },
  "SyntaxError: No visibility specified. Did you intend to add \"public\"": {
    "title": "Add public visibility",
    "message": "public ",
    "nodeType": "FunctionDefinition"
  }
}