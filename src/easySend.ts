import { program } from 'commander';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createReadStream, existsSync } from 'fs';
import { networkInterfaces } from 'os';
program
    .requiredOption('-f, --file <path-to-file>', 'path to file')
    .name('easy-send')
    .option('-id, --id <id>', 'id in the url e.g. http://localhost:8080/:id')
    .option(
        '-p, --port <port>',
        'port to listen on. If port is taken then program will try to find the next available port',
        (val, _) => parseInt(val),
        8000,
    )
    .parse(process.argv);

if (program.id == undefined) {
    program.id = makeid(4);
}
if (!existsSync(program.file)) {
    console.log(`${program.file} does not exist`);
    process.exit(1);
}

// adapted from https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
console.log('Host IP addresses:');
const ifaces = networkInterfaces();
const ipAddresses = [];
Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family) {
            // skip over non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
            ipAddresses.push(iface.address);
        }
        ++alias;
    });
});

// adapted from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// creates a random url on which we serve the file
function makeid(length: number): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// serve the file on /:id and exit
const listener = (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200);
    if (req.url != null && req.url === `/${program.id}`) {
        req.on('close', () => {
            console.log('done, bye!');
            process.exit();
        });
        console.log(`Remote address: ${req.connection.remoteAddress}`);
        const readStream = createReadStream(program.file);
        readStream.pipe(res);
    } else {
        res.end();
    }
};

const server = createServer(listener);
let port = program.port;
server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
        port += 1;
        server.listen(port);
    } else {
        console.log(e);
        process.exit(1);
    }
});
server.listen(port);
server.on('listening', () => {
    console.log(`Serving ${program.file} on the following addresses:`);
    for (const ip of ipAddresses) {
        console.log(`http://${ip}:${port}/${program.id}`);
    }
});
