import 'dotenv/config';

interface ServerConfig {
  port: number;
  host: string;
  env: string;
}

interface DatabaseConfig {
  url: string;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

interface ApiDocsConfig {
  enabled: boolean;
  path: string;
}

interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  apiDocs: ApiDocsConfig;
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  apiDocs: {
    enabled: process.env.API_DOCS_ENABLED === 'true',
    path: process.env.API_DOCS_PATH || '/api/docs',
  },
}; 