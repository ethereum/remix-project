import path from "path";
import { monacoTypes } from '@remix-ui/editor';

type CodeParserImportsData = {
    files?: string[],
    modules?: string[],
    packages?: string[],
}

export function getStringCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: 'concatenate an arbitrary number of string values',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'concat(${1:string})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'concat()',
      range,
    }
  ]
}

export function getBytesCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: 'concatenate an arbitrary number of values',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'concat(${1:bytes})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'concat()',
      range,
    }
  ]
}

export function getBlockCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: '(address): Current block miner’s address',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'coinbase',
      label: 'coinbase',
      range,
    },
    {
      detail: '(uint): Current block’s base fee',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'basefee',
      label: 'basefee',
      range,
    },
    {
      detail: '(uint): Current chain id',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'chainid',
      label: 'chainid',
      range,
    },
    {
      detail: '(bytes32): DEPRECATED In 0.4.22 use blockhash(uint) instead. Hash of the given block - only works for 256 most recent blocks excluding current',
      insertText: 'blockhash(${1:blockNumber});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'blockhash',
      range
    },
    {
      detail: '(uint): current block difficulty',
      kind: monaco.languages.CompletionItemKind.Property,
      label: 'difficulty',
      insertText: 'difficulty',
      range
    },
    {
      detail: '(uint): current block gaslimit',
      kind: monaco.languages.CompletionItemKind.Property,
      label: 'gaslimit',
      insertText: 'gaslimit',
      range
    },
    {
      detail: '(uint): current block number',
      kind: monaco.languages.CompletionItemKind.Property,
      label: 'number',
      insertText: 'number',
      range
    },
    {
      detail: '(uint): current block timestamp as seconds since unix epoch',
      kind: monaco.languages.CompletionItemKind.Property,
      label: 'timestamp',
      insertText: 'timestamp',
      range
    },
  ];
}

