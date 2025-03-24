import path from 'path';

// 为了使用文件系统路径，我们基于项目结构定义路径
const rootDir = path.resolve(__dirname, '..', '..');
const srcDir = path.resolve(rootDir, 'src');

export const paths = {
  root: rootDir,
  src: srcDir,
  core: path.resolve(srcDir, 'core'),
  config: path.resolve(srcDir, 'config'),
  apps: path.resolve(srcDir, 'apps'),
  types: path.resolve(srcDir, 'types'),
  utils: path.resolve(srcDir, 'utils'),
  generators: path.resolve(srcDir, 'generators'),
  prisma: path.resolve(rootDir, 'prisma')
} as const; 