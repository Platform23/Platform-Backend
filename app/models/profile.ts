import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Profile extends BaseModel {
  static related(arg0: string) {
    throw new Error('Method not implemented.')
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'user_profiles',
  })
  declare users: ManyToMany<typeof User>
}
