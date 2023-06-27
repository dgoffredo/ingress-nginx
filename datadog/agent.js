// This is an HTTP server that listens on port 8126, and prints to standard
// output a JSON representation of all traces that it receives.

const http = require('http');
const msgpack = require('massagepack');
const process = require('process');

function handleTraceSegments(segments) {
    console.log(msgpack.encodeJSON(segments));
}

const requestListener = function (request, response) {
  if (!request.url.endsWith('/traces')) {
    // console.log('ignoring request for non-trace endpoint', request.url);
    response.end();
    return;
  }

  let body = [];
  request.on('data', chunk => {
    // console.log('Received a chunk of data from ', request.socket.remoteAddress, 'for', request.url, ': ', chunk);
    // console.log('Here it is as text:', chunk.toString('ascii'));
    body.push(chunk);
  }).on('end', () => {
    // console.log('Received end of request.');
    body = Buffer.concat(body);
    const trace_segments = msgpack.decode(body);
    // console.dir(trace_segments, {depth: null});
    handleTraceSegments(trace_segments);
    response.writeHead(200);
    response.end(JSON.stringify({}));
  });
};

const port = 8126;
console.log(`node.js web server (agent) is running on port ${port}`);
const server = http.createServer(requestListener);
server.listen(port);

process.on('SIGTERM', function () {
  console.log('Received SIGTERM');
  server.close(() => process.exit(0));
});

process.on('SIGINT', function () {
  console.log('Received SIGINT');
  server.close(() => process.exit(0));
});