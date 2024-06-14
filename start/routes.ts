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

router.get('health', ({ response }) => response.noContent())

router
  .group(() => {
    router.group(() => {
      router
        .get('/verify/email', [VerifyEmailsController, 'index'])
        .as('verify.email')
        .use(middleware.auth())
      router
        .get('/verify/email/:token', [VerifyEmailsController, 'verify'])
        .as('verify.email.verify')
        .use(middleware.auth())
    })

    router.group(() => {
      router.post('/register', [AuthController, 'register'])
      router.post('/login', [AuthController, 'login'])
      router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
      router.post('/forgot-password', [AuthController, 'forgotPassword']).as('password.send')
      router.post('/reset-password/:token', [AuthController, 'resetPassword']).as('password.reset')
    })
  })
  .prefix('api')
