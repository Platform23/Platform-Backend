import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'networks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('uuid').notNullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.string('cover').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
