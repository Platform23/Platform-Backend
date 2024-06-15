import Network from '#models/network'
import User from '#models/user'
import UserNetwork from '#models/user_network'
import NetworkPolicy from '#policies/network_policy'
import { createNetworkValidator, updateNetworkValidator } from '#validators/network'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'

export default class NetworksController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const networks = await Network.query()
        .preload('subjects', (subject) => subject.select('name'))
        .select('id', 'name', 'description', 'cover')

      return response.status(200).json({ data: networks })
    } catch (error) {
      return response.internalServerError({
        message: 'Error while fetching all networks.',
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createNetworkValidator)

      if (await bouncer.with(NetworkPolicy).denies('store')) {
        return response.forbidden('Access denied')
      }

      if (payload.cover) {
        await payload.cover.move(app.makePath('uploads/network_images'), {
          name: `${cuid()}.webp`,
        })
      }

      const network = await Network.create({
        userId: auth.user!.id,
        name: payload.name,
        description: payload.description,
        cover: payload.cover.fileName,
      })

      await network.related('subjects').attach(payload.subjects)

      return response.status(201).json({ data: network })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: 'An error occurred while creating network.',
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const network = await Network.query()
        .where('id', params.id)
        .preload('subjects', (subject) => subject.select('name'))
        .preload('users', (user) => user.select('pseudo', 'avatar'))
        .select('id', 'name', 'description', 'cover')
        .first()

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      return response.status(200).json({ data: network })
    } catch (error) {
      return response.internalServerError({
        message: 'Error while fetching network by id.',
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateNetworkValidator)
      const network = await Network.find(params.id)

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('edit', network)) {
        return response.forbidden('Access denied')
      }

      if (payload.cover) {
        await payload.cover.move(app.makePath('uploads/network_images'), {
          name: network.cover ?? undefined,
          overwrite: true,
        })
      }

      await network
        .merge({
          name: payload.name,
          description: payload.description,
          cover: payload.cover?.fileName,
        })
        .save()

      return response.status(200).json({ data: network })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: 'An error occurred while updating network.',
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    try {
      const network = await Network.find(params.id)

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('delete', network)) {
        return response.forbidden('Access denied')
      }

      await network.related('subjects').detach()
      await network.delete()

      return response.status(204).json({ message: 'Network deleted successfully.' })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while deleting network.',
      })
    }
  }

  /**
   * Request integration into a network
   */
  async requestIntegration({ auth, params, response }: HttpContext) {
    try {
      const network = await Network.find(params.id)

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      const creator = await User.find(network.userId)

      // Send email to the network creator
      await mail.sendLater((message) => {
        message
          .from('sender@example.com')
          .to(creator!.email)
          .subject("Demande d'intégration")
          .html(
            `<p>Salut ${creator!.pseudo},</p><p>L' utilisateur au pseudo ${auth.user!.pseudo} a demandé l'intégration dans votre réseau "${network.name}".</p>`
          )
      })

      // Send email to platform
      await mail.sendLater((message) => {
        message
          .from('sender@example.com')
          .to('selljo69@gmail.com')
          .subject("Demande d'intégration")
          .html(
            `<p>Salut,</p><p>L'utilisateur au pseudo ${auth.user!.pseudo} a demandé l'intégration dans le réseau "${network.name}".</p>`
          )
      })

      return response.status(200).json({ message: 'Request to integrate into network successful.' })
    } catch (error) {
      return response.internalServerError({
        message: 'Error requesting integration into network.',
      })
    }
  }

  /**
   * Add a user to a network
   */
  async addUserToNetwork({ bouncer, params, response }: HttpContext) {
    try {
      const network = await Network.find(params.id)

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('addUser', network)) {
        return response.forbidden('Access denied')
      }

      const user = await User.findBy('pseudo', params.pseudo)
      if (!user) {
        return response.status(404).json({ message: 'User not found.' })
      }

      await UserNetwork.create({
        userId: user.id,
        networkId: network.id,
      })

      return response.status(201).json({ message: 'User added to network successfully.' })
    } catch (error) {
      return response.internalServerError({
        message: 'Error adding user to network.',
      })
    }
  }

  /**
   * Remove a user from a network.
   */
  async removeUserFromNetwork({ bouncer, params, response }: HttpContext) {
    try {
      const network = await Network.find(params.id)
      const user = await User.findBy('pseudo', params.pseudo)

      if (!network) {
        return response.status(404).json({ message: 'Network not found.' })
      }

      if (!user) {
        return response.status(404).json({ message: 'User not found.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('removeUser', network)) {
        return response.forbidden('Access denied')
      }

      const userNetwork = await UserNetwork.findBy({ networkId: network.id, userId: user.id })

      if (!userNetwork) {
        return response.status(404).json({ message: 'User is not a member of this network.' })
      }

      await userNetwork.delete()

      return response.status(200).json({ message: 'User removed to network successfully.' })
    } catch (error) {
      return response.internalServerError({
        message: 'Error removing user from network.',
      })
    }
  }
}