export function getCompletionSnippets(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      label: 'contract',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'contract ${1:Name} {\n\t$0\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'library',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'library ${1:Name} {\n\t$0\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'interface',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'interface ${1:Name} {\n\t$0\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'enum',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'enum ${1:Name} {${2:item1}, ${3:item2} }',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'function',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'function ${1:name}(${2:params}) {\n\t${3:code}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'constructor',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'constructor(${1:params}) {\n\t${2:code}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'ifstatement',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'if (${1:condition}) {\n\t${2:code}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'ifstatementelse',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'if (${1:condition}) {\n\t${2:code}\n} else {\n\t${3:code}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'while loop',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'while (${1:condition}) \n{\n\t${2:code}\n};',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'do while loop',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'do {\n\t${2:code}\n} \nwhile (${1:condition});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'for loop',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'for (${1:init}; ${2:condition}; ${3:increment}) \n{\n\t${4:code}\n};',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'pragma',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '// SPDX-License-Identifier: MIT\npragma solidity ${1:version};',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'SPDX-License-Identifier',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '// SPDX-License-Identifier: MIT',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    /* eslint-disable */
    // Related to https://github.com/juanfranblanco/vscode-solidity/blob/master/snippets/solidity.json
    {
      label: 'erc20i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-20\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface Token {\r\n\r\n    \/\/\/ @param _owner The address from which the balance will be retrieved\r\n    \/\/\/ @return balance the balance\r\n    function balanceOf(address _owner) external view returns (uint256 balance);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `msg.sender`\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transfer(address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`\r\n    \/\/\/ @param _from The address of the sender\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice `msg.sender` approves `_addr` to spend `_value` tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @param _value The amount of wei to be approved for transfer\r\n    \/\/\/ @return success Whether the approval was successful or not\r\n    function approve(address _spender, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @param _owner The address of the account owning tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @return remaining Amount of remaining tokens allowed to spent\r\n    function allowance(address _owner, address _spender) external view returns (uint256 remaining);\r\n\r\n    event Transfer(address indexed _from, address indexed _to, uint256 _value);\r\n    event Approval(address indexed _owner, address indexed _spender, uint256 _value);\r\n}',
      documentation: 'ERC20 token standard interface\n\n \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-20\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface Token {\r\n\r\n    \/\/\/ @param _owner The address from which the balance will be retrieved\r\n    \/\/\/ @return balance the balance\r\n    function balanceOf(address _owner) external view returns (uint256 balance);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `msg.sender`\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transfer(address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`\r\n    \/\/\/ @param _from The address of the sender\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice `msg.sender` approves `_addr` to spend `_value` tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @param _value The amount of wei to be approved for transfer\r\n    \/\/\/ @return success Whether the approval was successful or not\r\n    function approve(address _spender, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @param _owner The address of the account owning tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @return remaining Amount of remaining tokens allowed to spent\r\n    function allowance(address _owner, address _spender) external view returns (uint256 remaining);\r\n\r\n    event Transfer(address indexed _from, address indexed _to, uint256 _value);\r\n    event Approval(address indexed _owner, address indexed _spender, uint256 _value);\r\n}',
      detail: 'generate ERC20 interface',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc20',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-20\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface Token {\r\n\r\n    \/\/\/ @param _owner The address from which the balance will be retrieved\r\n    \/\/\/ @return balance the balance\r\n    function balanceOf(address _owner) external view returns (uint256 balance);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `msg.sender`\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transfer(address _to, uint256 _value)  external returns (bool success);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`\r\n    \/\/\/ @param _from The address of the sender\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice `msg.sender` approves `_addr` to spend `_value` tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @param _value The amount of wei to be approved for transfer\r\n    \/\/\/ @return success Whether the approval was successful or not\r\n    function approve(address _spender  , uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @param _owner The address of the account owning tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @return remaining Amount of remaining tokens allowed to spent\r\n    function allowance(address _owner, address _spender) external view returns (uint256 remaining);\r\n\r\n    event Transfer(address indexed _from, address indexed _to, uint256 _value);\r\n    event Approval(address indexed _owner, address indexed _spender, uint256 _value);\r\n}\r\n\r\ncontract Standard_Token is Token {\r\n    uint256 constant private MAX_UINT256 = 2**256 - 1;\r\n    mapping (address => uint256) public balances;\r\n    mapping (address => mapping (address => uint256)) public allowed;\r\n    uint256 public totalSupply;\r\n    \/*\r\n    NOTE:\r\n    The following variables are OPTIONAL vanities. One does not have to include them.\r\n    They allow one to customise the token contract & in no way influences the core functionality.\r\n    Some wallets\/interfaces might not even bother to look at this information.\r\n    *\/\r\n    string public name;                   \/\/fancy name: eg Simon Bucks\r\n    uint8 public decimals;                \/\/How many decimals to show.\r\n    string public symbol;                 \/\/An identifier: eg SBX\r\n\r\n    constructor(uint256 _initialAmount, string memory _tokenName, uint8 _decimalUnits, string  memory _tokenSymbol) {\r\n        balances[msg.sender] = _initialAmount;               \/\/ Give the creator all initial tokens\r\n        totalSupply = _initialAmount;                        \/\/ Update total supply\r\n        name = _tokenName;                                   \/\/ Set the name for display purposes\r\n        decimals = _decimalUnits;                            \/\/ Amount of decimals for display purposes\r\n        symbol = _tokenSymbol;                               \/\/ Set the symbol for display purposes\r\n    }\r\n\r\n    function transfer(address _to, uint256 _value) public override returns (bool success) {\r\n        require(balances[msg.sender] >= _value, \"token balance is lower than the value requested\");\r\n        balances[msg.sender] -= _value;\r\n        balances[_to] += _value;\r\n        emit Transfer(msg.sender, _to, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {\r\n        uint256 allowance = allowed[_from][msg.sender];\r\n        require(balances[_from] >= _value && allowance >= _value, \"token balance or allowance is lower than amount requested\");\r\n        balances[_to] += _value;\r\n        balances[_from] -= _value;\r\n        if (allowance < MAX_UINT256) {\r\n            allowed[_from][msg.sender] -= _value;\r\n        }\r\n        emit Transfer(_from, _to, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function balanceOf(address _owner) public override view returns (uint256 balance) {\r\n        return balances[_owner];\r\n    }\r\n\r\n    function approve(address _spender, uint256 _value) public override returns (bool success) {\r\n        allowed[msg.sender][_spender] = _value;\r\n        emit Approval(msg.sender, _spender, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function allowance(address _owner, address _spender) public override view returns (uint256 remaining) {\r\n        return allowed[_owner][_spender];\r\n    }\r\n}',
      documentation: 'ERC20 example implementation\n\n \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-20\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface Token {\r\n\r\n    \/\/\/ @param _owner The address from which the balance will be retrieved\r\n    \/\/\/ @return balance the balance\r\n    function balanceOf(address _owner) external view returns (uint256 balance);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `msg.sender`\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transfer(address _to, uint256 _value)  external returns (bool success);\r\n\r\n    \/\/\/ @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`\r\n    \/\/\/ @param _from The address of the sender\r\n    \/\/\/ @param _to The address of the recipient\r\n    \/\/\/ @param _value The amount of token to be transferred\r\n    \/\/\/ @return success Whether the transfer was successful or not\r\n    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @notice `msg.sender` approves `_addr` to spend `_value` tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @param _value The amount of wei to be approved for transfer\r\n    \/\/\/ @return success Whether the approval was successful or not\r\n    function approve(address _spender  , uint256 _value) external returns (bool success);\r\n\r\n    \/\/\/ @param _owner The address of the account owning tokens\r\n    \/\/\/ @param _spender The address of the account able to transfer the tokens\r\n    \/\/\/ @return remaining Amount of remaining tokens allowed to spent\r\n    function allowance(address _owner, address _spender) external view returns (uint256 remaining);\r\n\r\n    event Transfer(address indexed _from, address indexed _to, uint256 _value);\r\n    event Approval(address indexed _owner, address indexed _spender, uint256 _value);\r\n}\r\n\r\ncontract Standard_Token is Token {\r\n    uint256 constant private MAX_UINT256 = 2**256 - 1;\r\n    mapping (address => uint256) public balances;\r\n    mapping (address => mapping (address => uint256)) public allowed;\r\n    uint256 public totalSupply;\r\n    \/*\r\n    NOTE:\r\n    The following variables are OPTIONAL vanities. One does not have to include them.\r\n    They allow one to customise the token contract & in no way influences the core functionality.\r\n    Some wallets\/interfaces might not even bother to look at this information.\r\n    *\/\r\n    string public name;                   \/\/fancy name: eg Simon Bucks\r\n    uint8 public decimals;                \/\/How many decimals to show.\r\n    string public symbol;                 \/\/An identifier: eg SBX\r\n\r\n    constructor(uint256 _initialAmount, string memory _tokenName, uint8 _decimalUnits, string  memory _tokenSymbol) {\r\n        balances[msg.sender] = _initialAmount;               \/\/ Give the creator all initial tokens\r\n        totalSupply = _initialAmount;                        \/\/ Update total supply\r\n        name = _tokenName;                                   \/\/ Set the name for display purposes\r\n        decimals = _decimalUnits;                            \/\/ Amount of decimals for display purposes\r\n        symbol = _tokenSymbol;                               \/\/ Set the symbol for display purposes\r\n    }\r\n\r\n    function transfer(address _to, uint256 _value) public override returns (bool success) {\r\n        require(balances[msg.sender] >= _value, \"token balance is lower than the value requested\");\r\n        balances[msg.sender] -= _value;\r\n        balances[_to] += _value;\r\n        emit Transfer(msg.sender, _to, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {\r\n        uint256 allowance = allowed[_from][msg.sender];\r\n        require(balances[_from] >= _value && allowance >= _value, \"token balance or allowance is lower than amount requested\");\r\n        balances[_to] += _value;\r\n        balances[_from] -= _value;\r\n        if (allowance < MAX_UINT256) {\r\n            allowed[_from][msg.sender] -= _value;\r\n        }\r\n        emit Transfer(_from, _to, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function balanceOf(address _owner) public override view returns (uint256 balance) {\r\n        return balances[_owner];\r\n    }\r\n\r\n    function approve(address _spender, uint256 _value) public override returns (bool success) {\r\n        allowed[msg.sender][_spender] = _value;\r\n        emit Approval(msg.sender, _spender, _value); \/\/solhint-disable-line indent, no-unused-vars\r\n        return true;\r\n    }\r\n\r\n    function allowance(address _owner, address _spender) public override view returns (uint256 remaining) {\r\n        return allowed[_owner][_spender];\r\n    }\r\n}',
      detail: 'generate ERC20 example',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc165i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https://eips.ethereum.org/EIPS/eip-165 \r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      documentation: 'ERC165 Standard Interface Detection Interface: Creates a standard method to publish and detect what interfaces a smart contract implements. \n\n \/\/ https://eips.ethereum.org/EIPS/eip-165 \r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      detail: 'generate ERC165 interface',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc721i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https://eips.ethereum.org/EIPS/eip-721 \r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/\/\/ @title ERC-721 Non-Fungible Token Standard\r\n\/\/\/ @dev See https:\/\/eips.ethereum.org\/EIPS\/eip-721\r\n\/\/\/  Note: the ERC-165 identifier for this interface is 0x80ac58cd.\r\ninterface ERC721 \/* is ERC165 *\/ {\r\n    \/\/\/ @dev This emits when ownership of any NFT changes by any mechanism.\r\n    \/\/\/  This event emits when NFTs are created (`from` == 0) and destroyed\r\n    \/\/\/  (`to` == 0). Exception: during contract creation, any number of NFTs\r\n    \/\/\/  may be created and assigned without emitting Transfer. At the time of\r\n    \/\/\/  any transfer, the approved address for that NFT (if any) is reset to none.\r\n    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);\r\n\r\n    \/\/\/ @dev This emits when the approved address for an NFT is changed or\r\n    \/\/\/  reaffirmed. The zero address indicates there is no approved address.\r\n    \/\/\/  When a Transfer event emits, this also indicates that the approved\r\n    \/\/\/  address for that NFT (if any) is reset to none.\r\n    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);\r\n\r\n    \/\/\/ @dev This emits when an operator is enabled or disabled for an owner.\r\n    \/\/\/  The operator can manage all NFTs of the owner.\r\n    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);\r\n\r\n    \/\/\/ @notice Count all NFTs assigned to an owner\r\n    \/\/\/ @dev NFTs assigned to the zero address are considered invalid, and this\r\n    \/\/\/  function throws for queries about the zero address.\r\n    \/\/\/ @param _owner An address for whom to query the balance\r\n    \/\/\/ @return The number of NFTs owned by `_owner`, possibly zero\r\n    function balanceOf(address _owner) external view returns (uint256);\r\n\r\n    \/\/\/ @notice Find the owner of an NFT\r\n    \/\/\/ @dev NFTs assigned to zero address are considered invalid, and queries\r\n    \/\/\/  about them do throw.\r\n    \/\/\/ @param _tokenId The identifier for an NFT\r\n    \/\/\/ @return The address of the owner of the NFT\r\n    function ownerOf(uint256 _tokenId) external view returns (address);\r\n\r\n    \/\/\/ @notice Transfers the ownership of an NFT from one address to another address\r\n    \/\/\/ @dev Throws unless `msg.sender` is the current owner, an authorized\r\n    \/\/\/  operator, or the approved address for this NFT. Throws if `_from` is\r\n    \/\/\/  not the current owner. Throws if `_to` is the zero address. Throws if\r\n    \/\/\/  `_tokenId` is not a valid NFT. When transfer is complete, this function\r\n    \/\/\/  checks if `_to` is a smart contract (code size > 0). If so, it calls\r\n    \/\/\/  `onERC721Received` on `_to` and throws if the return value is not\r\n    \/\/\/  `bytes4(keccak256(\"onERC721Received(address,address,uint256,bytes)\"))`.\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    \/\/\/ @param data Additional data with no specified format, sent in call to `_to`\r\n    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) external payable;\r\n\r\n    \/\/\/ @notice Transfers the ownership of an NFT from one address to another address\r\n    \/\/\/ @dev This works identically to the other function with an extra data parameter,\r\n    \/\/\/  except this function just sets data to \"\".\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE\r\n    \/\/\/  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE\r\n    \/\/\/  THEY MAY BE PERMANENTLY LOST\r\n    \/\/\/ @dev Throws unless `msg.sender` is the current owner, an authorized\r\n    \/\/\/  operator, or the approved address for this NFT. Throws if `_from` is\r\n    \/\/\/  not the current owner. Throws if `_to` is the zero address. Throws if\r\n    \/\/\/  `_tokenId` is not a valid NFT.\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Change or reaffirm the approved address for an NFT\r\n    \/\/\/ @dev The zero address indicates there is no approved address.\r\n    \/\/\/  Throws unless `msg.sender` is the current NFT owner, or an authorized\r\n    \/\/\/  operator of the current owner.\r\n    \/\/\/ @param _approved The new approved NFT controller\r\n    \/\/\/ @param _tokenId The NFT to approve\r\n    function approve(address _approved, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Enable or disable approval for a third party (\"operator\") to manage\r\n    \/\/\/  all of `msg.sender` assets\r\n    \/\/\/ @dev Emits the ApprovalForAll event. The contract MUST allow\r\n    \/\/\/  multiple operators per owner.\r\n    \/\/\/ @param _operator Address to add to the set of authorized operators\r\n    \/\/\/ @param _approved True if the operator is approved, false to revoke approval\r\n    function setApprovalForAll(address _operator, bool _approved) external;\r\n\r\n    \/\/\/ @notice Get the approved address for a single NFT\r\n    \/\/\/ @dev Throws if `_tokenId` is not a valid NFT.\r\n    \/\/\/ @param _tokenId The NFT to find the approved address for\r\n    \/\/\/ @return The approved address for this NFT, or the zero address if there is none\r\n    function getApproved(uint256 _tokenId) external view returns (address);\r\n\r\n    \/\/\/ @notice Query if an address is an authorized operator for another address\r\n    \/\/\/ @param _owner The address that owns the NFTs\r\n    \/\/\/ @param _operator The address that acts on behalf of the owner\r\n    \/\/\/ @return True if `_operator` is an approved operator for `_owner`, false otherwise\r\n    function isApprovedForAll(address _owner, address _operator) external view returns (bool);\r\n}\r\n\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      documentation: 'ERC-721 Non-Fungible Token Standard, A standard interface for non-fungible tokens, also known as deeds. \n\n \/\/ https://eips.ethereum.org/EIPS/eip-721 \r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/\/\/ @title ERC-721 Non-Fungible Token Standard\r\n\/\/\/ @dev See https:\/\/eips.ethereum.org\/EIPS\/eip-721\r\n\/\/\/  Note: the ERC-165 identifier for this interface is 0x80ac58cd.\r\ninterface ERC721 \/* is ERC165 *\/ {\r\n    \/\/\/ @dev This emits when ownership of any NFT changes by any mechanism.\r\n    \/\/\/  This event emits when NFTs are created (`from` == 0) and destroyed\r\n    \/\/\/  (`to` == 0). Exception: during contract creation, any number of NFTs\r\n    \/\/\/  may be created and assigned without emitting Transfer. At the time of\r\n    \/\/\/  any transfer, the approved address for that NFT (if any) is reset to none.\r\n    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);\r\n\r\n    \/\/\/ @dev This emits when the approved address for an NFT is changed or\r\n    \/\/\/  reaffirmed. The zero address indicates there is no approved address.\r\n    \/\/\/  When a Transfer event emits, this also indicates that the approved\r\n    \/\/\/  address for that NFT (if any) is reset to none.\r\n    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);\r\n\r\n    \/\/\/ @dev This emits when an operator is enabled or disabled for an owner.\r\n    \/\/\/  The operator can manage all NFTs of the owner.\r\n    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);\r\n\r\n    \/\/\/ @notice Count all NFTs assigned to an owner\r\n    \/\/\/ @dev NFTs assigned to the zero address are considered invalid, and this\r\n    \/\/\/  function throws for queries about the zero address.\r\n    \/\/\/ @param _owner An address for whom to query the balance\r\n    \/\/\/ @return The number of NFTs owned by `_owner`, possibly zero\r\n    function balanceOf(address _owner) external view returns (uint256);\r\n\r\n    \/\/\/ @notice Find the owner of an NFT\r\n    \/\/\/ @dev NFTs assigned to zero address are considered invalid, and queries\r\n    \/\/\/  about them do throw.\r\n    \/\/\/ @param _tokenId The identifier for an NFT\r\n    \/\/\/ @return The address of the owner of the NFT\r\n    function ownerOf(uint256 _tokenId) external view returns (address);\r\n\r\n    \/\/\/ @notice Transfers the ownership of an NFT from one address to another address\r\n    \/\/\/ @dev Throws unless `msg.sender` is the current owner, an authorized\r\n    \/\/\/  operator, or the approved address for this NFT. Throws if `_from` is\r\n    \/\/\/  not the current owner. Throws if `_to` is the zero address. Throws if\r\n    \/\/\/  `_tokenId` is not a valid NFT. When transfer is complete, this function\r\n    \/\/\/  checks if `_to` is a smart contract (code size > 0). If so, it calls\r\n    \/\/\/  `onERC721Received` on `_to` and throws if the return value is not\r\n    \/\/\/  `bytes4(keccak256(\"onERC721Received(address,address,uint256,bytes)\"))`.\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    \/\/\/ @param data Additional data with no specified format, sent in call to `_to`\r\n    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) external payable;\r\n\r\n    \/\/\/ @notice Transfers the ownership of an NFT from one address to another address\r\n    \/\/\/ @dev This works identically to the other function with an extra data parameter,\r\n    \/\/\/  except this function just sets data to \"\".\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE\r\n    \/\/\/  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE\r\n    \/\/\/  THEY MAY BE PERMANENTLY LOST\r\n    \/\/\/ @dev Throws unless `msg.sender` is the current owner, an authorized\r\n    \/\/\/  operator, or the approved address for this NFT. Throws if `_from` is\r\n    \/\/\/  not the current owner. Throws if `_to` is the zero address. Throws if\r\n    \/\/\/  `_tokenId` is not a valid NFT.\r\n    \/\/\/ @param _from The current owner of the NFT\r\n    \/\/\/ @param _to The new owner\r\n    \/\/\/ @param _tokenId The NFT to transfer\r\n    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Change or reaffirm the approved address for an NFT\r\n    \/\/\/ @dev The zero address indicates there is no approved address.\r\n    \/\/\/  Throws unless `msg.sender` is the current NFT owner, or an authorized\r\n    \/\/\/  operator of the current owner.\r\n    \/\/\/ @param _approved The new approved NFT controller\r\n    \/\/\/ @param _tokenId The NFT to approve\r\n    function approve(address _approved, uint256 _tokenId) external payable;\r\n\r\n    \/\/\/ @notice Enable or disable approval for a third party (\"operator\") to manage\r\n    \/\/\/  all of `msg.sender` assets\r\n    \/\/\/ @dev Emits the ApprovalForAll event. The contract MUST allow\r\n    \/\/\/  multiple operators per owner.\r\n    \/\/\/ @param _operator Address to add to the set of authorized operators\r\n    \/\/\/ @param _approved True if the operator is approved, false to revoke approval\r\n    function setApprovalForAll(address _operator, bool _approved) external;\r\n\r\n    \/\/\/ @notice Get the approved address for a single NFT\r\n    \/\/\/ @dev Throws if `_tokenId` is not a valid NFT.\r\n    \/\/\/ @param _tokenId The NFT to find the approved address for\r\n    \/\/\/ @return The approved address for this NFT, or the zero address if there is none\r\n    function getApproved(uint256 _tokenId) external view returns (address);\r\n\r\n    \/\/\/ @notice Query if an address is an authorized operator for another address\r\n    \/\/\/ @param _owner The address that owns the NFTs\r\n    \/\/\/ @param _operator The address that acts on behalf of the owner\r\n    \/\/\/ @return True if `_operator` is an approved operator for `_owner`, false otherwise\r\n    function isApprovedForAll(address _owner, address _operator) external view returns (bool);\r\n}\r\n\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      detail: 'generate ERC721 interface',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc777i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-777\r\n\/\/ Example implementation https:\/\/github.com\/0xjac\/ERC777\/blob\/master\/contracts\/examples\/ReferenceToken.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface ERC777Token {\r\n    function name() external view returns (string memory);\r\n    function symbol() external view returns (string memory);\r\n    function totalSupply() external view returns (uint256);\r\n    function balanceOf(address holder) external view returns (uint256);\r\n    function granularity() external view returns (uint256);\r\n\r\n    function defaultOperators() external view returns (address[] memory);\r\n    function isOperatorFor(\r\n        address operator,\r\n        address holder\r\n    ) external view returns (bool);\r\n    function authorizeOperator(address operator) external;\r\n    function revokeOperator(address operator) external;\r\n\r\n    function send(address to, uint256 amount, bytes calldata data) external;\r\n    function operatorSend(\r\n        address from,\r\n        address to,\r\n        uint256 amount,\r\n        bytes calldata data,\r\n        bytes calldata operatorData\r\n    ) external;\r\n\r\n    function burn(uint256 amount, bytes calldata data) external;\r\n    function operatorBurn(\r\n        address from,\r\n        uint256 amount,\r\n        bytes calldata data,\r\n        bytes calldata operatorData\r\n    ) external;\r\n\r\n    event Sent(\r\n        address indexed operator,\r\n        address indexed from,\r\n        address indexed to,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event Minted(\r\n        address indexed operator,\r\n        address indexed to,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event Burned(\r\n        address indexed operator,\r\n        address indexed from,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event AuthorizedOperator(\r\n        address indexed operator,\r\n        address indexed holder\r\n    );\r\n    event RevokedOperator(address indexed operator, address indexed holder);\r\n}',
      documentation: 'ERC777 token standard, extending ERC20 \n\n \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-777\r\n\/\/ Example implementation https:\/\/github.com\/0xjac\/ERC777\/blob\/master\/contracts\/examples\/ReferenceToken.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface ERC777Token {\r\n    function name() external view returns (string memory);\r\n    function symbol() external view returns (string memory);\r\n    function totalSupply() external view returns (uint256);\r\n    function balanceOf(address holder) external view returns (uint256);\r\n    function granularity() external view returns (uint256);\r\n\r\n    function defaultOperators() external view returns (address[] memory);\r\n    function isOperatorFor(\r\n        address operator,\r\n        address holder\r\n    ) external view returns (bool);\r\n    function authorizeOperator(address operator) external;\r\n    function revokeOperator(address operator) external;\r\n\r\n    function send(address to, uint256 amount, bytes calldata data) external;\r\n    function operatorSend(\r\n        address from,\r\n        address to,\r\n        uint256 amount,\r\n        bytes calldata data,\r\n        bytes calldata operatorData\r\n    ) external;\r\n\r\n    function burn(uint256 amount, bytes calldata data) external;\r\n    function operatorBurn(\r\n        address from,\r\n        uint256 amount,\r\n        bytes calldata data,\r\n        bytes calldata operatorData\r\n    ) external;\r\n\r\n    event Sent(\r\n        address indexed operator,\r\n        address indexed from,\r\n        address indexed to,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event Minted(\r\n        address indexed operator,\r\n        address indexed to,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event Burned(\r\n        address indexed operator,\r\n        address indexed from,\r\n        uint256 amount,\r\n        bytes data,\r\n        bytes operatorData\r\n    );\r\n    event AuthorizedOperator(\r\n        address indexed operator,\r\n        address indexed holder\r\n    );\r\n    event RevokedOperator(address indexed operator, address indexed holder);\r\n}',
      detail: 'generate ERC777 interface',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc1155i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1155\r\n\/\/ Example implementation https:\/\/github.com\/enjin\/erc-1155\/blob\/master\/contracts\/ERC1155.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/**\r\n    @title ERC-1155 Multi Token Standard\r\n    @dev See https:\/\/eips.ethereum.org\/EIPS\/eip-1155\r\n    Note: The ERC-165 identifier for this interface is 0xd9b67a26.\r\n *\/\r\ninterface ERC1155 \/* is ERC165 *\/ {\r\n    \/**\r\n        @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see \"Safe Transfer Rules\" section of the standard).\r\n        The `_operator` argument MUST be the address of an account\/contract that is approved to make the transfer (SHOULD be msg.sender).\r\n        The `_from` argument MUST be the address of the holder whose balance is decreased.\r\n        The `_to` argument MUST be the address of the recipient whose balance is increased.\r\n        The `_id` argument MUST be the token type being transferred.\r\n        The `_value` argument MUST be the number of tokens the holder balance is decreased by and match what the recipient balance is increased by.\r\n        When minting\/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).\r\n        When burning\/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).\r\n    *\/\r\n    event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);\r\n\r\n    \/**\r\n        @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see \"Safe Transfer Rules\" section of the standard).\r\n        The `_operator` argument MUST be the address of an account\/contract that is approved to make the transfer (SHOULD be msg.sender).\r\n        The `_from` argument MUST be the address of the holder whose balance is decreased.\r\n        The `_to` argument MUST be the address of the recipient whose balance is increased.\r\n        The `_ids` argument MUST be the list of tokens being transferred.\r\n        The `_values` argument MUST be the list of number of tokens (matching the list and order of tokens specified in _ids) the holder balance is decreased by and match what the recipient balance is increased by.\r\n        When minting\/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).\r\n        When burning\/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).\r\n    *\/\r\n    event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);\r\n\r\n    \/**\r\n        @dev MUST emit when approval for a second party\/operator address to manage all tokens for an owner address is enabled or disabled (absence of an event assumes disabled).\r\n    *\/\r\n    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);\r\n\r\n    \/**\r\n        @dev MUST emit when the URI is updated for a token ID.\r\n        URIs are defined in RFC 3986.\r\n        The URI MUST point to a JSON file that conforms to the \"ERC-1155 Metadata URI JSON Schema\".\r\n    *\/\r\n    event URI(string _value, uint256 indexed _id);\r\n\r\n    \/**\r\n        @notice Transfers `_value` amount of an `_id` from the `_from` address to the `_to` address specified (with safety call).\r\n        @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see \"Approval\" section of the standard).\r\n        MUST revert if `_to` is the zero address.\r\n        MUST revert if balance of holder for token `_id` is lower than the `_value` sent.\r\n        MUST revert on any other error.\r\n        MUST emit the `TransferSingle` event to reflect the balance change (see \"Safe Transfer Rules\" section of the standard).\r\n        After the above conditions are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call `onERC1155Received` on `_to` and act appropriately (see \"Safe Transfer Rules\" section of the standard).\r\n        @param _from    Source address\r\n        @param _to      Target address\r\n        @param _id      ID of the token type\r\n        @param _value   Transfer amount\r\n        @param _data    Additional data with no specified format, MUST be sent unaltered in call to `onERC1155Received` on `_to`\r\n    *\/\r\n    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;\r\n\r\n    \/**\r\n        @notice Transfers `_values` amount(s) of `_ids` from the `_from` address to the `_to` address specified (with safety call).\r\n        @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see \"Approval\" section of the standard).\r\n        MUST revert if `_to` is the zero address.\r\n        MUST revert if length of `_ids` is not the same as length of `_values`.\r\n        MUST revert if any of the balance(s) of the holder(s) for token(s) in `_ids` is lower than the respective amount(s) in `_values` sent to the recipient.\r\n        MUST revert on any other error.\r\n        MUST emit `TransferSingle` or `TransferBatch` event(s) such that all the balance changes are reflected (see \"Safe Transfer Rules\" section of the standard).\r\n        Balance changes and events MUST follow the ordering of the arrays (_ids[0]\/_values[0] before _ids[1]\/_values[1], etc).\r\n        After the above conditions for the transfer(s) in the batch are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call the relevant `ERC1155TokenReceiver` hook(s) on `_to` and act appropriately (see \"Safe Transfer Rules\" section of the standard).\r\n        @param _from    Source address\r\n        @param _to      Target address\r\n        @param _ids     IDs of each token type (order and length must match _values array)\r\n        @param _values  Transfer amounts per token type (order and length must match _ids array)\r\n        @param _data    Additional data with no specified format, MUST be sent unaltered in call to the `ERC1155TokenReceiver` hook(s) on `_to`\r\n    *\/\r\n    function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids,\r\n                                    uint256[] calldata _values, bytes calldata _data) external;\r\n\r\n    \/**\r\n        @notice Get the balance of an account tokens.\r\n        @param _owner  The address of the token holder\r\n        @param _id     ID of the token\r\n        @return        The _owner balance of the token type requested\r\n     *\/\r\n    function balanceOf(address _owner, uint256 _id) external view returns (uint256);\r\n\r\n    \/**\r\n        @notice Get the balance of multiple account\/token pairs\r\n        @param _owners The addresses of the token holders\r\n        @param _ids    ID of the tokens\r\n        @return        The _owner balance of the token types requested (i.e. balance for each (owner, id) pair)\r\n     *\/\r\n    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory);\r\n\r\n    \/**\r\n        @notice Enable or disable approval for a third party (\"operator\") to manage all of the caller tokens.\r\n        @dev MUST emit the ApprovalForAll event on success.\r\n        @param _operator  Address to add to the set of authorized operators\r\n        @param _approved  True if the operator is approved, false to revoke approval\r\n    *\/\r\n    function setApprovalForAll(address _operator, bool _approved) external;\r\n\r\n    \/**\r\n        @notice Queries the approval status of an operator for a given owner.\r\n        @param _owner     The owner of the tokens\r\n        @param _operator  Address of authorized operator\r\n        @return           True if the operator is approved, false if not\r\n    *\/\r\n    function isApprovedForAll(address _owner, address _operator) external view returns (bool);\r\n}\r\n\r\n\/* ERC-1155 Token Receiver\r\nSmart contracts MUST implement all of the functions in the ERC1155TokenReceiver interface to accept transfers. See \u201CSafe Transfer Rules\u201D for further detail.\r\n\r\nSmart contracts MUST implement the ERC-165 supportsInterface function and signify support for the ERC1155TokenReceiver interface to accept transfers. See \u201CERC1155TokenReceiver ERC-165 rules\u201D for further detail.\r\n\r\n\/**\r\n    Note: The ERC-165 identifier for this interface is 0x4e2312e0.\r\n*\/\r\ninterface ERC1155TokenReceiver {\r\n    \/**\r\n        @notice Handle the receipt of a single ERC1155 token type.\r\n        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.\r\n        This function MUST return `bytes4(keccak256(\"onERC1155Received(address,address,uint256,uint256,bytes)\"))` (i.e. 0xf23a6e61) if it accepts the transfer.\r\n        This function MUST revert if it rejects the transfer.\r\n        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.\r\n        @param _operator  The address which initiated the transfer (i.e. msg.sender)\r\n        @param _from      The address which previously owned the token\r\n        @param _id        The ID of the token being transferred\r\n        @param _value     The amount of tokens being transferred\r\n        @param _data      Additional data with no specified format\r\n        @return           `bytes4(keccak256(\"onERC1155Received(address,address,uint256,uint256,bytes)\"))`\r\n    *\/\r\n    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data) external returns(bytes4);\r\n\r\n    \/**\r\n        @notice Handle the receipt of multiple ERC1155 token types.\r\n        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.\r\n        This function MUST return `bytes4(keccak256(\"onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)\"))` (i.e. 0xbc197c81) if it accepts the transfer(s).\r\n        This function MUST revert if it rejects the transfer(s).\r\n        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.\r\n        @param _operator  The address which initiated the batch transfer (i.e. msg.sender)\r\n        @param _from      The address which previously owned the token\r\n        @param _ids       An array containing ids of each token being transferred (order and length must match _values array)\r\n        @param _values    An array containing amounts of each token being transferred (order and length must match _ids array)\r\n        @param _data      Additional data with no specified format\r\n        @return           `bytes4(keccak256(\"onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)\"))`\r\n    *\/\r\n    function onERC1155BatchReceived(address _operator, address _from, uint256[] calldata _ids,\r\n                                        uint256[] calldata _values, bytes calldata _data) external returns(bytes4);\r\n}',
      documentation: 'EIP-1155: ERC-1155 Multi Token Standard, A standard interface for contracts that manage multiple token types. A single deployed contract may include any combination of fungible tokens, non-fungible tokens or other configurations (e.g. semi-fungible tokens). \n\n \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1155\r\n\/\/ Example implementation https:\/\/github.com\/enjin\/erc-1155\/blob\/master\/contracts\/ERC1155.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/**\r\n    @title ERC-1155 Multi Token Standard\r\n    @dev See https:\/\/eips.ethereum.org\/EIPS\/eip-1155\r\n    Note: The ERC-165 identifier for this interface is 0xd9b67a26.\r\n *\/\r\ninterface ERC1155 \/* is ERC165 *\/ {\r\n    \/**\r\n        @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see \"Safe Transfer Rules\" section of the standard).\r\n        The `_operator` argument MUST be the address of an account\/contract that is approved to make the transfer (SHOULD be msg.sender).\r\n        The `_from` argument MUST be the address of the holder whose balance is decreased.\r\n        The `_to` argument MUST be the address of the recipient whose balance is increased.\r\n        The `_id` argument MUST be the token type being transferred.\r\n        The `_value` argument MUST be the number of tokens the holder balance is decreased by and match what the recipient balance is increased by.\r\n        When minting\/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).\r\n        When burning\/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).\r\n    *\/\r\n    event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);\r\n\r\n    \/**\r\n        @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see \"Safe Transfer Rules\" section of the standard).\r\n        The `_operator` argument MUST be the address of an account\/contract that is approved to make the transfer (SHOULD be msg.sender).\r\n        The `_from` argument MUST be the address of the holder whose balance is decreased.\r\n        The `_to` argument MUST be the address of the recipient whose balance is increased.\r\n        The `_ids` argument MUST be the list of tokens being transferred.\r\n        The `_values` argument MUST be the list of number of tokens (matching the list and order of tokens specified in _ids) the holder balance is decreased by and match what the recipient balance is increased by.\r\n        When minting\/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).\r\n        When burning\/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).\r\n    *\/\r\n    event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);\r\n\r\n    \/**\r\n        @dev MUST emit when approval for a second party\/operator address to manage all tokens for an owner address is enabled or disabled (absence of an event assumes disabled).\r\n    *\/\r\n    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);\r\n\r\n    \/**\r\n        @dev MUST emit when the URI is updated for a token ID.\r\n        URIs are defined in RFC 3986.\r\n        The URI MUST point to a JSON file that conforms to the \"ERC-1155 Metadata URI JSON Schema\".\r\n    *\/\r\n    event URI(string _value, uint256 indexed _id);\r\n\r\n    \/**\r\n        @notice Transfers `_value` amount of an `_id` from the `_from` address to the `_to` address specified (with safety call).\r\n        @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see \"Approval\" section of the standard).\r\n        MUST revert if `_to` is the zero address.\r\n        MUST revert if balance of holder for token `_id` is lower than the `_value` sent.\r\n        MUST revert on any other error.\r\n        MUST emit the `TransferSingle` event to reflect the balance change (see \"Safe Transfer Rules\" section of the standard).\r\n        After the above conditions are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call `onERC1155Received` on `_to` and act appropriately (see \"Safe Transfer Rules\" section of the standard).\r\n        @param _from    Source address\r\n        @param _to      Target address\r\n        @param _id      ID of the token type\r\n        @param _value   Transfer amount\r\n        @param _data    Additional data with no specified format, MUST be sent unaltered in call to `onERC1155Received` on `_to`\r\n    *\/\r\n    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;\r\n\r\n    \/**\r\n        @notice Transfers `_values` amount(s) of `_ids` from the `_from` address to the `_to` address specified (with safety call).\r\n        @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see \"Approval\" section of the standard).\r\n        MUST revert if `_to` is the zero address.\r\n        MUST revert if length of `_ids` is not the same as length of `_values`.\r\n        MUST revert if any of the balance(s) of the holder(s) for token(s) in `_ids` is lower than the respective amount(s) in `_values` sent to the recipient.\r\n        MUST revert on any other error.\r\n        MUST emit `TransferSingle` or `TransferBatch` event(s) such that all the balance changes are reflected (see \"Safe Transfer Rules\" section of the standard).\r\n        Balance changes and events MUST follow the ordering of the arrays (_ids[0]\/_values[0] before _ids[1]\/_values[1], etc).\r\n        After the above conditions for the transfer(s) in the batch are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call the relevant `ERC1155TokenReceiver` hook(s) on `_to` and act appropriately (see \"Safe Transfer Rules\" section of the standard).\r\n        @param _from    Source address\r\n        @param _to      Target address\r\n        @param _ids     IDs of each token type (order and length must match _values array)\r\n        @param _values  Transfer amounts per token type (order and length must match _ids array)\r\n        @param _data    Additional data with no specified format, MUST be sent unaltered in call to the `ERC1155TokenReceiver` hook(s) on `_to`\r\n    *\/\r\n    function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids,\r\n                                    uint256[] calldata _values, bytes calldata _data) external;\r\n\r\n    \/**\r\n        @notice Get the balance of an account tokens.\r\n        @param _owner  The address of the token holder\r\n        @param _id     ID of the token\r\n        @return        The _owner balance of the token type requested\r\n     *\/\r\n    function balanceOf(address _owner, uint256 _id) external view returns (uint256);\r\n\r\n    \/**\r\n        @notice Get the balance of multiple account\/token pairs\r\n        @param _owners The addresses of the token holders\r\n        @param _ids    ID of the tokens\r\n        @return        The _owner balance of the token types requested (i.e. balance for each (owner, id) pair)\r\n     *\/\r\n    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory);\r\n\r\n    \/**\r\n        @notice Enable or disable approval for a third party (\"operator\") to manage all of the caller tokens.\r\n        @dev MUST emit the ApprovalForAll event on success.\r\n        @param _operator  Address to add to the set of authorized operators\r\n        @param _approved  True if the operator is approved, false to revoke approval\r\n    *\/\r\n    function setApprovalForAll(address _operator, bool _approved) external;\r\n\r\n    \/**\r\n        @notice Queries the approval status of an operator for a given owner.\r\n        @param _owner     The owner of the tokens\r\n        @param _operator  Address of authorized operator\r\n        @return           True if the operator is approved, false if not\r\n    *\/\r\n    function isApprovedForAll(address _owner, address _operator) external view returns (bool);\r\n}\r\n\r\n\/* ERC-1155 Token Receiver\r\nSmart contracts MUST implement all of the functions in the ERC1155TokenReceiver interface to accept transfers. See \u201CSafe Transfer Rules\u201D for further detail.\r\n\r\nSmart contracts MUST implement the ERC-165 supportsInterface function and signify support for the ERC1155TokenReceiver interface to accept transfers. See \u201CERC1155TokenReceiver ERC-165 rules\u201D for further detail.\r\n\r\n\/**\r\n    Note: The ERC-165 identifier for this interface is 0x4e2312e0.\r\n*\/\r\ninterface ERC1155TokenReceiver {\r\n    \/**\r\n        @notice Handle the receipt of a single ERC1155 token type.\r\n        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.\r\n        This function MUST return `bytes4(keccak256(\"onERC1155Received(address,address,uint256,uint256,bytes)\"))` (i.e. 0xf23a6e61) if it accepts the transfer.\r\n        This function MUST revert if it rejects the transfer.\r\n        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.\r\n        @param _operator  The address which initiated the transfer (i.e. msg.sender)\r\n        @param _from      The address which previously owned the token\r\n        @param _id        The ID of the token being transferred\r\n        @param _value     The amount of tokens being transferred\r\n        @param _data      Additional data with no specified format\r\n        @return           `bytes4(keccak256(\"onERC1155Received(address,address,uint256,uint256,bytes)\"))`\r\n    *\/\r\n    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data) external returns(bytes4);\r\n\r\n    \/**\r\n        @notice Handle the receipt of multiple ERC1155 token types.\r\n        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.\r\n        This function MUST return `bytes4(keccak256(\"onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)\"))` (i.e. 0xbc197c81) if it accepts the transfer(s).\r\n        This function MUST revert if it rejects the transfer(s).\r\n        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.\r\n        @param _operator  The address which initiated the batch transfer (i.e. msg.sender)\r\n        @param _from      The address which previously owned the token\r\n        @param _ids       An array containing ids of each token being transferred (order and length must match _values array)\r\n        @param _values    An array containing amounts of each token being transferred (order and length must match _ids array)\r\n        @param _data      Additional data with no specified format\r\n        @return           `bytes4(keccak256(\"onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)\"))`\r\n    *\/\r\n    function onERC1155BatchReceived(address _operator, address _from, uint256[] calldata _ids,\r\n                                        uint256[] calldata _values, bytes calldata _data) external returns(bytes4);\r\n}',
      detail: 'generate ERC1155 interface',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc1820',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1820\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\/* ERC1820 Pseudo-introspection Registry Contract\r\n * This standard defines a universal registry smart contract where any address (contract or regular account) can\r\n * register which interface it supports and which smart contract is responsible for its implementation.\r\n *\r\n * Written in 2019 by Jordi Baylina and Jacques Dafflon\r\n *\r\n * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to\r\n * this software to the public domain worldwide. This software is distributed without any warranty.\r\n *\r\n * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see\r\n * <http:\/\/creativecommons.org\/publicdomain\/zero\/1.0\/>.\r\n *\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\r\n *    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2588\u2588\u2588\u2588\u2557\r\n *    \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2551\r\n *    \u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551      \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\r\n *    \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D\r\n *\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\r\n *    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551  \u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u255A\u2588\u2588\u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557  \u255A\u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\r\n *    \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D\r\n *\r\n *\/\r\n\/\/ IV is value needed to have a vanity address starting with \'0x1820\'.\r\n\/\/ IV: 53759\r\n\r\n\/\/\/ @dev The interface a contract MUST implement if it is the implementer of\r\n\/\/\/ some (other) interface for any address other than itself.\r\ninterface ERC1820ImplementerInterface {\r\n    \/\/\/ @notice Indicates whether the contract implements the interface \'interfaceHash\' for the address \'addr\' or not.\r\n    \/\/\/ @param interfaceHash keccak256 hash of the name of the interface\r\n    \/\/\/ @param addr Address for which the contract will implement the interface\r\n    \/\/\/ @return ERC1820_ACCEPT_MAGIC only if the contract implements \'interfaceHash\' for the address \'addr\'.\r\n    function canImplementInterfaceForAddress(bytes32 interfaceHash, address addr) external view returns(bytes32);\r\n}\r\n\r\n\r\n\/\/\/ @title ERC1820 Pseudo-introspection Registry Contract\r\n\/\/\/ @author Jordi Baylina and Jacques Dafflon\r\n\/\/\/ @notice This contract is the official implementation of the ERC1820 Registry.\r\n\/\/\/ @notice For more details, see https:\/\/eips.ethereum.org\/EIPS\/eip-1820\r\ncontract ERC1820Registry {\r\n    \/\/\/@dev @notice ERC165 Invalid ID.\r\n    bytes4 constant internal INVALID_ID = 0xffffffff;\r\n    \/\/\/@dev @notice Method ID for the ERC165 supportsInterface method (= `bytes4(keccak256(\'supportsInterface(bytes4)\'))`).\r\n    bytes4 constant internal ERC165ID = 0x01ffc9a7;\r\n    \/\/\/@dev @notice Magic value which is returned if a contract implements an interface on behalf of some other address.\r\n    bytes32 constant internal ERC1820_ACCEPT_MAGIC = keccak256(abi.encodePacked(\"ERC1820_ACCEPT_MAGIC\"));\r\n\r\n    \/\/\/@dev @notice mapping from addresses and interface hashes to their implementers.\r\n    mapping(address => mapping(bytes32 => address)) internal interfaces;\r\n    \/\/\/@dev @notice mapping from addresses to their manager.\r\n    mapping(address => address) internal managers;\r\n    \/\/\/@dev @notice flag for each address and erc165 interface to indicate if it is cached.\r\n    mapping(address => mapping(bytes4 => bool)) internal erc165Cached;\r\n\r\n    \/\/\/ @notice Indicates a contract is the \'implementer\' of \'interfaceHash\' for \'addr\'.\r\n    event InterfaceImplementerSet(address indexed addr, bytes32 indexed interfaceHash, address indexed implementer);\r\n    \/\/\/ @notice Indicates \'newManager\' is the address of the new manager for \'addr\'.\r\n    event ManagerChanged(address indexed addr, address indexed newManager);\r\n\r\n    \/\/\/ @notice Query if an address implements an interface and through which contract.\r\n    \/\/\/ @param _addr Address being queried for the implementer of an interface.\r\n    \/\/\/ (If \'_addr\' is the zero address then \'msg.sender\' is assumed.)\r\n    \/\/\/ @param _interfaceHash Keccak256 hash of the name of the interface as a string.\r\n    \/\/\/ E.g., \'web3.utils.keccak256(\"ERC777TokensRecipient\")\' for the \'ERC777TokensRecipient\' interface.\r\n    \/\/\/ @return The address of the contract which implements the interface \'_interfaceHash\' for \'_addr\'\r\n    \/\/\/ or \'0\' if \'_addr\' did not register an implementer for this interface.\r\n    function getInterfaceImplementer(address _addr, bytes32 _interfaceHash) external view returns (address) {\r\n        address addr = _addr == address(0) ? msg.sender : _addr;\r\n        if (isERC165Interface(_interfaceHash)) {\r\n            bytes4 erc165InterfaceHash = bytes4(_interfaceHash);\r\n            return implementsERC165Interface(addr, erc165InterfaceHash) ? addr : address(0);\r\n        }\r\n        return interfaces[addr][_interfaceHash];\r\n    }\r\n\r\n    \/\/\/ @notice Sets the contract which implements a specific interface for an address.\r\n    \/\/\/ Only the manager defined for that address can set it.\r\n    \/\/\/ (Each address is the manager for itself until it sets a new manager.)\r\n    \/\/\/ @param _addr Address for which to set the interface.\r\n    \/\/\/ (If \'_addr\' is the zero address then \'msg.sender\' is assumed.)\r\n    \/\/\/ @param _interfaceHash Keccak256 hash of the name of the interface as a string.\r\n    \/\/\/ E.g., \'web3.utils.keccak256(\"ERC777TokensRecipient\")\' for the \'ERC777TokensRecipient\' interface.\r\n    \/\/\/ @param _implementer Contract address implementing \'_interfaceHash\' for \'_addr\'.\r\n    function setInterfaceImplementer(address _addr, bytes32 _interfaceHash, address _implementer) external {\r\n        address addr = _addr == address(0) ? msg.sender : _addr;\r\n        require(getManager(addr) == msg.sender, \"Not the manager\");\r\n\r\n        require(!isERC165Interface(_interfaceHash), \"Must not be an ERC165 hash\");\r\n        if (_implementer != address(0) && _implementer != msg.sender) {\r\n            require(\r\n                ERC1820ImplementerInterface(_implementer)\r\n                    .canImplementInterfaceForAddress(_interfaceHash, addr) == ERC1820_ACCEPT_MAGIC,\r\n                \"Does not implement the interface\"\r\n            );\r\n        }\r\n        interfaces[addr][_interfaceHash] = _implementer;\r\n        emit InterfaceImplementerSet(addr, _interfaceHash, _implementer);\r\n    }\r\n\r\n    \/\/\/ @notice Sets \'_newManager\' as manager for \'_addr\'.\r\n    \/\/\/ The new manager will be able to call \'setInterfaceImplementer\' for \'_addr\'.\r\n    \/\/\/ @param _addr Address for which to set the new manager.\r\n    \/\/\/ @param _newManager Address of the new manager for \'addr\'. (Pass \'0x0\' to reset the manager to \'_addr\'.)\r\n    function setManager(address _addr, address _newManager) external {\r\n        require(getManager(_addr) == msg.sender, \"Not the manager\");\r\n        managers[_addr] = _newManager == _addr ? address(0) : _newManager;\r\n        emit ManagerChanged(_addr, _newManager);\r\n    }\r\n\r\n    \/\/\/ @notice Get the manager of an address.\r\n    \/\/\/ @param _addr Address for which to return the manager.\r\n    \/\/\/ @return Address of the manager for a given address.\r\n    function getManager(address _addr) public view returns(address) {\r\n        \/\/ By default the manager of an address is the same address\r\n        if (managers[_addr] == address(0)) {\r\n            return _addr;\r\n        } else {\r\n            return managers[_addr];\r\n        }\r\n    }\r\n\r\n    \/\/\/ @notice Compute the keccak256 hash of an interface given its name.\r\n    \/\/\/ @param _interfaceName Name of the interface.\r\n    \/\/\/ @return The keccak256 hash of an interface name.\r\n    function interfaceHash(string calldata _interfaceName) external pure returns(bytes32) {\r\n        return keccak256(abi.encodePacked(_interfaceName));\r\n    }\r\n\r\n    \/* --- ERC165 Related Functions --- *\/\r\n    \/* --- Developed in collaboration with William Entriken. --- *\/\r\n\r\n    \/\/\/ @notice Updates the cache with whether the contract implements an ERC165 interface or not.\r\n    \/\/\/ @param _contract Address of the contract for which to update the cache.\r\n    \/\/\/ @param _interfaceId ERC165 interface for which to update the cache.\r\n    function updateERC165Cache(address _contract, bytes4 _interfaceId) external {\r\n        interfaces[_contract][_interfaceId] = implementsERC165InterfaceNoCache(\r\n            _contract, _interfaceId) ? _contract : address(0);\r\n        erc165Cached[_contract][_interfaceId] = true;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether a contract implements an ERC165 interface or not.\r\n    \/\/  If the result is not cached a direct lookup on the contract address is performed.\r\n    \/\/  If the result is not cached or the cached value is out-of-date, the cache MUST be updated manually by calling\r\n    \/\/  \'updateERC165Cache\' with the contract address.\r\n    \/\/\/ @param _contract Address of the contract to check.\r\n    \/\/\/ @param _interfaceId ERC165 interface to check.\r\n    \/\/\/ @return True if \'_contract\' implements \'_interfaceId\', false otherwise.\r\n    function implementsERC165Interface(address _contract, bytes4 _interfaceId) public view returns (bool) {\r\n        if (!erc165Cached[_contract][_interfaceId]) {\r\n            return implementsERC165InterfaceNoCache(_contract, _interfaceId);\r\n        }\r\n        return interfaces[_contract][_interfaceId] == _contract;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether a contract implements an ERC165 interface or not without using nor updating the cache.\r\n    \/\/\/ @param _contract Address of the contract to check.\r\n    \/\/\/ @param _interfaceId ERC165 interface to check.\r\n    \/\/\/ @return True if \'_contract\' implements \'_interfaceId\', false otherwise.\r\n    function implementsERC165InterfaceNoCache(address _contract, bytes4 _interfaceId) public view returns (bool) {\r\n        uint256 success;\r\n        uint256 result;\r\n\r\n        (success, result) = noThrowCall(_contract, ERC165ID);\r\n        if (success == 0 || result == 0) {\r\n            return false;\r\n        }\r\n\r\n        (success, result) = noThrowCall(_contract, INVALID_ID);\r\n        if (success == 0 || result != 0) {\r\n            return false;\r\n        }\r\n\r\n        (success, result) = noThrowCall(_contract, _interfaceId);\r\n        if (success == 1 && result == 1) {\r\n            return true;\r\n        }\r\n        return false;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether the hash is a ERC165 interface (ending with 28 zeroes) or not.\r\n    \/\/\/ @param _interfaceHash The hash to check.\r\n    \/\/\/ @return True if \'_interfaceHash\' is an ERC165 interface (ending with 28 zeroes), false otherwise.\r\n    function isERC165Interface(bytes32 _interfaceHash) internal pure returns (bool) {\r\n        return _interfaceHash & 0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF == 0;\r\n    }\r\n\r\n    \/\/\/ @dev Make a call on a contract without throwing if the function does not exist.\r\n    function noThrowCall(address _contract, bytes4 _interfaceId)\r\n        internal view returns (uint256 success, uint256 result)\r\n    {\r\n        bytes4 erc165ID = ERC165ID;\r\n\r\n        assembly {\r\n            let x := mload(0x40)               \/\/ Find empty storage location using \"free memory pointer\"\r\n            mstore(x, erc165ID)                \/\/ Place signature at beginning of empty storage\r\n            mstore(add(x, 0x04), _interfaceId) \/\/ Place first argument directly next to signature\r\n\r\n            success := staticcall(\r\n                30000,                         \/\/ 30k gas\r\n                _contract,                     \/\/ To addr\r\n                x,                             \/\/ Inputs are stored at location x\r\n                0x24,                          \/\/ Inputs are 36 (4 + 32) bytes long\r\n                x,                             \/\/ Store output over input (saves space)\r\n                0x20                           \/\/ Outputs are 32 bytes long\r\n            )\r\n\r\n            result := mload(x)                 \/\/ Load the result\r\n        }\r\n    }\r\n}',
      documentation: 'EIP-1820: Pseudo-introspection Registry Contract, This standard defines a universal registry smart contract where any address (contract or regular account) can register which interface it supports and which smart contract is responsible for its implementation.\n\n \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1820\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\/* ERC1820 Pseudo-introspection Registry Contract\r\n * This standard defines a universal registry smart contract where any address (contract or regular account) can\r\n * register which interface it supports and which smart contract is responsible for its implementation.\r\n *\r\n * Written in 2019 by Jordi Baylina and Jacques Dafflon\r\n *\r\n * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to\r\n * this software to the public domain worldwide. This software is distributed without any warranty.\r\n *\r\n * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see\r\n * <http:\/\/creativecommons.org\/publicdomain\/zero\/1.0\/>.\r\n *\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\r\n *    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2588\u2588\u2588\u2588\u2557\r\n *    \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2551\r\n *    \u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551      \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\r\n *    \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D\r\n *\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\r\n *    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551  \u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u255A\u2588\u2588\u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557  \u255A\u2588\u2588\u2554\u255D\r\n *    \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\r\n *    \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D\r\n *\r\n *\/\r\n\/\/ IV is value needed to have a vanity address starting with \'0x1820\'.\r\n\/\/ IV: 53759\r\n\r\n\/\/\/ @dev The interface a contract MUST implement if it is the implementer of\r\n\/\/\/ some (other) interface for any address other than itself.\r\ninterface ERC1820ImplementerInterface {\r\n    \/\/\/ @notice Indicates whether the contract implements the interface \'interfaceHash\' for the address \'addr\' or not.\r\n    \/\/\/ @param interfaceHash keccak256 hash of the name of the interface\r\n    \/\/\/ @param addr Address for which the contract will implement the interface\r\n    \/\/\/ @return ERC1820_ACCEPT_MAGIC only if the contract implements \'interfaceHash\' for the address \'addr\'.\r\n    function canImplementInterfaceForAddress(bytes32 interfaceHash, address addr) external view returns(bytes32);\r\n}\r\n\r\n\r\n\/\/\/ @title ERC1820 Pseudo-introspection Registry Contract\r\n\/\/\/ @author Jordi Baylina and Jacques Dafflon\r\n\/\/\/ @notice This contract is the official implementation of the ERC1820 Registry.\r\n\/\/\/ @notice For more details, see https:\/\/eips.ethereum.org\/EIPS\/eip-1820\r\ncontract ERC1820Registry {\r\n    \/\/\/@dev @notice ERC165 Invalid ID.\r\n    bytes4 constant internal INVALID_ID = 0xffffffff;\r\n    \/\/\/@dev @notice Method ID for the ERC165 supportsInterface method (= `bytes4(keccak256(\'supportsInterface(bytes4)\'))`).\r\n    bytes4 constant internal ERC165ID = 0x01ffc9a7;\r\n    \/\/\/@dev @notice Magic value which is returned if a contract implements an interface on behalf of some other address.\r\n    bytes32 constant internal ERC1820_ACCEPT_MAGIC = keccak256(abi.encodePacked(\"ERC1820_ACCEPT_MAGIC\"));\r\n\r\n    \/\/\/@dev @notice mapping from addresses and interface hashes to their implementers.\r\n    mapping(address => mapping(bytes32 => address)) internal interfaces;\r\n    \/\/\/@dev @notice mapping from addresses to their manager.\r\n    mapping(address => address) internal managers;\r\n    \/\/\/@dev @notice flag for each address and erc165 interface to indicate if it is cached.\r\n    mapping(address => mapping(bytes4 => bool)) internal erc165Cached;\r\n\r\n    \/\/\/ @notice Indicates a contract is the \'implementer\' of \'interfaceHash\' for \'addr\'.\r\n    event InterfaceImplementerSet(address indexed addr, bytes32 indexed interfaceHash, address indexed implementer);\r\n    \/\/\/ @notice Indicates \'newManager\' is the address of the new manager for \'addr\'.\r\n    event ManagerChanged(address indexed addr, address indexed newManager);\r\n\r\n    \/\/\/ @notice Query if an address implements an interface and through which contract.\r\n    \/\/\/ @param _addr Address being queried for the implementer of an interface.\r\n    \/\/\/ (If \'_addr\' is the zero address then \'msg.sender\' is assumed.)\r\n    \/\/\/ @param _interfaceHash Keccak256 hash of the name of the interface as a string.\r\n    \/\/\/ E.g., \'web3.utils.keccak256(\"ERC777TokensRecipient\")\' for the \'ERC777TokensRecipient\' interface.\r\n    \/\/\/ @return The address of the contract which implements the interface \'_interfaceHash\' for \'_addr\'\r\n    \/\/\/ or \'0\' if \'_addr\' did not register an implementer for this interface.\r\n    function getInterfaceImplementer(address _addr, bytes32 _interfaceHash) external view returns (address) {\r\n        address addr = _addr == address(0) ? msg.sender : _addr;\r\n        if (isERC165Interface(_interfaceHash)) {\r\n            bytes4 erc165InterfaceHash = bytes4(_interfaceHash);\r\n            return implementsERC165Interface(addr, erc165InterfaceHash) ? addr : address(0);\r\n        }\r\n        return interfaces[addr][_interfaceHash];\r\n    }\r\n\r\n    \/\/\/ @notice Sets the contract which implements a specific interface for an address.\r\n    \/\/\/ Only the manager defined for that address can set it.\r\n    \/\/\/ (Each address is the manager for itself until it sets a new manager.)\r\n    \/\/\/ @param _addr Address for which to set the interface.\r\n    \/\/\/ (If \'_addr\' is the zero address then \'msg.sender\' is assumed.)\r\n    \/\/\/ @param _interfaceHash Keccak256 hash of the name of the interface as a string.\r\n    \/\/\/ E.g., \'web3.utils.keccak256(\"ERC777TokensRecipient\")\' for the \'ERC777TokensRecipient\' interface.\r\n    \/\/\/ @param _implementer Contract address implementing \'_interfaceHash\' for \'_addr\'.\r\n    function setInterfaceImplementer(address _addr, bytes32 _interfaceHash, address _implementer) external {\r\n        address addr = _addr == address(0) ? msg.sender : _addr;\r\n        require(getManager(addr) == msg.sender, \"Not the manager\");\r\n\r\n        require(!isERC165Interface(_interfaceHash), \"Must not be an ERC165 hash\");\r\n        if (_implementer != address(0) && _implementer != msg.sender) {\r\n            require(\r\n                ERC1820ImplementerInterface(_implementer)\r\n                    .canImplementInterfaceForAddress(_interfaceHash, addr) == ERC1820_ACCEPT_MAGIC,\r\n                \"Does not implement the interface\"\r\n            );\r\n        }\r\n        interfaces[addr][_interfaceHash] = _implementer;\r\n        emit InterfaceImplementerSet(addr, _interfaceHash, _implementer);\r\n    }\r\n\r\n    \/\/\/ @notice Sets \'_newManager\' as manager for \'_addr\'.\r\n    \/\/\/ The new manager will be able to call \'setInterfaceImplementer\' for \'_addr\'.\r\n    \/\/\/ @param _addr Address for which to set the new manager.\r\n    \/\/\/ @param _newManager Address of the new manager for \'addr\'. (Pass \'0x0\' to reset the manager to \'_addr\'.)\r\n    function setManager(address _addr, address _newManager) external {\r\n        require(getManager(_addr) == msg.sender, \"Not the manager\");\r\n        managers[_addr] = _newManager == _addr ? address(0) : _newManager;\r\n        emit ManagerChanged(_addr, _newManager);\r\n    }\r\n\r\n    \/\/\/ @notice Get the manager of an address.\r\n    \/\/\/ @param _addr Address for which to return the manager.\r\n    \/\/\/ @return Address of the manager for a given address.\r\n    function getManager(address _addr) public view returns(address) {\r\n        \/\/ By default the manager of an address is the same address\r\n        if (managers[_addr] == address(0)) {\r\n            return _addr;\r\n        } else {\r\n            return managers[_addr];\r\n        }\r\n    }\r\n\r\n    \/\/\/ @notice Compute the keccak256 hash of an interface given its name.\r\n    \/\/\/ @param _interfaceName Name of the interface.\r\n    \/\/\/ @return The keccak256 hash of an interface name.\r\n    function interfaceHash(string calldata _interfaceName) external pure returns(bytes32) {\r\n        return keccak256(abi.encodePacked(_interfaceName));\r\n    }\r\n\r\n    \/* --- ERC165 Related Functions --- *\/\r\n    \/* --- Developed in collaboration with William Entriken. --- *\/\r\n\r\n    \/\/\/ @notice Updates the cache with whether the contract implements an ERC165 interface or not.\r\n    \/\/\/ @param _contract Address of the contract for which to update the cache.\r\n    \/\/\/ @param _interfaceId ERC165 interface for which to update the cache.\r\n    function updateERC165Cache(address _contract, bytes4 _interfaceId) external {\r\n        interfaces[_contract][_interfaceId] = implementsERC165InterfaceNoCache(\r\n            _contract, _interfaceId) ? _contract : address(0);\r\n        erc165Cached[_contract][_interfaceId] = true;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether a contract implements an ERC165 interface or not.\r\n    \/\/  If the result is not cached a direct lookup on the contract address is performed.\r\n    \/\/  If the result is not cached or the cached value is out-of-date, the cache MUST be updated manually by calling\r\n    \/\/  \'updateERC165Cache\' with the contract address.\r\n    \/\/\/ @param _contract Address of the contract to check.\r\n    \/\/\/ @param _interfaceId ERC165 interface to check.\r\n    \/\/\/ @return True if \'_contract\' implements \'_interfaceId\', false otherwise.\r\n    function implementsERC165Interface(address _contract, bytes4 _interfaceId) public view returns (bool) {\r\n        if (!erc165Cached[_contract][_interfaceId]) {\r\n            return implementsERC165InterfaceNoCache(_contract, _interfaceId);\r\n        }\r\n        return interfaces[_contract][_interfaceId] == _contract;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether a contract implements an ERC165 interface or not without using nor updating the cache.\r\n    \/\/\/ @param _contract Address of the contract to check.\r\n    \/\/\/ @param _interfaceId ERC165 interface to check.\r\n    \/\/\/ @return True if \'_contract\' implements \'_interfaceId\', false otherwise.\r\n    function implementsERC165InterfaceNoCache(address _contract, bytes4 _interfaceId) public view returns (bool) {\r\n        uint256 success;\r\n        uint256 result;\r\n\r\n        (success, result) = noThrowCall(_contract, ERC165ID);\r\n        if (success == 0 || result == 0) {\r\n            return false;\r\n        }\r\n\r\n        (success, result) = noThrowCall(_contract, INVALID_ID);\r\n        if (success == 0 || result != 0) {\r\n            return false;\r\n        }\r\n\r\n        (success, result) = noThrowCall(_contract, _interfaceId);\r\n        if (success == 1 && result == 1) {\r\n            return true;\r\n        }\r\n        return false;\r\n    }\r\n\r\n    \/\/\/ @notice Checks whether the hash is a ERC165 interface (ending with 28 zeroes) or not.\r\n    \/\/\/ @param _interfaceHash The hash to check.\r\n    \/\/\/ @return True if \'_interfaceHash\' is an ERC165 interface (ending with 28 zeroes), false otherwise.\r\n    function isERC165Interface(bytes32 _interfaceHash) internal pure returns (bool) {\r\n        return _interfaceHash & 0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF == 0;\r\n    }\r\n\r\n    \/\/\/ @dev Make a call on a contract without throwing if the function does not exist.\r\n    function noThrowCall(address _contract, bytes4 _interfaceId)\r\n        internal view returns (uint256 success, uint256 result)\r\n    {\r\n        bytes4 erc165ID = ERC165ID;\r\n\r\n        assembly {\r\n            let x := mload(0x40)               \/\/ Find empty storage location using \"free memory pointer\"\r\n            mstore(x, erc165ID)                \/\/ Place signature at beginning of empty storage\r\n            mstore(add(x, 0x04), _interfaceId) \/\/ Place first argument directly next to signature\r\n\r\n            success := staticcall(\r\n                30000,                         \/\/ 30k gas\r\n                _contract,                     \/\/ To addr\r\n                x,                             \/\/ Inputs are stored at location x\r\n                0x24,                          \/\/ Inputs are 36 (4 + 32) bytes long\r\n                x,                             \/\/ Store output over input (saves space)\r\n                0x20                           \/\/ Outputs are 32 bytes long\r\n            )\r\n\r\n            result := mload(x)                 \/\/ Load the result\r\n        }\r\n    }\r\n}',
      detail: 'generate ERC1820',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc173',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-173\r\n\/\/ https:\/\/github.com\/0xcert\/ethereum-erc721\/blob\/master\/src\/contracts\/ownership\/ownable.sol (this example)\r\n\/\/ https:\/\/github.com\/OpenZeppelin\/openzeppelin-contracts\/blob\/master\/contracts\/access\/Ownable.sol\r\n\/\/ https:\/\/github.com\/FriendlyUser\/solidity-smart-contracts\/\/blob\/v0.2.0\/contracts\/other\/CredVert\/Ownable.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/**\r\n * @dev The contract has an owner address, and provides basic authorization control which\r\n * simplifies the implementation of user permissions. This contract is based on the source code at:\r\n * https:\/\/github.com\/OpenZeppelin\/openzeppelin-solidity\/blob\/master\/contracts\/ownership\/Ownable.sol\r\n *\/\r\ncontract Ownable\r\n{\r\n\r\n  \/**\r\n   * @dev Error constants.\r\n   *\/\r\n  string public constant NOT_CURRENT_OWNER = \"018001\";\r\n  string public constant CANNOT_TRANSFER_TO_ZERO_ADDRESS = \"018002\";\r\n\r\n  \/**\r\n   * @dev Current owner address.\r\n   *\/\r\n  address public owner;\r\n\r\n  \/**\r\n   * @dev An event which is triggered when the owner is changed.\r\n   * @param previousOwner The address of the previous owner.\r\n   * @param newOwner The address of the new owner.\r\n   *\/\r\n  event OwnershipTransferred(\r\n    address indexed previousOwner,\r\n    address indexed newOwner\r\n  );\r\n\r\n  \/**\r\n   * @dev The constructor sets the original `owner` of the contract to the sender account.\r\n   *\/\r\n  constructor()\r\n    public\r\n  {\r\n    owner = msg.sender;\r\n  }\r\n\r\n  \/**\r\n   * @dev Throws if called by any account other than the owner.\r\n   *\/\r\n  modifier onlyOwner()\r\n  {\r\n    require(msg.sender == owner, NOT_CURRENT_OWNER);\r\n    _;\r\n  }\r\n\r\n  \/**\r\n   * @dev Allows the current owner to transfer control of the contract to a newOwner.\r\n   * @param _newOwner The address to transfer ownership to.\r\n   *\/\r\n  function transferOwnership(\r\n    address _newOwner\r\n  )\r\n    public\r\n    onlyOwner\r\n  {\r\n    require(_newOwner != address(0), CANNOT_TRANSFER_TO_ZERO_ADDRESS);\r\n    emit OwnershipTransferred(owner, _newOwner);\r\n    owner = _newOwner;\r\n  }\r\n\r\n}',
      documentation: 'Draft: EIP-173: Implementation example, Contract Ownership Standard, A standard interface for ownership of contracts.\n\n  \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-173\r\n\/\/ https:\/\/github.com\/0xcert\/ethereum-erc721\/blob\/master\/src\/contracts\/ownership\/ownable.sol (this example)\r\n\/\/ https:\/\/github.com\/OpenZeppelin\/openzeppelin-contracts\/blob\/master\/contracts\/access\/Ownable.sol\r\n\/\/ https:\/\/github.com\/FriendlyUser\/solidity-smart-contracts\/\/blob\/v0.2.0\/contracts\/other\/CredVert\/Ownable.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/**\r\n * @dev The contract has an owner address, and provides basic authorization control which\r\n * simplifies the implementation of user permissions. This contract is based on the source code at:\r\n * https:\/\/github.com\/OpenZeppelin\/openzeppelin-solidity\/blob\/master\/contracts\/ownership\/Ownable.sol\r\n *\/\r\ncontract Ownable\r\n{\r\n\r\n  \/**\r\n   * @dev Error constants.\r\n   *\/\r\n  string public constant NOT_CURRENT_OWNER = \"018001\";\r\n  string public constant CANNOT_TRANSFER_TO_ZERO_ADDRESS = \"018002\";\r\n\r\n  \/**\r\n   * @dev Current owner address.\r\n   *\/\r\n  address public owner;\r\n\r\n  \/**\r\n   * @dev An event which is triggered when the owner is changed.\r\n   * @param previousOwner The address of the previous owner.\r\n   * @param newOwner The address of the new owner.\r\n   *\/\r\n  event OwnershipTransferred(\r\n    address indexed previousOwner,\r\n    address indexed newOwner\r\n  );\r\n\r\n  \/**\r\n   * @dev The constructor sets the original `owner` of the contract to the sender account.\r\n   *\/\r\n  constructor()\r\n    public\r\n  {\r\n    owner = msg.sender;\r\n  }\r\n\r\n  \/**\r\n   * @dev Throws if called by any account other than the owner.\r\n   *\/\r\n  modifier onlyOwner()\r\n  {\r\n    require(msg.sender == owner, NOT_CURRENT_OWNER);\r\n    _;\r\n  }\r\n\r\n  \/**\r\n   * @dev Allows the current owner to transfer control of the contract to a newOwner.\r\n   * @param _newOwner The address to transfer ownership to.\r\n   *\/\r\n  function transferOwnership(\r\n    address _newOwner\r\n  )\r\n    public\r\n    onlyOwner\r\n  {\r\n    require(_newOwner != address(0), CANNOT_TRANSFER_TO_ZERO_ADDRESS);\r\n    emit OwnershipTransferred(owner, _newOwner);\r\n    owner = _newOwner;\r\n  }\r\n\r\n}',
      detail: 'generate ERC173-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc173i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-173\r\n\/\/ https:\/\/github.com\/0xcert\/ethereum-erc721\/blob\/master\/src\/contracts\/ownership\/ownable.sol (this example)\r\n\/\/ https:\/\/github.com\/OpenZeppelin\/openzeppelin-contracts\/blob\/master\/contracts\/access\/Ownable.sol\r\n\/\/ https:\/\/github.com\/FriendlyUser\/solidity-smart-contracts\/\/blob\/v0.2.0\/contracts\/other\/CredVert\/Ownable.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/\/\/ @title ERC-173 Contract Ownership Standard\r\n\/\/\/ @dev See https:\/\/github.com\/ethereum\/EIPs\/blob\/master\/EIPS\/eip-173.md\r\n\/\/\/  Note: the ERC-165 identifier for this interface is 0x7f5828d0\r\ninterface ERC173 \/* is ERC165 *\/ {\r\n    \/\/\/ @dev This emits when ownership of a contract changes\r\n    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);\r\n\r\n    \/\/\/ @notice Get the address of the owner\r\n    \/\/\/ @return The address of the owner.\r\n    function owner() external view returns (address);\r\n    \/\/\/ @notice Set the address of the new owner of the contract\r\n    \/\/\/ @dev Set _newOwner to address(0) to renounce any ownership.\r\n    \/\/\/ @param _newOwner The address of the new owner of the contract\r\n    function transferOwnership(address _newOwner) external;\r\n}\r\n\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      documentation: 'Draft: EIP-173 Interface for Contract Ownership Standard, A standard interface for ownership of contracts.\n\n  \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-173\r\n\/\/ https:\/\/github.com\/0xcert\/ethereum-erc721\/blob\/master\/src\/contracts\/ownership\/ownable.sol (this example)\r\n\/\/ https:\/\/github.com\/OpenZeppelin\/openzeppelin-contracts\/blob\/master\/contracts\/access\/Ownable.sol\r\n\/\/ https:\/\/github.com\/FriendlyUser\/solidity-smart-contracts\/\/blob\/v0.2.0\/contracts\/other\/CredVert\/Ownable.sol\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/\/\/ @title ERC-173 Contract Ownership Standard\r\n\/\/\/ @dev See https:\/\/github.com\/ethereum\/EIPs\/blob\/master\/EIPS\/eip-173.md\r\n\/\/\/  Note: the ERC-165 identifier for this interface is 0x7f5828d0\r\ninterface ERC173 \/* is ERC165 *\/ {\r\n    \/\/\/ @dev This emits when ownership of a contract changes\r\n    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);\r\n\r\n    \/\/\/ @notice Get the address of the owner\r\n    \/\/\/ @return The address of the owner.\r\n    function owner() external view returns (address);\r\n    \/\/\/ @notice Set the address of the new owner of the contract\r\n    \/\/\/ @dev Set _newOwner to address(0) to renounce any ownership.\r\n    \/\/\/ @param _newOwner The address of the new owner of the contract\r\n    function transferOwnership(address _newOwner) external;\r\n}\r\n\r\ninterface ERC165 {\r\n    \/\/\/ @notice Query if a contract implements an interface\r\n    \/\/\/ @param interfaceID The interface identifier, as specified in ERC-165\r\n    \/\/\/ @dev Interface identification is specified in ERC-165. This function\r\n    \/\/\/  uses less than 30,000 gas.\r\n    \/\/\/ @return `true` if the contract implements `interfaceID` and\r\n    \/\/\/  `interfaceID` is not 0xffffffff, `false` otherwise\r\n    function supportsInterface(bytes4 interfaceID) external view returns (bool);\r\n}',
      detail: 'generate ERC173i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc725i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-725\r\n\/\/ https:\/\/github.com\/ERC725Alliance\/ERC725 (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/*\r\nThe following describes standard functions for a unique identifiable proxy account to be used by humans, groups, organisations, objects and machines.\r\nThe proxy has 2 abilities: (1) it can execute arbitrary contract calls, and (2) it can hold arbitrary data through a generic key\/value store.\r\nOne of these keys should hold the owner of the contract. The owner may be an address or a key manager contract for more complex management logic.\r\nMost importantly, this contract should be the reference point for a long-lasting identifiable profiles.\r\n*\/\r\ninterface ERC725 {\r\n    event DataChanged(bytes32 indexed key, bytes32 indexed value);\r\n    event OwnerChanged(address indexed ownerAddress);\r\n    event ContractCreated(address indexed contractAddress);\r\n\r\n    \/\/ address public owner;\r\n\r\n    function changeOwner(address _owner) external;\r\n    function getData(bytes32 _key) external view returns (bytes32 _value);\r\n    function setData(bytes32 _key, bytes32 _value) external;\r\n    function execute(uint256 _operationType, address _to, uint256 _value, bytes calldata _data) external;\r\n}',
      documentation: 'Draft: EIP-725: Proxy Account. Standard functions for a unique identifiable proxy account to be used by humans, groups, organisations, objects and machines\n\n  \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-725\r\n\/\/ https:\/\/github.com\/ERC725Alliance\/ERC725 (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\n\/*\r\nThe following describes standard functions for a unique identifiable proxy account to be used by humans, groups, organisations, objects and machines.\r\nThe proxy has 2 abilities: (1) it can execute arbitrary contract calls, and (2) it can hold arbitrary data through a generic key\/value store.\r\nOne of these keys should hold the owner of the contract. The owner may be an address or a key manager contract for more complex management logic.\r\nMost importantly, this contract should be the reference point for a long-lasting identifiable profiles.\r\n*\/\r\ninterface ERC725 {\r\n    event DataChanged(bytes32 indexed key, bytes32 indexed value);\r\n    event OwnerChanged(address indexed ownerAddress);\r\n    event ContractCreated(address indexed contractAddress);\r\n\r\n    \/\/ address public owner;\r\n\r\n    function changeOwner(address _owner) external;\r\n    function getData(bytes32 _key) external view returns (bytes32 _value);\r\n    function setData(bytes32 _key, bytes32 _value) external;\r\n    function execute(uint256 _operationType, address _to, uint256 _value, bytes calldata _data) external;\r\n}',
      detail: 'generate ERC725i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc1996i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1996\r\n\/\/ https:\/\/github.com\/IoBuilders\/holdable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows tokens to be put on hold.\r\nThis guarantees a future transfer and makes the held tokens unavailable for transfer in the mean time.\r\nHolds are similar to escrows in that are firm and lead to final settlement.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IHoldable \/* is ERC-20 *\/ {\r\n    enum HoldStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        Executed,\r\n        ReleasedByNotary,\r\n        ReleasedByPayee,\r\n        ReleasedOnExpiration\r\n    }\r\n\r\n    function hold(string calldata operationId, address to, address notary, uint256 value, uint256 timeToExpiration) external returns (bool);\r\n    function holdFrom(string calldata operationId, address from, address to, address notary,\r\n                                                     uint256 value, uint256 timeToExpiration) external returns (bool);\r\n    function releaseHold(string calldata operationId) external returns (bool);\r\n    function executeHold(string calldata operationId, uint256 value) external returns (bool);\r\n    function renewHold(string calldata operationId, uint256 timeToExpiration) external returns (bool);\r\n    function retrieveHoldData(string calldata operationId) external view returns (address from, address to, address notary,\r\n                                                                                uint256 value, uint256 expiration, HoldStatusCode status);\r\n\r\n    function balanceOnHold(address account) external view returns (uint256);\r\n    function netBalanceOf(address account) external view returns (uint256);\r\n    function totalSupplyOnHold() external view returns (uint256);\r\n\r\n    function authorizeHoldOperator(address operator) external returns (bool);\r\n    function revokeHoldOperator(address operator) external returns (bool);\r\n    function isHoldOperatorFor(address operator, address from) external view returns (bool);\r\n\r\n    event HoldCreated(address indexed holdIssuer, string  operationId, address from,\r\n                                address to, address indexed notary, uint256 value, uint256 expiration);\r\n    event HoldExecuted(address indexed holdIssuer, string operationId, address indexed notary, uint256 heldValue, uint256 transferredValue);\r\n    event HoldReleased(address indexed holdIssuer, string operationId, HoldStatusCode status);\r\n    event HoldRenewed(address indexed holdIssuer, string operationId, uint256 oldExpiration, uint256 newExpiration);\r\n    event AuthorizedHoldOperator(address indexed operator, address indexed account);\r\n    event RevokedHoldOperator(address indexed operator, address indexed account);\r\n}',
      documentation: 'Draft: EIP-1996: Holdable Token, An extension to the ERC-20 standard token that allows tokens to be put on hold. This guarantees a future transfer and makes the held tokens unavailable for transfer in the mean time. Holds are similar to escrows in that are firm and lead to final settlement.\n\n   \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-1996\r\n\/\/ https:\/\/github.com\/IoBuilders\/holdable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows tokens to be put on hold.\r\nThis guarantees a future transfer and makes the held tokens unavailable for transfer in the mean time.\r\nHolds are similar to escrows in that are firm and lead to final settlement.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IHoldable \/* is ERC-20 *\/ {\r\n    enum HoldStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        Executed,\r\n        ReleasedByNotary,\r\n        ReleasedByPayee,\r\n        ReleasedOnExpiration\r\n    }\r\n\r\n    function hold(string calldata operationId, address to, address notary, uint256 value, uint256 timeToExpiration) external returns (bool);\r\n    function holdFrom(string calldata operationId, address from, address to, address notary,\r\n                                                     uint256 value, uint256 timeToExpiration) external returns (bool);\r\n    function releaseHold(string calldata operationId) external returns (bool);\r\n    function executeHold(string calldata operationId, uint256 value) external returns (bool);\r\n    function renewHold(string calldata operationId, uint256 timeToExpiration) external returns (bool);\r\n    function retrieveHoldData(string calldata operationId) external view returns (address from, address to, address notary,\r\n                                                                                uint256 value, uint256 expiration, HoldStatusCode status);\r\n\r\n    function balanceOnHold(address account) external view returns (uint256);\r\n    function netBalanceOf(address account) external view returns (uint256);\r\n    function totalSupplyOnHold() external view returns (uint256);\r\n\r\n    function authorizeHoldOperator(address operator) external returns (bool);\r\n    function revokeHoldOperator(address operator) external returns (bool);\r\n    function isHoldOperatorFor(address operator, address from) external view returns (bool);\r\n\r\n    event HoldCreated(address indexed holdIssuer, string  operationId, address from,\r\n                                address to, address indexed notary, uint256 value, uint256 expiration);\r\n    event HoldExecuted(address indexed holdIssuer, string operationId, address indexed notary, uint256 heldValue, uint256 transferredValue);\r\n    event HoldReleased(address indexed holdIssuer, string operationId, HoldStatusCode status);\r\n    event HoldRenewed(address indexed holdIssuer, string operationId, uint256 oldExpiration, uint256 newExpiration);\r\n    event AuthorizedHoldOperator(address indexed operator, address indexed account);\r\n    event RevokedHoldOperator(address indexed operator, address indexed account);\r\n}',
      detail: 'generate ERC1996i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc2018i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2018\r\n\/\/ https:\/\/github.com\/IoBuilders\/clearable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nIn banking and finance, clearing denotes all activities from the time a commitment is made for a transaction until it is settled\r\n\r\nThe clearing process turns the promise of a transfer into the actual movement of money from one account to another.\r\nA clearing agent decides if the transfer can be executed or not.\r\nThe amount which should be transferred is not deducted from the balance of the payer, but neither is it available for another transfer and therefore ensures,\r\nthat the execution of the transfer will be successful when it is executed.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface ClearableToken \/* is ERC-1996 *\/ {\r\n    enum ClearableTransferStatusCode { Nonexistent, Ordered, InProcess, Executed, Rejected, Cancelled }\r\n\r\n    function orderTransfer(string calldata operationId, address to, uint256 value) external returns (bool);\r\n    function orderTransferFrom(string calldata operationId, address from, address to, uint256 value) external returns (bool);\r\n    function cancelTransfer(string calldata operationId) external returns (bool);\r\n    function processClearableTransfer(string calldata operationId) external returns (bool);\r\n    function executeClearableTransfer(string calldata operationId) external returns (bool);\r\n    function rejectClearableTransfer(string calldata operationId, string calldata reason) external returns (bool);\r\n    function retrieveClearableTransferData(string calldata operationId) external view returns (address from, address to,\r\n                                                uint256 value, ClearableTransferStatusCode status);\r\n\r\n    function authorizeClearableTransferOperator(address operator) external returns (bool);\r\n    function revokeClearableTransferOperator(address operator) external returns (bool);\r\n    function isClearableTransferOperatorFor(address operator, address from) external view returns (bool);\r\n\r\n    event ClearableTransferOrdered(address indexed orderer, string operationId, address indexed from, address indexed to, uint256 value);\r\n    event ClearableTransferInProcess(address indexed orderer, string operationId);\r\n    event ClearableTransferExecuted(address indexed orderer, string operationId);\r\n    event ClearableTransferRejected(address indexed orderer, string operationId, string reason);\r\n    event ClearableTransferCancelled(address indexed orderer, string operationId);\r\n    event AuthorizedClearableTransferOperator(address indexed operator, address indexed account);\r\n    event RevokedClearableTransferOperator(address indexed operator, address indexed account);\r\n}',
      documentation: 'Draft: EIP-2018: The clearing process turns the promise of a transfer into the actual movement of money from one account to another. A clearing agent decides if the transfer can be executed or not. The amount which should be transferred is not deducted from the balance of the payer, but neither is it available for another transfer and therefore ensures, that the execution of the transfer will be successful when it is executed.\n\n   \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2018\r\n\/\/ https:\/\/github.com\/IoBuilders\/clearable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nIn banking and finance, clearing denotes all activities from the time a commitment is made for a transaction until it is settled\r\n\r\nThe clearing process turns the promise of a transfer into the actual movement of money from one account to another.\r\nA clearing agent decides if the transfer can be executed or not.\r\nThe amount which should be transferred is not deducted from the balance of the payer, but neither is it available for another transfer and therefore ensures,\r\nthat the execution of the transfer will be successful when it is executed.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface ClearableToken \/* is ERC-1996 *\/ {\r\n    enum ClearableTransferStatusCode { Nonexistent, Ordered, InProcess, Executed, Rejected, Cancelled }\r\n\r\n    function orderTransfer(string calldata operationId, address to, uint256 value) external returns (bool);\r\n    function orderTransferFrom(string calldata operationId, address from, address to, uint256 value) external returns (bool);\r\n    function cancelTransfer(string calldata operationId) external returns (bool);\r\n    function processClearableTransfer(string calldata operationId) external returns (bool);\r\n    function executeClearableTransfer(string calldata operationId) external returns (bool);\r\n    function rejectClearableTransfer(string calldata operationId, string calldata reason) external returns (bool);\r\n    function retrieveClearableTransferData(string calldata operationId) external view returns (address from, address to,\r\n                                                uint256 value, ClearableTransferStatusCode status);\r\n\r\n    function authorizeClearableTransferOperator(address operator) external returns (bool);\r\n    function revokeClearableTransferOperator(address operator) external returns (bool);\r\n    function isClearableTransferOperatorFor(address operator, address from) external view returns (bool);\r\n\r\n    event ClearableTransferOrdered(address indexed orderer, string operationId, address indexed from, address indexed to, uint256 value);\r\n    event ClearableTransferInProcess(address indexed orderer, string operationId);\r\n    event ClearableTransferExecuted(address indexed orderer, string operationId);\r\n    event ClearableTransferRejected(address indexed orderer, string operationId, string reason);\r\n    event ClearableTransferCancelled(address indexed orderer, string operationId);\r\n    event AuthorizedClearableTransferOperator(address indexed operator, address indexed account);\r\n    event RevokedClearableTransferOperator(address indexed operator, address indexed account);\r\n}',
      detail: 'generate ERC2018i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc2019i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2019\r\n\/\/ https:\/\/github.com\/IoBuilders\/fundable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows Token wallet owners to request a wallet to be funded, by calling the smart contract and attaching a fund instruction string.\r\n\r\nToken wallet owners (or approved addresses) can order tokenization requests through blockchain.\r\nThis is done by calling the orderFund or orderFundFrom methods,\r\nwhich initiate the workflow for the token contract operator to either honor or reject the fund request.\r\nIn this case, fund instructions are provided when submitting the request,\r\nwhich are used by the operator to determine the source of the funds to be debited in order to do fund the token wallet (through minting).\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IFundable \/* is ERC-20 *\/ {\r\n    enum FundStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        InProcess,\r\n        Executed,\r\n        Rejected,\r\n        Cancelled\r\n    }\r\n    function authorizeFundOperator(address orderer) external returns (bool);\r\n    function revokeFundOperator(address orderer) external returns (bool) ;\r\n    function orderFund(string calldata operationId, uint256 value, string calldata instructions) external returns (bool);\r\n    function orderFundFrom(string calldata operationId, address walletToFund, uint256 value,\r\n                                        string calldata instructions) external returns (bool);\r\n    function cancelFund(string calldata operationId) external returns (bool);\r\n    function processFund(string calldata operationId) external returns (bool);\r\n    function executeFund(string calldata operationId) external returns (bool);\r\n    function rejectFund(string calldata operationId, string calldata reason) external returns (bool);\r\n\r\n    function isFundOperatorFor(address walletToFund, address orderer) external view returns (bool);\r\n    function retrieveFundData(address orderer, string calldata operationId) external view returns (address walletToFund,\r\n    uint256 value, string memory instructions, FundStatusCode status);\r\n\r\n    event FundOrdered(address indexed orderer, string indexed operationId, address indexed , uint256 value, string instructions);\r\n    event FundInProcess(address indexed orderer, string indexed operationId);\r\n    event FundExecuted(address indexed orderer, string indexed operationId);\r\n    event FundRejected(address indexed orderer, string indexed operationId, string reason);\r\n    event FundCancelled(address indexed orderer, string indexed operationId);\r\n    event FundOperatorAuthorized(address indexed walletToFund, address indexed orderer);\r\n    event FundOperatorRevoked(address indexed walletToFund, address indexed orderer);\r\n}',
      documentation: 'Draft: EIP-2019: Fundable Token. An extension to the ERC-20 standard token that allows Token wallet owners to request a wallet to be funded, by calling the smart contract and attaching a fund instruction string.\n\n  \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2019\r\n\/\/ https:\/\/github.com\/IoBuilders\/fundable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows Token wallet owners to request a wallet to be funded, by calling the smart contract and attaching a fund instruction string.\r\n\r\nToken wallet owners (or approved addresses) can order tokenization requests through blockchain.\r\nThis is done by calling the orderFund or orderFundFrom methods,\r\nwhich initiate the workflow for the token contract operator to either honor or reject the fund request.\r\nIn this case, fund instructions are provided when submitting the request,\r\nwhich are used by the operator to determine the source of the funds to be debited in order to do fund the token wallet (through minting).\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IFundable \/* is ERC-20 *\/ {\r\n    enum FundStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        InProcess,\r\n        Executed,\r\n        Rejected,\r\n        Cancelled\r\n    }\r\n    function authorizeFundOperator(address orderer) external returns (bool);\r\n    function revokeFundOperator(address orderer) external returns (bool) ;\r\n    function orderFund(string calldata operationId, uint256 value, string calldata instructions) external returns (bool);\r\n    function orderFundFrom(string calldata operationId, address walletToFund, uint256 value,\r\n                                        string calldata instructions) external returns (bool);\r\n    function cancelFund(string calldata operationId) external returns (bool);\r\n    function processFund(string calldata operationId) external returns (bool);\r\n    function executeFund(string calldata operationId) external returns (bool);\r\n    function rejectFund(string calldata operationId, string calldata reason) external returns (bool);\r\n\r\n    function isFundOperatorFor(address walletToFund, address orderer) external view returns (bool);\r\n    function retrieveFundData(address orderer, string calldata operationId) external view returns (address walletToFund,\r\n    uint256 value, string memory instructions, FundStatusCode status);\r\n\r\n    event FundOrdered(address indexed orderer, string indexed operationId, address indexed , uint256 value, string instructions);\r\n    event FundInProcess(address indexed orderer, string indexed operationId);\r\n    event FundExecuted(address indexed orderer, string indexed operationId);\r\n    event FundRejected(address indexed orderer, string indexed operationId, string reason);\r\n    event FundCancelled(address indexed orderer, string indexed operationId);\r\n    event FundOperatorAuthorized(address indexed walletToFund, address indexed orderer);\r\n    event FundOperatorRevoked(address indexed walletToFund, address indexed orderer);\r\n}',
      detail: 'generate ERC2019i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc2020i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2020\r\n\/\/ https:\/\/github.com\/IoBuilders\/em-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nThe E-Money Standard Token aims to enable the issuance of regulated electronic money on blockchain networks, and its practical usage in real financial applications.\r\n\r\nFinancial institutions work today with electronic systems,\r\nwhich hold account balances in databases on core banking systems.\r\nIn order for an institution to be allowed to maintain records of client balances segregated and available for clients,\r\nsuch institution must be regulated under a known legal framework and must possess a license to do so.\r\nMaintaining a license under regulatory supervision entails ensuring compliance (i.e. performing KYC on all clients and ensuring good AML practices before allowing transactions)\r\nand demonstrating technical and operational solvency through periodic audits,\r\nso clients depositing funds with the institution can rest assured that their money is safe.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface EMoneyToken \/* is ERC-1996, ERC-2018, ERC-2019, ERC-2021 *\/ {\r\n    function currency() external view returns (string memory);\r\n    function version() external pure returns (string memory);\r\n    function availableFunds(address account) external view returns (uint256);\r\n    function checkTransferAllowed(address from, address to, uint256 value) external view returns (byte status);\r\n    function checkApproveAllowed(address from, address spender, uint256 value) external view returns (byte status);\r\n    function checkHoldAllowed(address from, address to, address notary, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeHoldOperatorAllowed(address operator, address from) external view returns (byte status);\r\n    function checkOrderTransferAllowed(address from, address to, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeClearableTransferOperatorAllowed(address operator, address from) external view returns (byte status);\r\n    function checkOrderFundAllowed(address to, address operator, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeFundOperatorAllowed(address operator, address to) external view returns (byte status);\r\n    function checkOrderPayoutAllowed(address from, address operator, uint256 value) external view returns (byte status);\r\n    function checkAuthorizePayoutOperatorAllowed(address operator, address from) external view returns (byte status);\r\n}',
      documentation: 'Draft: EIP-2020: E-Money Standard Token. The E-Money Standard Token aims to enable the issuance of regulated electronic money on blockchain networks, and its practical usage in real financial applications.\n\n  \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2020\r\n\/\/ https:\/\/github.com\/IoBuilders\/em-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nThe E-Money Standard Token aims to enable the issuance of regulated electronic money on blockchain networks, and its practical usage in real financial applications.\r\n\r\nFinancial institutions work today with electronic systems,\r\nwhich hold account balances in databases on core banking systems.\r\nIn order for an institution to be allowed to maintain records of client balances segregated and available for clients,\r\nsuch institution must be regulated under a known legal framework and must possess a license to do so.\r\nMaintaining a license under regulatory supervision entails ensuring compliance (i.e. performing KYC on all clients and ensuring good AML practices before allowing transactions)\r\nand demonstrating technical and operational solvency through periodic audits,\r\nso clients depositing funds with the institution can rest assured that their money is safe.\r\n*\/\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface EMoneyToken \/* is ERC-1996, ERC-2018, ERC-2019, ERC-2021 *\/ {\r\n    function currency() external view returns (string memory);\r\n    function version() external pure returns (string memory);\r\n    function availableFunds(address account) external view returns (uint256);\r\n    function checkTransferAllowed(address from, address to, uint256 value) external view returns (byte status);\r\n    function checkApproveAllowed(address from, address spender, uint256 value) external view returns (byte status);\r\n    function checkHoldAllowed(address from, address to, address notary, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeHoldOperatorAllowed(address operator, address from) external view returns (byte status);\r\n    function checkOrderTransferAllowed(address from, address to, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeClearableTransferOperatorAllowed(address operator, address from) external view returns (byte status);\r\n    function checkOrderFundAllowed(address to, address operator, uint256 value) external view returns (byte status);\r\n    function checkAuthorizeFundOperatorAllowed(address operator, address to) external view returns (byte status);\r\n    function checkOrderPayoutAllowed(address from, address operator, uint256 value) external view returns (byte status);\r\n    function checkAuthorizePayoutOperatorAllowed(address operator, address from) external view returns (byte status);\r\n}',
      detail: 'generate ERC2020i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'erc2021i',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '\/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2021\r\n\/\/ https:\/\/github.com\/IoBuilders\/payoutable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows Token wallet owners to request payout from their wallet,\r\nby calling the smart contract and attaching a payout instruction string.\r\n\r\nToken wallet owners (or approved addresses) can order payout requests through blockchain.\r\nThis is done by calling the orderPayoutFrom or orderPayoutFrom methods,\r\nwhich initiate the workflow for the token contract operator to either honor or reject the payout request.\r\nIn this case, payout instructions are provided when submitting the request, which are used by the operator to determine the destination of the funds.\r\n\r\nIn general, it is not advisable to place explicit routing instructions for the payouts on a verbatim basis on the blockchain,\r\nand it is advised to use a private communication alternatives, such as private channels, encrypted storage or similar,\r\nto do so (external to the blockchain ledger). Another (less desirable) possibility is to place these instructions on the instructions field in encrypted form.\r\n*\/\r\n\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IPayoutable \/* is ERC-20 *\/ {\r\n    enum PayoutStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        InProcess,\r\n        FundsInSuspense,\r\n        Executed,\r\n        Rejected,\r\n        Cancelled\r\n    }\r\n    function authorizePayoutOperator(address orderer) external returns (bool);\r\n    function revokePayoutOperator(address orderer) external returns (bool);\r\n    function orderPayout(string calldata operationId, uint256 value, string calldata instructions) external returns (bool);\r\n    function orderPayoutFrom(string calldata operationId, address walletToBePaidOut, uint256 value, string calldata instructions)\r\n                                                                                                                external returns (bool);\r\n    function cancelPayout(string calldata operationId) external returns (bool);\r\n    function processPayout(string calldata operationId) external returns (bool);\r\n    function putFundsInSuspenseInPayout(string calldata operationId) external returns (bool);\r\n    function executePayout(string calldata operationId) external returns (bool);\r\n    function rejectPayout(string calldata operationId, string calldata reason) external returns (bool);\r\n\r\n    function isPayoutOperatorFor(address walletToDebit, address orderer) external view returns (bool);\r\n    function retrievePayoutData(string calldata operationId) external view\r\n                    returns (address walletToDebit, uint256 value, string memory instructions, PayoutStatusCode status);\r\n\r\n    event PayoutOrdered(address indexed orderer, string indexed operationId, address indexed walletToDebit, uint256 value, string instructions);\r\n    event PayoutInProcess(address indexed orderer, string indexed operationId);\r\n    event PayoutFundsInSuspense(address indexed orderer, string indexed operationId);\r\n    event PayoutExecuted(address indexed orderer, string indexed operationId);\r\n    event PayoutRejected(address indexed orderer, string indexed operationId, string reason);\r\n    event PayoutCancelled(address indexed orderer, string indexed operationId);\r\n    event PayoutOperatorAuthorized(address indexed walletToBePaidOut, address indexed orderer);\r\n    event PayoutOperatorRevoked(address indexed walletToBePaidOut, address indexed orderer);\r\n}',
      documentation: 'Draft: EIP-2021: Payoutable Token: An extension to the ERC-20 standard token that allows Token wallet owners to request payout from their wallet, by calling the smart contract and attaching a payout instruction string. \/\/ https:\/\/eips.ethereum.org\/EIPS\/eip-2021\r\n\/\/ https:\/\/github.com\/IoBuilders\/payoutable-token (example)\r\n\/\/ SPDX-License-Identifier: MIT\r\n\/*\r\nAn extension to the ERC-20 standard token that allows Token wallet owners to request payout from their wallet,\r\nby calling the smart contract and attaching a payout instruction string.\r\n\r\nToken wallet owners (or approved addresses) can order payout requests through blockchain.\r\nThis is done by calling the orderPayoutFrom or orderPayoutFrom methods,\r\nwhich initiate the workflow for the token contract operator to either honor or reject the payout request.\r\nIn this case, payout instructions are provided when submitting the request, which are used by the operator to determine the destination of the funds.\r\n\r\nIn general, it is not advisable to place explicit routing instructions for the payouts on a verbatim basis on the blockchain,\r\nand it is advised to use a private communication alternatives, such as private channels, encrypted storage or similar,\r\nto do so (external to the blockchain ledger). Another (less desirable) possibility is to place these instructions on the instructions field in encrypted form.\r\n*\/\r\n\r\npragma solidity >=0.5.0 <0.9.0;\r\n\r\ninterface IPayoutable \/* is ERC-20 *\/ {\r\n    enum PayoutStatusCode {\r\n        Nonexistent,\r\n        Ordered,\r\n        InProcess,\r\n        FundsInSuspense,\r\n        Executed,\r\n        Rejected,\r\n        Cancelled\r\n    }\r\n    function authorizePayoutOperator(address orderer) external returns (bool);\r\n    function revokePayoutOperator(address orderer) external returns (bool);\r\n    function orderPayout(string calldata operationId, uint256 value, string calldata instructions) external returns (bool);\r\n    function orderPayoutFrom(string calldata operationId, address walletToBePaidOut, uint256 value, string calldata instructions)\r\n                                                                                                                external returns (bool);\r\n    function cancelPayout(string calldata operationId) external returns (bool);\r\n    function processPayout(string calldata operationId) external returns (bool);\r\n    function putFundsInSuspenseInPayout(string calldata operationId) external returns (bool);\r\n    function executePayout(string calldata operationId) external returns (bool);\r\n    function rejectPayout(string calldata operationId, string calldata reason) external returns (bool);\r\n\r\n    function isPayoutOperatorFor(address walletToDebit, address orderer) external view returns (bool);\r\n    function retrievePayoutData(string calldata operationId) external view\r\n                    returns (address walletToDebit, uint256 value, string memory instructions, PayoutStatusCode status);\r\n\r\n    event PayoutOrdered(address indexed orderer, string indexed operationId, address indexed walletToDebit, uint256 value, string instructions);\r\n    event PayoutInProcess(address indexed orderer, string indexed operationId);\r\n    event PayoutFundsInSuspense(address indexed orderer, string indexed operationId);\r\n    event PayoutExecuted(address indexed orderer, string indexed operationId);\r\n    event PayoutRejected(address indexed orderer, string indexed operationId, string reason);\r\n    event PayoutCancelled(address indexed orderer, string indexed operationId);\r\n    event PayoutOperatorAuthorized(address indexed walletToBePaidOut, address indexed orderer);\r\n    event PayoutOperatorRevoked(address indexed walletToBePaidOut, address indexed orderer);\r\n}',
      detail: 'generate ERC2021i-draft',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    }
    /* eslint-enable */
  ]
}

export function getTxCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: '(uint): gas price of the transaction',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'gas',
      label: 'gas',
      range
    },
    {
      detail: '(address): sender of the transaction (full call chain)',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'origin',
      label: 'origin',
      range
    },
  ];
}

