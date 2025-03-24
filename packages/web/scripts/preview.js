import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const server = createServer((req, res) => {
  if (req.url === '/') {
    const html = readFileSync(resolve(__dirname, '../dist/index.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/bundle.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(readFileSync(resolve(__dirname, '../dist/bundle.js')));
  }
});

server.listen(3000, () => {
  console.log('Preview server running at http://localhost:3000');
}); 