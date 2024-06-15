import User from '#models/user'
import Experience from '#models/experience'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ExperiencePolicy extends BasePolicy {
  edit(user: User, experience: Experience): AuthorizerResponse {
    return experience.userId === user.id || user.role === 3
  }

  delete(user: User, experience: Experience): AuthorizerResponse {
    return experience.userId === user.id || user.role === 3
  }
}