export function getMsgCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: '(bytes): complete calldata',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'data',
      label: 'data',
      range
    },
    {
      detail: '(uint): remaining gas DEPRECATED in 0.4.21 use gasleft()',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'gas',
      label: 'gas',
      range
    },
    {
      detail: '(address): sender of the message (current call)',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'sender',
      label: 'sender',
      range
    },
    {
      detail: '(bytes4): first four bytes of the calldata (i.e. export function identifier)',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'sig',
      label: 'sig',
      range
    },
    {
      detail: '(uint): number of wei sent with the message',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: 'value',
      label: 'value',
      range
    },
  ];
}

export function getAbiCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: 'encode(..) returns (bytes): ABI-encodes the given arguments',
      insertText: 'encode(${1:arg});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'encode',
      range
    },
    {
      detail: 'encodeCall(function functionPointer, (...)) returns (bytes memory) ABI-encodes a call to functionPointer with the arguments found in the tuple',
      insertText: 'encode(${1:arg});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'encodecall',
      range
    },
    {
      detail: 'encodePacked(..) returns (bytes): Performs packed encoding of the given arguments',
      insertText: 'encodePacked(${1:arg});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'encodePacked',
      range
    },
    {
      detail: 'encodeWithSelector(bytes4,...) returns (bytes): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector',
      insertText: 'encodeWithSelector(${1:bytes4}, ${2:arg});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'encodeWithSelector',
      range
    },
    {
      detail: 'encodeWithSignature(string,...) returns (bytes): Equivalent to abi.encodeWithSelector(bytes4(keccak256(signature), ...)`',
      insertText: 'encodeWithSignature(${1:signatureString}, ${2:arg});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'encodeWithSignature',
      range
    },
    {
      label: 'decode',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'decode(${1:arg}, ${2:arg});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'decode(bytes encodedData, (...)) returns (...): ABI-decodes the given arguments from the given encodedData',
      range
    }
  ];
}

