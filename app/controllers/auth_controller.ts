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
import mail from '@adonisjs/mail/services/main'
import { randomUUID } from 'node:crypto'

export default class AuthController {
  // Register a new user
  async register({ auth, response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)

      const user = await User.create({
        uuid: randomUUID(),
        pseudo: payload.pseudo,
        email: payload.email,
        password: payload.password,
        role: payload.role ?? 1,
      })

      await user.related('competences').attach(payload.competences)
      await user.related('communities').attach(payload.communities)
      await user.related('profiles').attach(payload.profiles)

      await auth.use('web').login(user, !!request.input('remember_me'))
      await user.sendVerifyEmail()
      return response.status(201).json({ data: user })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      if (error.code === '23505') {
        const conflictField = error.constraint.includes('email') ? 'email' : 'pseudo'
        return response
          .status(409)
          .json({ message: `L'utilisateur avec ce(t) ${conflictField} existe déjà.` })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'inscription.",
      })
    }
  }

  // Login an existing user
  async login({ auth, session, response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginUserValidator)

      let user: User

      if ('email' in payload) {
        user = await User.verifyCredentials(payload.email, payload.password)
      } else if ('pseudo' in payload) {
        user = await User.verifyCredentials(payload.pseudo, payload.password)
      } else {
        return response.badRequest({ message: 'Un e-mail ou un pseudo est requis.' })
      }

      await auth.use('web').login(user, !!request.input('remember_me'))

      if (auth.user && session.has('isVerifyingEmail')) {
        auth.user.isEmailVerified = true
        await auth.user.save()
      }

      return response.status(200).json({ data: user })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.unauthorized({ message: 'Email, pseudo ou mot de passe invalide.' })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de la connexion.",
      })
    }
  }

  // Get user info
  async getuserInfo({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      return response.status(200).json({ data: user })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'obtention des informations utilisateur.",
      })
    }
  }

  // Request a password reset
  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)
      const user = await User.findBy('email', email)

      if (!user) {
        return response.badRequest({ message: 'Utilisateur non trouvé.' })
      }

      const token = await Token.generatePasswordResetToken(user)
      const PASSWORD_RESET_ROUTE = `reinitialiser-mot-de-passe`
      const resetLink = `${env.get('DOMAIN')}/${PASSWORD_RESET_ROUTE}/${token}`

      await mail.sendLater((message) => {
        message
          .from('no-reply@platformht.com')
          .to(user.email)
          .subject('Réinitialisez votre mot de passe')
          .htmlView('emails/reset_password', { user: user, url: resetLink })
      })

      return response
        .status(200)
        .json({ message: 'E-mail de réinitialisation du mot de passe envoyé.' })
    } catch (error) {
      return response.internalServerError({
        message:
          "Une erreur s'est produite lors de la demande de réinitialisation du mot de passe.",
      })
    }
  }

  // Reset user password using token
  async resetPassword({ params, request, response }: HttpContext) {
    try {
      const token = params.token

      const { password } = await request.validateUsing(passwordValidator)

      const user = await Token.getTokenUser(token, 'PASSWORD_RESET')

      if (!user) {
        return response.badRequest({ message: 'Jeton invalide ou expiré.' })
      }

      await user.merge({ password }).save()
      await Token.expireTokens(user, 'passwordResetTokens')

      return response.status(200).json({ data: 'Réinitialisation du mot de passe réussie.' })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
      })
    }
  }

  // Logout the currently authenticated user
  async logout({ session, auth, response }: HttpContext) {
    try {
      await auth.use('web').logout()
      session.forget('user')
      return response.ok({})
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la déconnexion.",
      })
    }
  }
}
