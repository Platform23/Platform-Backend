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
        return response.forbidden('Access denied')
      }

      const users = await User.all()

      return response.status(200).json({ data: users })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while fetching the users.',
      })
    }
  }

  /**
   * Show individual user
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.status(404).json({ message: 'User not found.' })
      }

      return response.status(200).json({ data: user })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while fetching the user.',
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
        return response.status(404).json({ message: 'User not found.' })
      }

      if (await bouncer.with(UserPolicy).denies('edit', user)) {
        return response.forbidden('Access denied')
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
        message: 'An error occurred while updating the user.',
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
        return response.status(404).json({ message: 'User not found.' })
      }

      if (await bouncer.with(UserPolicy).denies('delete', user)) {
        return response.forbidden('Access denied')
      }

      await user.related('communities').detach()
      await user.related('competences').detach()
      await user.related('networks').detach()
      await user.related('profiles').detach()
      await user.delete()

      return response.status(204).json({ message: 'User successfully deleted' })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while deleting the user.',
      })
    }
  }
}
