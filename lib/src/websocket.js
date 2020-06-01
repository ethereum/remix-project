"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WS = require("ws");
var http = require("http");
var buildWebsocketClient = require('@remixproject/plugin-ws').buildWebsocketClient;
var WebSocket = /** @class */ (function () {
    function WebSocket(port, opt, remixdClient) {
        this.port = port;
        this.opt = opt;
        this.remixdClient = remixdClient;
    }
    WebSocket.prototype.start = function (callback) {
        var obj = this;
        this.server = http.createServer(function (request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        var loopback = '127.0.0.1';
        this.server.listen(this.port, loopback, function () {
            console.log((new Date()) + ' Remixd is listening on ' + loopback + ':65520');
        });
        this.wsServer = new WS.Server({ server: this.server });
        this.wsServer.on('connection', function connection(ws) {
            var client = buildWebsocketClient(ws, obj.remixdClient);
            if (callback)
                callback(client);
        });
    };
    WebSocket.prototype.close = function () {
        console.log('this.server: ', this.server);
        this.server.close();
    };
    return WebSocket;
}());
exports.default = WebSocket;
