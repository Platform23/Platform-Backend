/* eslint-disable prettier/prettier */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
      .integer('user_id')
      .unsigned()
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable()
      table
      .integer('profile_id')
      .unsigned()
      .references('profiles.id')
      .onDelete('CASCADE')
      .notNullable()
      table.unique(['user_id', 'profile_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}