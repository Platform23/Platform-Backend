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
import Token from './token.js'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import Network from './network.js'
import Message from './message.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'pseudo'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare fullName: string | null

  @column()
  declare pseudo: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare role: number

  @column()
  declare profession: string | null

  @column()
  declare avatar: string | null

  @column()
  declare background: string | null

  @column({ serializeAs: null })
  declare isEmailVerified: boolean

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

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @manyToMany(() => Network, {
    pivotTable: 'user_networks',
  })
  declare networks: ManyToMany<typeof Network>

  // Token relation
  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'PASSWORD_RESET'),
  })
  declare passwordResetTokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'VERIFY_EMAIL'),
  })
  declare verifyEmailTokens: HasMany<typeof Token>

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  async sendVerifyEmail() {
    const token = await Token.generateVerifyEmailToken(this)
    const ROUTE = 'verifier-email'
    const url = `${env.get('DOMAIN')}/${ROUTE}/${token}`

    await mail.sendLater((message) => {
      message
        .subject('Veuillez vérifier votre e-mail')
        .from('no-reply@platformht.com')
        .to(this.email)
        .htmlView('emails/verify_email', { user: this, url: url })
    })
  }
}
