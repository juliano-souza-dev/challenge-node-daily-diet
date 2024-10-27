// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables' {
  interface User {
    id: string
    name: string
    email: string
    session_id: string
    created_at: Date
    updated_at: Date
  }

  interface tables {
    users: User
  }
}
