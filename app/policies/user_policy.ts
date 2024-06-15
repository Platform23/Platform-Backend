import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  store(): AuthorizerResponse {
    return true
  }

  index(user: User): AuthorizerResponse {
    return user.role === 3
  }

  show(): AuthorizerResponse {
    return true
  }

  edit(user: User, targetUser: User): AuthorizerResponse {
    return user.role === 3 || user.id === targetUser.id
  }

  delete(user: User, targetUser: User): AuthorizerResponse {
    return user.role === 3 || user.id === targetUser.id
  }
}
