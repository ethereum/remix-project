import * as http from 'http';
import { spawn } from 'child_process';
import * as path from 'path';
let backend = require('git-http-backend');
import * as zlib from 'zlib';

const directory = process.argv[2];

if (!directory) {
    console.error('Please provide a directory as a command line argument.');
    process.exit(1);
}

const server = http.createServer((req, res) => {

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        res.writeHead(204);
        res.end();
        return;
    }

    const repo = req.url?.split('/')[1];
    const dir = path.join(directory, 'git', repo || '');
    console.log(dir);
    const reqStream = req.headers['content-encoding'] === 'gzip' ? req.pipe(zlib.createGunzip()) : req;
    
    reqStream.pipe(backend(req.url || '', (err, service) => {
        if (err) return res.end(err + '\n');
        
        res.setHeader('content-type', service.type);
        console.log(service.action, repo, service.fields);
        
        const ps = spawn(service.cmd, [...service.args, dir]);
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
        
    })).pipe(res);
});

server.listen(6868, () => {
    console.log('Server is listening on port 6868');
});
