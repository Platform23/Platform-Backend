import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Subject from './subject.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Network extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare cover: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Subject, {
    pivotTable: 'network_subjects',
  })
  declare subjects: ManyToMany<typeof Subject>

  @manyToMany(() => User, {
    pivotTable: 'user_networks',
  })
  declare users: ManyToMany<typeof User>
}
