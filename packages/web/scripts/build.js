import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

process.env.NODE_ENV = 'production';

const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: true,
  plugins: [
    require('esbuild-plugin-react')(),
    require('esbuild-plugin-typescript')()
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

// 创建 dist 目录
mkdirSync('dist', { recursive: true });

// 复制 index.html
copyFileSync(
  resolve(__dirname, '../index.html'),
  resolve(__dirname, '../dist/index.html')
);

// 构建
await esbuild.build(buildOptions); 