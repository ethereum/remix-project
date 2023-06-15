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
        },
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
        },
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
            detail: '(bytes32): DEPRICATED In 0.4.22 use blockhash(uint) instead. Hash of the given block - only works for 256 most recent blocks excluding current',
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
        }
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
            detail: '(uint): remaining gas DEPRICATED in 0.4.21 use gasleft()',
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
            detail: 'encode(..) returs (bytes): ABI-encodes the given arguments',
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
            detail: 'encodePacked(..) returns (bytes): Performes packed encoding of the given arguments',
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
            completionItem.detail = 'DEPRECATED: ' + unit + ': time unit';
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
