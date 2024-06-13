import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Competence from './competence.js'
import Community from './community.js'
import Profile from './profile.js'
import Experience from './experience.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare pseudo: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare profession: string | null

  @column()
  declare avatar: string | null

  @column()
  declare background: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Competence, {
    pivotTable: 'user_competences',
  })
  declare competences: ManyToMany<typeof Competence>

  @manyToMany(() => Community, {
    pivotTable: 'user_communities',
  })
  declare communities: ManyToMany<typeof Community>

  @manyToMany(() => Profile, {
    pivotTable: 'user_profiles',
  })
  declare profiles: ManyToMany<typeof Profile>

  @hasMany(() => Experience)
  declare experiences: HasMany<typeof Experience>
}
