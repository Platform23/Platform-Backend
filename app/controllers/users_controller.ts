import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { updateUserValidator } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class UsersController {
  /**
   * Display a list of users
   */
  async index({ bouncer, response }: HttpContext) {
    try {
      if (await bouncer.with(UserPolicy).denies('index')) {
        return response.forbidden('Accès refusé')
      }

      const users = await User.all()

      return response.status(200).json({ data: users })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la récupération des utilisateurs.",
      })
    }
  }

  async store({ response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)

      const user = await User.create({
        uuid: randomUUID(),
        pseudo: payload.pseudo,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        isEmailVerified: true,
      })

      await user.related('competences').attach(payload.competences)
      await user.related('communities').attach(payload.communities)
      await user.related('profiles').attach(payload.profiles)

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
        message: error,
      })
    }
  }

  /**
   * Show individual user
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.query()
        .where('uuid', params.id)
        .preload('competences', (competence) => competence.select('name'))
        .preload('profiles', (profile) => profile.select('name'))
        .preload('communities', (community) => community.select('name'))
        .preload('experiences', (experience) =>
          experience.select('title', 'organization', 'start_date', 'end_date')
        )
        .first()

      if (!user) {
        return response.status(404).json({ message: 'Utilisateur non trouvé.' })
      }

      return response.status(200).json({ data: user })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateUserValidator)
      const user = await User.find(params.id)

      if (!user) {
        return response.status(404).json({ message: 'Utilisateur non trouvé.' })
      }

      if (await bouncer.with(UserPolicy).denies('edit', user)) {
        return response.forbidden('Accès refusé')
      }

      const isUserAvaterNull = user.avatar === null
      const isUserBackgroundNull = user.avatar === null

      if (payload.avatar) {
        await payload.avatar.move(app.makePath('uploads/avatars'), {
          name: isUserAvaterNull ? `${cuid()}.webp` : user.avatar ?? undefined,
          overwrite: isUserAvaterNull ? false : true,
        })
      }

      if (payload.background) {
        await payload.background.move(app.makePath('uploads/backgrounds'), {
          name: isUserBackgroundNull ? `${cuid()}.webp` : user.background ?? undefined,
          overwrite: isUserAvaterNull ? false : true,
        })
      }

      const userUpdated = await user
        .merge({
          fullName: payload.fullName,
          profession: payload.profession,
          role: payload.role,
          avatar: payload.avatar?.fileName,
          background: payload.background?.fileName,
        })
        .save()

      return response.status(200).json({ data: userUpdated })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.status(500).json({
        message: "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      })
    }
  }

  /**
   * Delete user
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.status(404).json({ message: 'Utilisateur non trouvé.' })
      }

      if (await bouncer.with(UserPolicy).denies('delete', user)) {
        return response.forbidden('Accès refusé')
      }

      await user.related('communities').detach()
      await user.related('competences').detach()
      await user.related('networks').detach()
      await user.related('profiles').detach()
      await user.delete()

      return response.status(204).json({ message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
      return response.status(500).json({
        message: "Une erreur s'est produite lors de la suppression de l'utilisateur.",
      })
    }
  }
}