export function GetCompletionTypes(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  const completionItems = [];
  const types = ['address', 'string', 'bytes', 'byte', 'int', 'uint', 'bool', 'hash'];
  for (let index = 8; index <= 256; index += 8) {
    types.push('int' + index);
    types.push('uint' + index);
    types.push('bytes' + index / 8);
  }
  types.forEach(type => {
    const completionItem = CreateCompletionItem(type, monaco.languages.CompletionItemKind.Keyword, type + ' type', range);
    completionItems.push(completionItem);
  });
  // add mapping
  return completionItems;
}

function CreateCompletionItem(label: string, kind: monacoTypes.languages.CompletionItemKind, detail: string, range: monacoTypes.IRange) {
  const completionItem: monacoTypes.languages.CompletionItem = {
    label,
    kind,
    detail,
    insertText: label,
    range
  }
  completionItem.kind = kind;
  completionItem.detail = detail;
  return completionItem;
}

export function GetCompletionKeywords(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  const completionItems = [];
  const keywords = ['modifier', 'mapping', 'break', 'continue', 'delete', 'else', 'for',
    'after', 'promise', 'alias', 'apply', 'auto', 'copyof', 'default', 'define', 'final', 'implements',
    'inline', 'let', 'macro', 'match', 'mutable', 'null', 'of', 'partial', 'reference', 'relocatable',
    'sealed', 'sizeof', 'static', 'supports', 'switch', 'typedef',
    'if', 'new', 'return', 'returns', 'while', 'using', 'emit', 'anonymous', 'indexed',
    'private', 'public', 'external', 'internal', 'payable', 'nonpayable', 'view', 'pure', 'case', 'do', 'else', 'finally',
    'in', 'instanceof', 'return', 'throw', 'try', 'catch', 'typeof', 'yield', 'void', 'virtual', 'override'];
  keywords.forEach(unit => {
    const completionItem: monacoTypes.languages.CompletionItem = {
      label: unit,
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: unit + ' keyword',
      insertText: `${unit} `,
      range
    }
    completionItems.push(completionItem);
  });

  completionItems.push(CreateCompletionItem('contract', monaco.languages.CompletionItemKind.Class, null, range));
  completionItems.push(CreateCompletionItem('library', monaco.languages.CompletionItemKind.Class, null, range));
  completionItems.push(CreateCompletionItem('storage', monaco.languages.CompletionItemKind.Field, null, range));
  completionItems.push(CreateCompletionItem('calldata', monaco.languages.CompletionItemKind.Field, null, range));
  completionItems.push(CreateCompletionItem('memory', monaco.languages.CompletionItemKind.Field, null, range));
  completionItems.push(CreateCompletionItem('var', monaco.languages.CompletionItemKind.Field, null, range));
  completionItems.push(CreateCompletionItem('constant', monaco.languages.CompletionItemKind.Constant, null, range));
  completionItems.push(CreateCompletionItem('immutable', monaco.languages.CompletionItemKind.Keyword, null, range));
  completionItems.push(CreateCompletionItem('constructor', monaco.languages.CompletionItemKind.Constructor, null, range));
  completionItems.push(CreateCompletionItem('event', monaco.languages.CompletionItemKind.Event, null, range));
  completionItems.push(CreateCompletionItem('import', monaco.languages.CompletionItemKind.Module, null, range));
  completionItems.push(CreateCompletionItem('enum', monaco.languages.CompletionItemKind.Enum, null, range));
  completionItems.push(CreateCompletionItem('struct', monaco.languages.CompletionItemKind.Struct, null, range));
  completionItems.push(CreateCompletionItem('function', monaco.languages.CompletionItemKind.Function, null, range));

  return completionItems;
}

