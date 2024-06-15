import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_networks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table
        .integer('network_id')
        .unsigned()
        .references('networks.id')
        .onDelete('CASCADE')
        .notNullable()
      table.unique(['user_id', 'network_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
