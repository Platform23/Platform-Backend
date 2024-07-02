import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import string from '@adonisjs/core/helpers/string'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare type: string

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Generates a verification email token for a given user.
  static async generateVerifyEmailToken(user: User) {
    const token = string.generateRandom(64)

    await Token.expireTokens(user, 'verifyEmailTokens')
    const record = await user.related('tokens').create({
      type: 'VERIFY_EMAIL',
      expiresAt: DateTime.now().plus({ hours: 24 }),
      token,
    })

    return record.token
  }

  // Generates a password reset token for a given user or returns a token if the user is null.
  static async generatePasswordResetToken(user: User | null) {
    const token = string.generateRandom(64)

    if (!user) return token

    await Token.expireTokens(user, 'passwordResetTokens')
    const record = await user.related('tokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ minute: 10 }),
      token,
    })

    return record.token
  }

  // Expires all tokens of a specified type for a given user.
  static async expireTokens(user: User, relationName: 'passwordResetTokens' | 'verifyEmailTokens') {
    await user.related(relationName).query().update({
      expiresAt: DateTime.now(),
    })
  }

  // Retrieves the user associated with a valid token of a specified type.
  static async getTokenUser(token: string, type: TokenType) {
    const record = await Token.query()
      .preload('user')
      .where({ token: token, type: type })
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  // Verifies the existence and validity of a token of a specified type.
  static async verify(token: string, type: TokenType) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where({ token: token, type: type })
      .first()

    return !!record
  }
}