export function GeCompletionUnits(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  const completionItems = [];
  const etherUnits = ['wei', 'gwei', 'finney', 'szabo', 'ether'];
  etherUnits.forEach(unit => {
    const completionItem = CreateCompletionItem(unit, monaco.languages.CompletionItemKind.Unit, unit + ': ether unit', range);
    completionItems.push(completionItem);
  });

  const timeUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'years'];
  timeUnits.forEach(unit => {
    const completionItem = CreateCompletionItem(unit, monaco.languages.CompletionItemKind.Unit, unit + ': time unit', range);
    completionItem.kind = monaco.languages.CompletionItemKind.Unit;

    if (unit !== 'years') {
      completionItem.detail = unit + ': time unit';
    } else {
      completionItem.detail = 'REMOVED in v0.5.0: ' + unit + ': time unit';
    }
    completionItems.push(completionItem);
  });

  return completionItems;
}

export function GetImports(range: monacoTypes.IRange
  , monaco, data: CodeParserImportsData
  , word: string
): monacoTypes.languages.CompletionItem[] {
  let list = []
  if (!word.startsWith('@')) {
    word = word.replace('"', '');
    const nextPaths = [...new Set(data.files
      .filter((item) => item.startsWith(word))
      .map((item) => item.replace(word, '').split('/')[0]))]

    list = [...list, ...nextPaths
      .filter((item) => !item.endsWith('.sol'))
      .map((item) => {
        return {
          kind: monaco.languages.CompletionItemKind.Folder,
          range: range,
          label: `${item}`,
          insertText: `${item}`,
        }
      })]

    list = [...list,
      ...data.files
        .filter((item) => item.startsWith(word))
        .map((item) => {
          return {
            kind: monaco.languages.CompletionItemKind.File,
            range: range,
            label: `${item}`,
            insertText: `${item.replace(word, '')}`,
          }
        })]
  }
  if (word === '@' || word === '') {
    list = [...list, ...data.packages.map((item) => {
      return {
        kind: monaco.languages.CompletionItemKind.Module,
        range: range,
        label: `${item}`,
        insertText: word === '@' ? `${item.replace('@', '')}` : `${item}`,
      }
    })]
  }
  if (word.startsWith('@') && word.length > 1) {
    const nextPaths = [...new Set(data.modules
      .filter((item) => item.startsWith(word))
      .map((item) => item.replace(word, '').split('/')[0]))]

    list = [...list, ...nextPaths
      .filter((item) => !item.endsWith('.sol'))
      .map((item) => {
        return {
          kind: monaco.languages.CompletionItemKind.Folder,
          range: range,
          label: `${item}`,
          insertText: `${item}`,
        }
      })]

    list = [...list
      , ...data.modules
        .filter((item) => item.startsWith(word))
        .map((item) => {
          // remove the first part if it starts with @
          let label = item;
          if (label.startsWith('@')) {
            label = label.substring(label.indexOf('/') + 1);
          }
          const filename = path.basename(label)
          return {
            kind: monaco.languages.CompletionItemKind.Reference,
            range: range,
            label: `${filename}: ${label}`,
            insertText: `${item.replace(word, '')}`,
          }
        })
    ]
  }
  return list;
};

