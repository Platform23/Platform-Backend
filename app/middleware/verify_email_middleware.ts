import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VerifyEmailMiddleware {
  // Check if the user is logged in and their email is not verified
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.user && !ctx.auth.user.isEmailVerified) {
      return ctx.response.unauthorized({ message: 'Please verify your email address.' })
    }

    await next()
  }
}
