import * as esbuild from 'esbuild';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const isDev = process.env.NODE_ENV === 'development';

const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: !isDev,
  plugins: [
    require('esbuild-plugin-react')(),
    require('esbuild-plugin-typescript')()
  ],
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`
  }
};

// 开发服务器
if (isDev) {
  const server = createServer((req, res) => {
    if (req.url === '/') {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (req.url === '/bundle.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(readFileSync(resolve(__dirname, '../dist/bundle.js')));
    }
  });

  server.listen(3000, () => {
    console.log('Development server running at http://localhost:3000');
  });

  // 监听文件变化
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
} else {
  // 生产环境构建
  await esbuild.build(buildOptions);
} 