export function GetGlobalVariable(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: 'Current block',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: 'block',
      label: 'block',
      range
    },
    {
      detail: 'Current Message',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: 'msg',
      label: 'msg',
      range
    },
    {
      detail: '(uint): current block timestamp (alias for block.timestamp)',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: 'now',
      label: 'now',
      range
    },
    {
      detail: 'Current transaction',
      kind: monaco.languages.CompletionItemKind.Variable,
      label: 'tx',
      insertText: 'tx',
      range
    },
    {
      detail: 'ABI encoding / decoding',
      kind: monaco.languages.CompletionItemKind.Variable,
      label: 'abi',
      insertText: 'abi',
      range
    },
    {
      detail: '',
      kind: monaco.languages.CompletionItemKind.Variable,
      label: 'this',
      insertText: 'this',
      range
    },
  ];
}

export function GetGlobalFunctions(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      label: 'fallback',
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'fallback() ${1:external} ${2:payable} { }',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      label: 'receive',
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'receive() ${1:external} ${2:payable} { }',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    },
    {
      detail: 'assert(bool condition): throws if the condition is not met - to be used for internal errors.',
      insertText: 'assert(${1:condition});',
      kind: monaco.languages.CompletionItemKind.Function,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'assert',
      range
    },
    {
      detail: 'gasleft(): returns the remaining gas',
      insertText: 'gasleft();',
      kind: monaco.languages.CompletionItemKind.Function,
      label: 'gasleft',
      range
    },
    {
      detail: 'unicode: converts string into unicode',
      insertText: 'unicode"${1:text}"',
      kind: monaco.languages.CompletionItemKind.Function,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'unicode',
      range
    },
    {
      detail: 'blockhash(uint blockNumber): hash of the given block - only works for 256 most recent, excluding current, blocks',
      insertText: 'blockhash(${1:blockNumber});',
      kind: monaco.languages.CompletionItemKind.Function,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'blockhash',
      range
    },
    {
      detail: 'require(bool condition): reverts if the condition is not met - to be used for errors in inputs or external components.',
      insertText: 'require(${1:condition});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'require',
      range
    },
    {
      // tslint:disable-next-line:max-line-length
      detail: 'require(bool condition, string message): reverts if the condition is not met - to be used for errors in inputs or external components. Also provides an error message.',
      insertText: 'require(${1:condition}, ${2:message});',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'require',
      range
    },
    {
      detail: 'revert(): abort execution and revert state changes',
      insertText: 'revert();',
      kind: monaco.languages.CompletionItemKind.Method,
      label: 'revert',
      range
    },
    {
      detail: 'addmod(uint x, uint y, uint k) returns (uint):' +
                'compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256',
      insertText: 'addmod(${1:x}, ${2:y}, ${3:k})',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'addmod',
      range
    },
    {
      detail: 'mulmod(uint x, uint y, uint k) returns (uint):' +
                'compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256',
      insertText: 'mulmod(${1:x}, ${2:y}, ${3:k})',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'mulmod',
      range
    },
    {
      detail: 'keccak256(...) returns (bytes32):' +
                'compute the Ethereum-SHA-3 (Keccak-256) hash of the (tightly packed) arguments',
      insertText: 'keccak256(${1:x})',
      kind: monaco.languages.CompletionItemKind.Method,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'keccak256',
      range
    },
    {
      detail: 'sha256(...) returns (bytes32):' +
                'compute the SHA-256 hash of the (tightly packed) arguments',
      insertText: 'sha256(${1:x})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      label: 'sha256',
      range
    },
    {
      detail: 'sha3(...) returns (bytes32):' +
                'alias to keccak256',
      insertText: 'sha3(${1:x})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      label: 'sha3',
      range
    },
    {
      detail: 'ripemd160(...) returns (bytes20):' +
                'compute RIPEMD-160 hash of the (tightly packed) arguments',
      insertText: 'ripemd160(${1:x})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      label: 'ripemd160',
      range
    },
    {
      detail: 'ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):' +
                'recover the address associated with the public key from elliptic curve signature or return zero on error',
      insertText: 'ecrecover(${1:hash}, ${2:v}, ${3:r}, ${4:s})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      label: 'ecrecover',
      range
    },

  ];
}

