import { Knex, knex as setupKnex } from 'knex'
import { env } from './env'

const connection =
  env.NODE_ENV === 'test' ? { filename: env.DATABASE_URL } : env.DATABASE_URL

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,
}
export const knex = setupKnex(config)
