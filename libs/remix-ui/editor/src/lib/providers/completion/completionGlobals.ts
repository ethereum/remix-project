import { IRange } from "monaco-editor";
import monaco from "../../../types/monaco";

export function getBlockCompletionItems(range: IRange): monaco.languages.CompletionItem[] {
    return [
        {
            detail: '(address): Current block miner’s address',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'miner',
            label: 'coinbase',
            range,
        },
        {
            detail: '(bytes32): DEPRICATED In 0.4.22 use blockhash(uint) instead. Hash of the given block - only works for 256 most recent blocks excluding current',
            insertText: 'blockhash(${1:blockNumber});',
            kind: monaco.languages.CompletionItemKind.Method,
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

export function getTxCompletionItems(range: IRange): monaco.languages.CompletionItem[] {
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

export function getMsgCompletionItems(range: IRange): monaco.languages.CompletionItem[] {
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

export function getAbiCompletionItems(range: IRange): monaco.languages.CompletionItem[] {
    return [
        {
            detail: 'encode(..) returs (bytes): ABI-encodes the given arguments',
            insertText: 'encode(${1:arg});',
            kind: monaco.languages.CompletionItemKind.Method,
            label: 'encode',
            range
        },
        {
            detail: 'encodePacked(..) returns (bytes): Performes packed encoding of the given arguments',
            insertText: 'encodePacked(${1:arg});',
            kind: monaco.languages.CompletionItemKind.Method,
            label: 'encodePacked',
            range
        },
        {
            detail: 'encodeWithSelector(bytes4,...) returns (bytes): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector',
            insertText: 'encodeWithSelector(${1:bytes4}, ${2:arg});',
            kind: monaco.languages.CompletionItemKind.Method,
            label: 'encodeWithSelector',
            range
        },
        {
            detail: 'encodeWithSignature(string,...) returns (bytes): Equivalent to abi.encodeWithSelector(bytes4(keccak256(signature), ...)`',
            insertText: 'encodeWithSignature(${1:signatureString}, ${2:arg});',
            kind: monaco.languages.CompletionItemKind.Method,
            label: 'encodeWithSignature',
            range    
        },
    ];
}