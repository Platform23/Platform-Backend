import User from '#models/user'
import Network from '#models/network'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class NetworkPolicy extends BasePolicy {
  store(user: User): AuthorizerResponse {
    return user.role === 2 || user.role === 3
  }

  index(): AuthorizerResponse {
    return true
  }

  show(): AuthorizerResponse {
    return true
  }

  edit(user: User, network: Network): AuthorizerResponse {
    return user.role === 3 || user.id === network.userId
  }

  delete(user: User, network: Network): AuthorizerResponse {
    return user.role === 3 || user.id === network.userId
  }

  addUser(user: User, network: Network): AuthorizerResponse {
    return user.role === 3 || user.role === 2 || user.id === network.userId
  }

  removeUser(user: User, network: Network): AuthorizerResponse {
    return user.role === 3 || user.id === network.userId || user.role === 2
  }
}
