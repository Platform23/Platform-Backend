import Message from '#models/message'
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
        return response.badRequest({ message: 'Network ID is required.' })
      }

      const messages = await Message.query()
        .where('network_id', networkId)
        .orderBy('created_at', 'desc')
        .limit(100)

      return response.ok({ data: messages })
    } catch (error) {
      return response.internalServerError({
        message: 'Error while fetching messesage.',
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createMessageValidator)

      if (!payload.image && !payload.content) {
        return response.badRequest({ message: 'Text or image is required' })
      }

      if (payload.image) {
        await payload.image.move(app.makePath('uploads/chat_images'), {
          name: `${cuid()}.webp`,
        })
      }

      const channel = `chats/${payload.network}`
      const messageContent = `${auth.user!.pseudo}: ${payload.content}`

      transmit.broadcast(channel, { message: messageContent })

      await Message.create({
        id: randomUUID(),
        userId: auth.user!.id,
        networkId: payload.network,
        content: payload.content,
        imagePath: payload.image?.fileName,
      })

      return response.ok({ message: 'Message sent successfully.' })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ mesaages: error.messages })
      }

      return response.internalServerError({ message: 'Error storing message.' })
    }
  }
}
