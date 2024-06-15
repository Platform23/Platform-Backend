import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Network from './network.js'
import Subject from './subject.js'

export default class NetworkSubject extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare networkId: number

  @column()
  declare subjectId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Network)
  declare network: BelongsTo<typeof Network>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>
}
