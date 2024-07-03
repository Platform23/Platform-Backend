/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const VerifyEmailsController = () => import('#controllers/verify_emails_controller')
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ImagesController = () => import('#controllers/images_controller')
const ExperiencesController = () => import('#controllers/experiences_controller')
const NetworksController = () => import('#controllers/networks_controller')
const ChatsController = () => import('#controllers/chats_controller')

router.get('health', ({ response }) => response.noContent())

router
  .group(() => {
    router.group(() => {
      // Authentication routes
      router.group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
        router.post('/forgot-password', [AuthController, 'forgotPassword']).as('password.send')
        router.post('/reset-password/:token', [AuthController, 'resetPassword'])
        router.get('/me', [AuthController, 'getuserInfo']).use(middleware.auth())
      })

      // Email verification routes
      router
        .get('/verify/email', [VerifyEmailsController, 'index'])
        .as('verify.email')
        .use(middleware.auth())
      router.get('/verify/email/:token', [VerifyEmailsController, 'verify']).use(middleware.auth())

      // Users routes
      router
        .resource('users', UsersController)
        .use(
          ['index', 'show', 'update', 'destroy'],
          [middleware.auth(), middleware.emailVerification()]
        )

      // Experiences routes
      router
        .group(() => {
          router.get('/:id', [ExperiencesController, 'index'])
          router.post('/', [ExperiencesController, 'store'])
          router.put('/:id', [ExperiencesController, 'update'])
          router.delete('/:id', [ExperiencesController, 'destroy'])
        })
        .use([middleware.auth(), middleware.emailVerification()])
        .prefix('experiences')

      // Images route
      router
        .group(() => {
          router.get('/:type/*', [ImagesController, 'show'])
        })
        .prefix('uploads')

      // Networks routes
      router
        .group(() => {
          router.get('/', [NetworksController, 'index'])
          router
            .get('/user-networks', [NetworksController, 'getUserNetworks'])
            .use([middleware.auth(), middleware.emailVerification()])
          router.get('/:id', [NetworksController, 'show'])
          router.post('/', [NetworksController, 'store'])
          router.put('/:id', [NetworksController, 'update'])
          router.delete('/:id', [NetworksController, 'destroy'])
          router.post('/:id/request-integration', [NetworksController, 'requestIntegration'])
          router.post('/:id/add-user/:pseudo', [NetworksController, 'addUserToNetwork'])
          router.delete('/:id/remove-user/:pseudo', [NetworksController, 'removeUserFromNetwork'])
        })
        .use([middleware.auth(), middleware.emailVerification()])
        .prefix('networks')

      // Chats routes
      router
        .group(() => {
          router.get('/:id', [ChatsController, 'index'])
          router.post('/', [ChatsController, 'store'])
          router.delete('/:id', [ChatsController, 'destroy'])
        })
        .use([middleware.auth(), middleware.emailVerification()])
        .prefix('messages')
    })
  })
  .prefix('api')
