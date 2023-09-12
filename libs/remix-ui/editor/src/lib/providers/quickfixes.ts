export default {
  'Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.':
    [
      {
        id: 1.1,
        nodeType: 'SourceUnit',
        title: 'Add non-open-source license',
        message: '// SPDX-License-Identifier: UNLICENSED'
      },
      {
        id: 1.2,
        nodeType: 'SourceUnit',
        title: 'Add Apache-1.1 license',
        message: '// SPDX-License-Identifier: Apache-1.1'
      },
      {
        id: 1.3,
        nodeType: 'SourceUnit',
        title: 'Add Apache-2.0 license',
        message: '// SPDX-License-Identifier: Apache-2.0'
      },
      {
        id: 1.4,
        nodeType: 'SourceUnit',
        title: 'Add MIT license',
        message: '// SPDX-License-Identifier: MIT'
      },
      {
        id: 1.5,
        nodeType: 'SourceUnit',
        title: 'Add EPL-1.0 (Eclipse) license',
        message: '// SPDX-License-Identifier: EPL-1.0'
      },
      {
        id: 1.6,
        nodeType: 'SourceUnit',
        title: 'Add EPL-2.0 (Eclipse) license',
        message: '// SPDX-License-Identifier: EPL-2.0'
      },
      {
        id: 1.7,
        nodeType: 'SourceUnit',
        title: 'Add GPL-3.0-only license',
        message: '// SPDX-License-Identifier: GPL-3.0-only'
      },
      {
        id: 1.8,
        nodeType: 'SourceUnit',
        title: 'Add GPL-3.0-or-later license',
        message: '// SPDX-License-Identifier: GPL-3.0-or-later'
      }
    ],
  'Warning: Source file does not specify required compiler version! Consider adding':
    [
      {
        id: 2,
        title: 'Add Solidity pragma',
        nodeType: 'PragmaDirective',
        range: {
          startLineNumber: 2,
          endLineNumber: 2,
          startColumn: 1,
          endColumn: 1
        }
      }
    ],
  'SyntaxError: No visibility specified. Did you intend to add "public"': [
    {
      id: 3.1,
      title: "Add visibility 'public'",
      message: 'public ',
      nodeType: 'FunctionDefinition'
    },
    {
      id: 3.2,
      title: "Add visibility 'private'",
      message: 'private ',
      nodeType: 'FunctionDefinition'
    },
    {
      id: 3.3,
      title: "Add visibility 'internal'",
      message: 'internal ',
      nodeType: 'FunctionDefinition'
    },
    {
      id: 3.4,
      title: "Add visibility 'external'",
      message: 'external ',
      nodeType: 'FunctionDefinition'
    }
  ],
  'Warning: Function state mutability can be restricted to view': [
    {
      id: 4,
      title: "Add mutability 'view'",
      message: 'view ',
      nodeType: 'FunctionDefinition'
    }
  ],
  'Warning: Function state mutability can be restricted to pure': [
    {
      id: 5,
      title: "Add mutability 'pure'",
      message: 'pure ',
      nodeType: 'FunctionDefinition'
    }
  ],
  'TypeError: Trying to override non-virtual function. Did you forget to add "virtual"':[
    {
      id: 6,
      title: "Add 'virtual' specifier",
      message: 'virtual',
      nodeType: 'FunctionDefinition'
    }
  ],
  'TypeError: Overriding function is missing "override" specifier':[
    {
      id: 7,
      title: "Add 'override' specifier",
      message: 'override',
      nodeType: 'FunctionDefinition'
    }
  ],
  'should be marked as abstract': [
    {
      id: 8,
      title: "Add 'abstract' to contract",
      message: 'abstract ',
      nodeType: 'ContractDefinition'
    }
  ],
  'TypeError: Data location must be "storage" or "memory" for constructor parameter, but none was given.': [
    {
      id: 9.1,
      title: "Add 'storage' to param",
      message: ' storage '
    },
    {
      id: 9.2,
      title: "Add 'memory' to param",
      message: ' memory '
    }
  ],
  'TypeError: Data location must be "storage", "memory" or "calldata" for variable, but none was given.': [
    {
      id: 10.1,
      title: "Add 'storage' to variable",
      message: ' storage '
    },
    {
      id: 10.2,
      title: "Add 'memory' to variable",
      message: ' memory '
    },
    {
      id: 10.3,
      title: "Add 'calldata' to variable",
      message: ' calldata '
    }
  ],
  'TypeError: Data location must be "memory" or "calldata" for parameter in function, but none was given.': [
    {
      id: 11.1,
      title: "Add 'memory' to param",
      message: ' memory '
    },
    {
      id: 11.2,
      title: "Add 'calldata' to param",
      message: ' calldata '
    }
  ],
  'SyntaxError: No visibility specified. Did you intend to add "external': [
    {
      id: 12,
      title: "Add visibility 'external'",
      message: 'external ',
      nodeType: 'FunctionDefinition'
    }
  ],
  'DeclarationError: Receive ether function must be payable, but is "nonpayable".': [
    {
      id: 13,
      title: "Make function 'payable'",
      message: 'payable ',
      nodeType: 'FunctionDefinition'
    }
  ]
}