export function getContextualAutoCompleteByGlobalVariable(word: string, range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  if (word === 'block') {
    return getBlockCompletionItems(range, monaco);
  }
  if (word === 'string') {
    return getStringCompletionItems(range, monaco);
  }
  if (word === 'bytes') {
    return getBytesCompletionItems(range, monaco);
  }
  if (word === 'msg') {
    return getMsgCompletionItems(range, monaco);
  }
  if (word === 'tx') {
    return getTxCompletionItems(range, monaco);
  }
  if (word === 'abi') {
    return getAbiCompletionItems(range, monaco);
  }
  if (word === 'sender') {
    return getAddressCompletionItems(range, monaco);
  }
  return null;
}

export function getArrayCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: '',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'length;',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'length',
      range,
    },
    {
      detail: '',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'push(${1:value});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'push(value)',
      range,
    },
    {
      detail: '',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'push();',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'push()',
      range,
    },
    {
      detail: '',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'pop();',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'pop()',
      range,
    },
  ]
}

export function getAddressCompletionItems(range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  return [
    {
      detail: '(uint256): balance of the Address in Wei',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'balance;',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'balance',
      range,
    },
    {
      detail: '(bytes memory): code at the Address (can be empty)',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'code;',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'code',
      range,
    },
    {
      detail: '(bytes32): the codehash of the Address',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'codehash;',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'codehash',
      range,
    },
    {
      detail: '(uint256 amount) returns (bool): send given amount of Wei to Address, returns false on failure',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'send(${1:value});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'send()',
      range,
    },
    {
      detail: '(uint256 amount): send given amount of Wei to Address, throws on failure',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'transfer(${1:value});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: 'transfer()',
      range,
    },
  ]

}

export function getContextualAutoCompleteBTypeName(word: string, range: monacoTypes.IRange, monaco): monacoTypes.languages.CompletionItem[] {
  if (word === 'ArrayTypeName') {
    return getArrayCompletionItems(range, monaco);
  }
  if (word === 'bytes') {
    return getBytesCompletionItems(range, monaco);
  }
  if (word === 'address') {
    return getAddressCompletionItems(range, monaco);
  }
  return [];
}
