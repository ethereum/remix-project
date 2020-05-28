"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_ws_1 = require("@remixproject/plugin-ws");
var utils = require('../utils');
var isbinaryfile = require('isbinaryfile');
var fs = require('fs-extra');
var RemixdClient = /** @class */ (function (_super) {
    __extends(RemixdClient, _super);
    function RemixdClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemixdClient.prototype.setWebSocket = function (websocket) {
        this.websocket = websocket;
    };
    RemixdClient.prototype.sharedFolder = function (currentSharedFolder, readOnly) {
        this.currentSharedFolder = currentSharedFolder;
        this.readOnly = readOnly;
    };
    RemixdClient.prototype.list = function (args, cb) {
        try {
            cb(null, utils.walkSync(this.currentSharedFolder, {}, this.currentSharedFolder));
        }
        catch (e) {
            cb(e.message);
        }
    };
    RemixdClient.prototype.resolveDirectory = function (args, cb) {
        try {
            var path_1 = utils.absolutePath(args.path, this.currentSharedFolder);
            cb(null, utils.resolveDirectory(path_1, this.currentSharedFolder));
        }
        catch (e) {
            cb(e.message);
        }
    };
    RemixdClient.prototype.folderIsReadOnly = function (args, cb) {
        return cb(null, this.readOnly);
    };
    RemixdClient.prototype.get = function (args, cb) {
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        if (!fs.existsSync(path)) {
            return cb('File not found ' + path);
        }
        if (!isRealPath(path, cb))
            return;
        isbinaryfile(path, function (error, isBinary) {
            if (error)
                console.log(error);
            if (isBinary) {
                cb(null, { content: '<binary content not displayed>', readonly: true });
            }
            else {
                fs.readFile(path, 'utf8', function (error, data) {
                    if (error)
                        console.log(error);
                    cb(error, { content: data, readonly: false });
                });
            }
        });
    };
    RemixdClient.prototype.exists = function (args, cb) {
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        cb(null, fs.existsSync(path));
    };
    RemixdClient.prototype.set = function (args, cb) {
        if (this.readOnly)
            return cb('Cannot write file: read-only mode selected');
        var isFolder = args.path.endsWith('/');
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        if (fs.existsSync(path) && !isRealPath(path, cb))
            return;
        if (args.content === 'undefined') { // no !!!!!
            console.log('trying to write "undefined" ! stopping.');
            return;
        }
        this.trackDownStreamUpdate[path] = path;
        if (isFolder) {
            fs.mkdirp(path).then(function () { return cb(); }).catch(function (e) { return cb(e); });
        }
        else {
            fs.ensureFile(path).then(function () {
                fs.writeFile(path, args.content, 'utf8', function (error, data) {
                    if (error)
                        console.log(error);
                    cb(error, data);
                });
            }).catch(function (e) { return cb(e); });
        }
    };
    RemixdClient.prototype.rename = function (args, cb) {
        if (this.readOnly)
            return cb('Cannot rename file: read-only mode selected');
        var oldpath = utils.absolutePath(args.oldPath, this.currentSharedFolder);
        if (!fs.existsSync(oldpath)) {
            return cb('File not found ' + oldpath);
        }
        var newpath = utils.absolutePath(args.newPath, this.currentSharedFolder);
        if (!isRealPath(oldpath, cb))
            return;
        fs.move(oldpath, newpath, function (error, data) {
            if (error)
                console.log(error);
            cb(error, data);
        });
    };
    RemixdClient.prototype.remove = function (args, cb) {
        if (this.readOnly)
            return cb('Cannot remove file: read-only mode selected');
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        if (!fs.existsSync(path)) {
            return cb('File not found ' + path);
        }
        if (!isRealPath(path, cb))
            return;
        fs.remove(path, function (error) {
            if (error) {
                console.log(error);
                return cb('Failed to remove file/directory: ' + error);
            }
            cb(error, true);
        });
    };
    RemixdClient.prototype.isDirectory = function (args, cb) {
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        cb(null, fs.statSync(path).isDirectory());
    };
    RemixdClient.prototype.isFile = function (args, cb) {
        var path = utils.absolutePath(args.path, this.currentSharedFolder);
        cb(null, fs.statSync(path).isFile());
    };
    return RemixdClient;
}(plugin_ws_1.PluginClient));
exports.default = RemixdClient;
function isRealPath(path, cb) {
    var realPath = fs.realpathSync(path);
    var isRealPath = path === realPath;
    var mes = '[WARN] Symbolic link modification not allowed : ' + path + ' | ' + realPath;
    if (!isRealPath) {
        console.log('\x1b[33m%s\x1b[0m', mes);
    }
    if (cb && !isRealPath)
        cb(mes);
    return isRealPath;
}
