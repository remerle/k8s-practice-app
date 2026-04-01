import type { Knex } from 'knex';

const DEFAULT_DEV_DATABASE_URL = 'postgres://shop:shop@localhost:5432/shop';

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || DEFAULT_DEV_DATABASE_URL,
  migrations: {
    directory: './src/migrations',
    extension: 'ts',
  },
};

export default config;
