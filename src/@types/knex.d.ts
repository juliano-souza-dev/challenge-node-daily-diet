// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      session_id: string
      created_at: Date
      updated_at: Date
    }
  }
}
