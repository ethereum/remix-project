#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("../src/websocket");
var remixdClient_1 = require("../src/services/remixdClient");
var program = require('commander');
program
    .usage('-s <shared folder>')
    .description('Provide a two-way connection between the local computer and Remix IDE')
    .option('--remix-ide  <url>', 'URL of remix instance allowed to connect to this web sockect connection')
    .option('-s, --shared-folder <path>', 'Folder to share with Remix IDE')
    .option('--read-only', 'Treat shared folder as read-only (experimental)')
    .on('--help', function () {
    console.log('\nExample:\n\n    remixd -s ./ --remix-ide http://localhost:8080');
}).parse(process.argv);
var killCallBack = [];
if (!program.remixIde) {
    console.log('\x1b[31m%s\x1b[0m', '[ERR] URL Remix IDE instance has to be provided.');
}
console.log('\x1b[33m%s\x1b[0m', '[WARN] You may now only use IDE at ' + program.remixIde + ' to connect to that instance');
if (program.sharedFolder) {
    console.log('\x1b[33m%s\x1b[0m', '[WARN] Any application that runs on your computer can potentially read from and write to all files in the directory.');
    console.log('\x1b[33m%s\x1b[0m', '[WARN] Symbolic links are not forwarded to Remix IDE\n');
    var remixdClient = new remixdClient_1.default();
    var websocketHandler = new websocket_1.default(65520, { remixIdeUrl: program.remixIde }, remixdClient);
    websocketHandler.start();
    killCallBack.push(websocketHandler.close);
}
// kill
function kill() {
    for (var k in killCallBack) {
        try {
            killCallBack[k]();
        }
        catch (e) {
            console.log(e);
        }
    }
}
process.on('SIGINT', kill); // catch ctrl-c
process.on('SIGTERM', kill); // catch kill
process.on('exit', kill);
