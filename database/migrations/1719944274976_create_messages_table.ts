import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table
        .integer('network_id')
        .unsigned()
        .references('networks.id')
        .onDelete('CASCADE')
        .notNullable()
      table.text('content')
      table.string('image_path')
      table.boolean('deleted').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
