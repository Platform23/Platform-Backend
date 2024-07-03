import User from '#models/user'
import Message from '#models/message'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class MessagePolicy extends BasePolicy {
  delete(user: User, message: Message): AuthorizerResponse {
    return user.role === 3 || user.id === message.userId
  }
}
