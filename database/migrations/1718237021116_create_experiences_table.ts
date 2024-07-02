/* eslint-disable prettier/prettier */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'experiences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
      .integer('user_id')
      .unsigned()
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable()
      table.string('title').notNullable()
      table.string('organization').notNullable()
      table.string('start_date').nullable()
      table.string('end_date').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}