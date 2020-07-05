# easy-send
Share a single file easily from local machine.

If you want to share a file over the internet, it is probably better to use something like [Firefox Send](https://send.firefox.com/)

## Installation
```bash
npm install -g easy-send
```

## Usage
```bash
easy-send -f <path-to-file>
```
This will spin up a HTTP serve with a random URL, for example:

```
$ easy-send -f yarn.lock
IP addresses:
lo0 127.0.0.1
en0 192.168.0.11
Serving yarn.lock on the following addresses:
http://127.0.0.1:8000/soej
http://192.168.0.11:8000/soej
```

Other options
```
$ easy-send -h
Usage: easy-send [options]

Options:
  -f, --file <path-to-file>  path to file
  -id, --id <id>             id in the url e.g. http://localhost:8080/:id
  -p, --port <port>          port to listen on. If port is taken then program will try to find the next available port (default:
                             8000)
  -h, --help                 display help for command
```
