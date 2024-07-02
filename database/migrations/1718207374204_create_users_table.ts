import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()
      table.uuid('uuid').notNullable()
      table.string('full_name').nullable()
      table.string('pseudo').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.integer('role').notNullable().defaultTo(1)
      table.string('profession').nullable()
      table.string('avatar').nullable()
      table.string('background').nullable()
      table.boolean('is_email_verified').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
