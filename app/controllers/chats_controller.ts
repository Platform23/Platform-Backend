import Message from '#models/message'
import MessagePolicy from '#policies/message_policy'
import { createMessageValidator } from '#validators/message'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import transmit from '@adonisjs/transmit/services/main'
import { randomUUID } from 'node:crypto'

export default class ChatsController {
  /**
   * Display a list of experiences of an user
   */
  async index({ params, response }: HttpContext) {
    try {
      const networkId = params.id

      if (!networkId) {
        return response.badRequest({ message: "L'identifiant du réseau est requis." })
      }

      const messages = await Message.query()
        .where('network_id', networkId)
        .orderBy('created_at', 'asc')
        .preload('user', (user) => user.select('id', 'pseudo', 'avatar'))
        .limit(100)

      return response.ok({ data: messages })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la récupération du message.',
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createMessageValidator)

      if (!('image' in payload) && !('content' in payload)) {
        return response.badRequest({ message: 'Un texte ou une image est requis.' })
      }

      let content
      if ('content' in payload) {
        content = payload.content
      }

      if ('image' in payload) {
        await payload.image.move(app.makePath('uploads/chat_images'), {
          name: `${cuid()}.webp`,
        })
      }

      const message = await Message.create({
        id: randomUUID(),
        userId: auth.user!.id,
        networkId: payload.network,
        content: content,
        imagePath: 'image' in payload ? payload.image.fileName : null,
      })

      await message.load('user', (query) => query.select('id', 'pseudo', 'avatar'))

      const channel = `chats/${payload.network}/messages`
      transmit.broadcast(channel, { message: JSON.stringify(message.toJSON()) })

      return response.ok({ data: 'Message envoyé avec succès.' })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({ message: 'Erreur de stockage du message.' })
    }
  }

  /**
   * Handle form submission for the delete action
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    try {
      const message = await Message.find(params.id)

      if (!message) {
        return response.status(404).json({ message: 'Message non trouvé.' })
      }

      if (await bouncer.with(MessagePolicy).denies('delete', message)) {
        return response.forbidden('Accès refusé.')
      }

      await message.delete()

      return response.status(200).json({ message: 'Message supprimé avec succès.' })
    } catch (error) {
      return response.status(500).json({
        message: "Une erreur s'est produite lors de la suppression du message.",
      })
    }
  }
}
