import { Node } from '../../src/'
let node: Node;

node = {
  "ast":
  {
    "absolutePath": "greeter.sol",
    "exportedSymbols": {
      "Greeter": [
        25
      ]
    },
    "id": 26,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 1,
        "literals": [
          "solidity",
          ">=",
          "0.5",
          ".0",
          "<",
          "0.6",
          ".0"
        ],
        "nodeType": "PragmaDirective",
        "src": "0:31:0"
      },
      {
        "absolutePath": "mortal.sol",
        "file": "mortal.sol",
        "id": 2,
        "nodeType": "ImportDirective",
        "scope": 26,
        "sourceUnit": 53,
        "src": "32:20:0",
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "baseContracts": [
          {
            "arguments": null,
            "baseName": {
              "contractScope": null,
              "id": 3,
              "name": "Mortal",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 52,
              "src": "74:6:0",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_Mortal_$52",
                "typeString": "contract Mortal"
              }
            },
            "id": 4,
            "nodeType": "InheritanceSpecifier",
            "src": "74:6:0"
          }
        ],
        "contractDependencies": [
          52
        ],
        "contractKind": "contract",
        "documentation": null,
        "fullyImplemented": true,
        "id": 25,
        "linearizedBaseContracts": [
          25,
          52
        ],
        "name": "Greeter",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "constant": false,
            "id": 6,
            "name": "greeting",
            "nodeType": "VariableDeclaration",
            "scope": 25,
            "src": "141:15:0",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_string_storage",
              "typeString": "string"
            },
            "typeName": {
              "id": 5,
              "name": "string",
              "nodeType": "ElementaryTypeName",
              "src": "141:6:0",
              "typeDescriptions": {
                "typeIdentifier": "t_string_storage_ptr",
                "typeString": "string"
              }
            },
            "value": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 15,
              "nodeType": "Block",
              "src": "257:37:0",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 13,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "id": 11,
                      "name": "greeting",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 6,
                      "src": "267:8:0",
                      "typeDescriptions": {
                        "typeIdentifier": "t_string_storage",
                        "typeString": "string storage ref"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "id": 12,
                      "name": "_greeting",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 8,
                      "src": "278:9:0",
                      "typeDescriptions": {
                        "typeIdentifier": "t_string_memory_ptr",
                        "typeString": "string memory"
                      }
                    },
                    "src": "267:20:0",
                    "typeDescriptions": {
                      "typeIdentifier": "t_string_storage",
                      "typeString": "string storage ref"
                    }
                  },
                  "id": 14,
                  "nodeType": "ExpressionStatement",
                  "src": "267:20:0"
                }
              ]
            },
            "documentation": null,
            "id": 16,
            "implemented": true,
            "kind": "constructor",
            "modifiers": [],
            "name": "",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 9,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 8,
                  "name": "_greeting",
                  "nodeType": "VariableDeclaration",
                  "scope": 16,
                  "src": "225:23:0",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_string_memory_ptr",
                    "typeString": "string"
                  },
                  "typeName": {
                    "id": 7,
                    "name": "string",
                    "nodeType": "ElementaryTypeName",
                    "src": "225:6:0",
                    "typeDescriptions": {
                      "typeIdentifier": "t_string_storage_ptr",
                      "typeString": "string"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "224:25:0"
            },
            "returnParameters": {
              "id": 10,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "257:0:0"
            },
            "scope": 25,
            "src": "213:81:0",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "public"
          },
          {
            "body": {
              "id": 23,
              "nodeType": "Block",
              "src": "377:32:0",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 21,
                    "name": "greeting",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 6,
                    "src": "394:8:0",
                    "typeDescriptions": {
                      "typeIdentifier": "t_string_storage",
                      "typeString": "string storage ref"
                    }
                  },
                  "functionReturnParameters": 20,
                  "id": 22,
                  "nodeType": "Return",
                  "src": "387:15:0"
                }
              ]
            },
            "documentation": null,
            "id": 24,
            "implemented": true,
            "kind": "function",
            "modifiers": [],
            "name": "greet",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 17,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "338:2:0"
            },
            "returnParameters": {
              "id": 20,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 19,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 24,
                  "src": "362:13:0",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_string_memory_ptr",
                    "typeString": "string"
                  },
                  "typeName": {
                    "id": 18,
                    "name": "string",
                    "nodeType": "ElementaryTypeName",
                    "src": "362:6:0",
                    "typeDescriptions": {
                      "typeIdentifier": "t_string_storage_ptr",
                      "typeString": "string"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "361:15:0"
            },
            "scope": 25,
            "src": "324:85:0",
            "stateMutability": "view",
            "superFunction": null,
            "visibility": "public"
          }
        ],
        "scope": 26,
        "src": "54:357:0"
      }
    ],
    "src": "0:412:0"
  }
}


node.source = `contract test {
    int x;

    int y;

    function set(int _x) returns (int _r)
    {
        x = _x;
        y = 10;
        _r = x;
    }

    function get() returns (uint x, uint y)
    {

    }
}`

export default node;
