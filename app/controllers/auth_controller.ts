import Token from '#models/token'
import User from '#models/user'
import env from '#start/env'
import {
  emailValidator,
  loginUserValidator,
  passwordValidator,
  registerUserValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'

export default class AuthController {
  // Register a new user
  async register({ auth, response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)

      const user = await User.create({
        pseudo: payload.pseudo,
        email: payload.email,
        password: payload.password,
      })

      await user.related('competences').attach(payload.competences)
      await user.related('communities').attach(payload.communities)
      await user.related('profiles').attach(payload.profiles)

      await auth.use('web').login(user, !!request.input('remember_me'))
      await user.sendVerifyEmail()

      return response.status(201).json({ message: 'User registered successfully.' })
    } catch (error) {
      return response.status(422).json({
        error: error,
      })
    }
  }

  // Login an existing user
  async login({ auth, session, response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginUserValidator)

      let user: User

      if (payload.email) {
        user = await User.verifyCredentials(payload.email, payload.password)
      } else if (payload.pseudo) {
        user = await User.verifyCredentials(payload.pseudo, payload.password)
      } else {
        return response.badRequest({ message: 'Email or pseudo is required.' })
      }

      await auth.use('web').login(user, !!request.input('remember_me'))

      if (auth.user && session.has('isVerifyingEmail')) {
        auth.user.isEmailVerified = true
        await auth.user.save()
      }

      return response.status(200).json({ message: 'Login successful.' })
    } catch (error) {
      return response.status(error.status).json({
        error: error,
      })
    }
  }

  // Request a password reset
  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(emailValidator)
    const user = await User.findBy('email', email)

    if (!user) {
      return response.badRequest({ message: 'User not found.' })
    }

    const token = await Token.generatePasswordResetToken(user)
    const resetLink = router.makeUrl('password.reset', [token])

    await mail.sendLater((message) => {
      message
        .from('jclaytonblanc@gmail.com ')
        .to(user.email)
        .subject('Réinitialisez votre mot de passe')
        .html(
          `Réinitialisez votre mot de passe par <a href="${env.get('DOMAIN')}${resetLink}">en cliquant ici</a>`
        )
    })

    return response.status(200).json({ message: 'Password reset email sent.' })
  }

  // Reset user password using token
  async resetPassword({ auth, params, request, response }: HttpContext) {
    const token = params.token

    const { password } = await request.validateUsing(passwordValidator)

    const user = await Token.getTokenUser(token, 'PASSWORD_RESET')

    if (!user) {
      return response.badRequest({ message: 'Invalid or expired token.' })
    }

    await user.merge({ password }).save()
    await auth.use('web').login(user, !!request.input('remember_me'))
    await Token.expireTokens(user, 'passwordResetTokens')

    return response.status(200).json({ message: 'Password reset successful.' })
  }

  // Logout the currently authenticated user
  async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('web').logout()
      return response.status(204)
    } catch (error) {
      return response.status(error.status).json({
        error: error.name,
      })
    }
  }
}
