import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { sep, normalize } from 'node:path'
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

export default class ImagesController {
  async show({ params, request, response }: HttpContext) {
    const filePath = request.param('*').join(sep)
    const normalizedPath = normalize(filePath)

    if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
      return response.badRequest('Malformed path')
    }

    let basePath: string

    switch (params.type) {
      case 'avatars':
        basePath = 'uploads/avatars'
        break
      case 'backgrounds':
        basePath = 'uploads/backgrounds'
        break
      case 'chat_images':
        basePath = 'uploads/chat_images'
        break
      default:
        return response.badRequest('Invalid image type')
    }
    const absolutePath = app.makePath(basePath, normalizedPath)
    return response.download(absolutePath)
  }
}
