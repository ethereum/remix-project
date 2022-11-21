import setupMethods from 'solc/wrapper'

self.onmessage = ({ data: { question } }) => {
    const thoughtworker = null;
    const url = 'https://binaries.soliditylang.org/wasm/soljson-v0.8.7+commit.e28d00a7.js';
    (self as any).importScripts(url)
    console.log(self)
    const compiler = setupMethods(self)
    console.log(compiler.version())
    self.postMessage({
        answer: 42,
    });
};

