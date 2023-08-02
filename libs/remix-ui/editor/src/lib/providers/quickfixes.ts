export default {
  "Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing \"SPDX-License-Identifier: <SPDX-License>\" to each source file. Use \"SPDX-License-Identifier: UNLICENSED\" for non-open-source code. Please see https://spdx.org for more information.": [{
    "id": 1.1,
    "nodeType": "SourceUnit",
    "title": "Add open-source license",
    "message": "// SPDX-License-Identifier: GPL-3.0"
  },{
    "id": 1.2,
    "nodeType": "SourceUnit",
    "title": "Add non-open-source license",
    "message": "// SPDX-License-Identifier: UNLICENSED"
  }],
  "Warning: Source file does not specify required compiler version! Consider adding" : {
    "id": 2,
    "title": "Add Solidity pragma",
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
    "id": 3,
    "title": "Add visibility 'public'",
    "message": "public ",
    "nodeType": "FunctionDefinition"
  },
  "Warning: Function state mutability can be restricted to view": {
    "id": 4,
    "title": "Add mutability 'view'",
    "message": "view ",
    "nodeType": "FunctionDefinition"
  },
  "Warning: Function state mutability can be restricted to pure": {
    "id": 5,
    "title": "Add mutability 'pure'",
    "message": "pure ",
    "nodeType": "FunctionDefinition"
  }
}