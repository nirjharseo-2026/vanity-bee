const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const headers = {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600'
    };

    response.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Vanity Bee is running at http://${host}:${port}`);
});
