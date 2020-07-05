"use strict";
exports.__esModule = true;
var commander_1 = require("commander");
var http_1 = require("http");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
commander_1.program
    .requiredOption('-f, --file <path-to-file>', 'path to file')
    .name('easy-send')
    .option('-id, --id <id>', 'id in the url e.g. http://localhost:8080/:id')
    .option('-p, --port <port>', 'port to listen on. If port is taken then program will try to find the next available port', function (val, _) { return parseInt(val); }, 8000)
    .parse(process.argv);
if (commander_1.program.id == undefined) {
    commander_1.program.id = makeid(4);
}
if (!fs_1.existsSync(commander_1.program.file)) {
    console.log(commander_1.program.file + " does not exist");
    process.exit(1);
}
// adapted from https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
console.log('Host IP addresses:');
var ifaces = os_1.networkInterfaces();
var ipAddresses = [];
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family) {
            // skip over non-ipv4 addresses
            return;
        }
        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        }
        else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
            ipAddresses.push(iface.address);
        }
        ++alias;
    });
});
// adapted from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// creates a random url on which we serve the file
function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
// serve the file on /:id and exit
var listener = function (req, res) {
    if (req.url != null && req.url === "/" + commander_1.program.id) {
        req.on('close', function () {
            console.log('done, bye!');
            process.exit();
        });
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + path_1.basename(commander_1.program.file)
        });
        console.log("Remote address: " + req.connection.remoteAddress);
        var readStream = fs_1.createReadStream(commander_1.program.file);
        readStream.pipe(res);
    }
    else {
        res.writeHead(200);
        res.end();
    }
};
var server = http_1.createServer(listener);
var port = commander_1.program.port;
server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
        port += 1;
        server.listen(port);
    }
    else {
        console.log(e);
        process.exit(1);
    }
});
server.listen(port);
server.on('listening', function () {
    console.log("Serving " + commander_1.program.file + " on the following addresses:");
    for (var _i = 0, ipAddresses_1 = ipAddresses; _i < ipAddresses_1.length; _i++) {
        var ip = ipAddresses_1[_i];
        console.log("http://" + ip + ":" + port + "/" + commander_1.program.id);
    }
});
