import Token from '#models/token'
import type { HttpContext } from '@adonisjs/core/http'

export default class VerifyEmailsController {
  // Method to send verification email
  async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'User not authenticated.' })
    }

    if (user.isEmailVerified) {
      return response.badRequest({ message: 'Email is already verified.' })
    }

    await user.sendVerifyEmail()

    return response.status(200).json({ message: 'Verification email sent.' })
  }

  // Method to verify email using token
  async verify({ auth, session, response, params }: HttpContext) {
    if (!params.token) {
      return response.badRequest({ message: 'Token is required.' })
    }

    const user = await Token.getTokenUser(params.token, 'VERIFY_EMAIL')

    // If token is invalid or does not match the auth user
    if (!user || !(user?.id === auth.user?.id)) {
      return response.badRequest({ message: 'Invalid or expired token.' })
    }

    // If token is valid but user is not authenticated
    if (user && !auth.user) {
      session.put('isVerifyingEmail', true)
      return response.badRequest({ message: 'login' })
    }

    user.isEmailVerified = true
    await user.save()
    await Token.expireTokens(user, 'verifyEmailTokens')

    return response.status(200).json({ message: 'Email verified successfully.' })
  }
}
