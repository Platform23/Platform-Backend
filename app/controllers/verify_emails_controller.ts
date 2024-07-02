import Token from '#models/token'
import type { HttpContext } from '@adonisjs/core/http'

export default class VerifyEmailsController {
  // Method to send verification email
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'Utilisateur non authentifié.' })
      }

      if (user.isEmailVerified) {
        return response.badRequest({ message: "L'e-mail est déjà vérifié." })
      }

      await user.sendVerifyEmail()

      return response.status(200).json({ message: "L'email de vérification a été envoyé." })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'envoi de l'e-mail de vérification.",
      })
    }
  }

  // Method to verify email using token
  async verify({ auth, session, response, params }: HttpContext) {
    try {
      if (!params.token) {
        return response.badRequest({ message: 'Un jeton est requis.' })
      }

      const user = await Token.getTokenUser(params.token, 'VERIFY_EMAIL')

      // If token is invalid or does not match the auth user
      if (!user || !(user?.id === auth.user?.id)) {
        return response.badRequest({ message: 'Jeton non valide ou expiré.' })
      }

      // If token is valid but user is not authenticated
      if (user && !auth.user) {
        session.put('isVerifyingEmail', true)
        return response.badRequest({
          message:
            'Veuillez vous connecter pour terminer le processus de vérification des e-mails.',
        })
      }

      user.isEmailVerified = true
      await user.save()
      await Token.expireTokens(user, 'verifyEmailTokens')

      return response.status(200).json({ message: 'E-mail vérifié avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'envoi de l'e-mail de vérification.",
      })
    }
  }
}
