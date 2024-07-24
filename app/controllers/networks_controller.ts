import Network from '#models/network'
import User from '#models/user'
import UserNetwork from '#models/user_network'
import NetworkPolicy from '#policies/network_policy'
import env from '#start/env'
import { createNetworkValidator, updateNetworkValidator } from '#validators/network'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { randomUUID } from 'node:crypto'

export default class NetworksController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const networks = await Network.query()
        .preload('subjects', (subject) => subject.select('name'))
        .select('id', 'uuid', 'name', 'description', 'cover')

      return response.status(200).json({ data: networks })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la récupération de tous les réseaux.',
      })
    }
  }

  /**
   * Display a list of resource of a user
   */
  async getUserNetworks({ auth, response }: HttpContext) {
    try {
      const userNetworks = await UserNetwork.query()
        .where('user_id', auth.user!.id)
        .select('id', 'user_id', 'network_id')
        .preload('network', (network) =>
          network.select('id', 'uuid', 'name', 'description', 'cover')
        )

      return response.status(200).json({ data: userNetworks })
    } catch (error) {
      return response.internalServerError({
        message: "Erreur lors de la récupération de tous les réseaux d'utilisateurs.",
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
        return response.forbidden('Accès refusé.')
      }

      if (payload.cover) {
        await payload.cover.move(app.makePath('uploads/network_images'), {
          name: `${cuid()}.webp`,
        })
      }

      const network = await Network.create({
        uuid: randomUUID(),
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
        message: "Une erreur s'est produite lors de la création du réseau.",
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const network = await Network.query()
        .where('uuid', params.id)
        .preload('subjects', (subject) => subject.select('name'))
        .preload('users', (user) => user.select('pseudo', 'avatar'))
        .select('id', 'uuid', 'name', 'description', 'cover')
        .first()

      if (!network) {
        return response.status(404).json({ message: 'Réseau introuvable.' })
      }

      return response.status(200).json({ data: network })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la récupération du réseau par identifiant.',
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
        return response.status(404).json({ message: 'Réseau introuvable' })
      }

      if (await bouncer.with(NetworkPolicy).denies('edit', network)) {
        return response.forbidden('Accès refusé')
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
        message: "Une erreur s'est produite lors de la mise à jour du réseau.",
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
        return response.status(404).json({ message: 'Réseau introuvable.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('delete', network)) {
        return response.forbidden('Accès refusé')
      }

      await network.related('subjects').detach()
      await network.delete()

      return response.status(204).json({ message: 'Réseau supprimé avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la suppression du réseau.",
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
        return response.status(404).json({ message: 'Réseau introuvable.' })
      }

      const creator = await User.find(network.userId)

      // Send email to the network creator
      await mail.sendLater((message) => {
        message
          .from('no-reply@platformht.com')
          .to(creator!.email)
          .subject("Demande d'intégration")
          .htmlView('emails/request_network_integration', {
            creatorPseudo: creator!.pseudo,
            userPseudo: auth.user!.pseudo,
            networkName: network.name,
          })
      })

      return response.status(200).json({ data: "Demande d'intégration au réseau réussie." })
    } catch (error) {
      return response.internalServerError({
        message: "Erreur lors de la demande d'intégration au réseau.",
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
        return response.status(404).json({ message: 'Réseau introuvable.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('addUser', network)) {
        return response.forbidden('Accès refusé')
      }

      const user = await User.findBy('pseudo', params.pseudo)
      if (!user) {
        return response.status(404).json({ message: 'Utilisateur non trouvé.' })
      }

      await UserNetwork.create({
        userId: user.id,
        networkId: network.id,
      })

      return response.status(201).json({ message: 'Utilisateur ajouté au réseau avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: "Erreur lors de l'ajout d'un utilisateur au réseau.",
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
        return response.status(404).json({ message: 'Réseau introuvable.' })
      }

      if (!user) {
        return response.status(404).json({ message: 'Utilisateur non trouvé.' })
      }

      if (await bouncer.with(NetworkPolicy).denies('removeUser', network)) {
        return response.forbidden('Accès refusé')
      }

      const userNetwork = await UserNetwork.findBy({ networkId: network.id, userId: user.id })

      if (!userNetwork) {
        return response
          .status(404)
          .json({ message: "L'utilisateur n'est pas membre de ce réseau." })
      }

      await userNetwork.delete()

      return response.status(200).json({ message: 'Utilisateur supprimé du réseau avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: "Erreur lors de la suppression de l'utilisateur du réseau.",
      })
    }
  }
}
