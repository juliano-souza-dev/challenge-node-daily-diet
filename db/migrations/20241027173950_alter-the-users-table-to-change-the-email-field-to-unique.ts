import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', function (table) {
    table.unique('email')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', function (table) {
    table.dropUnique(['email']) // Remove a restrição de unicidade do campo email
  })
}
