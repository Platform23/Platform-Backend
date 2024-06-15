import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'network_subjects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('network_id')
        .unsigned()
        .references('networks.id')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('subject_id')
        .unsigned()
        .references('subjects.id')
        .onDelete('CASCADE')
        .notNullable()
      table.unique(['network_id', 'subject_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
