import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    pseudo: vine
      .string()
      .alphaNumeric({ allowSpaces: false, allowDashes: false, allowUnderscores: false })
      .trim()
      .minLength(3)
      .maxLength(100),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    role: vine.enum([1, 2, 3]).optional(),
    competences: vine.array(vine.number()).minLength(1),
    communities: vine.array(vine.number()).minLength(1),
    profiles: vine.array(vine.number()).minLength(1),
  })
)

const emailOrPseudo = vine.group([
  vine.group.if((data) => 'email' in data, {
    email: vine.string().trim().email(),
  }),
  vine.group.if((data) => 'pseudo' in data, {
    pseudo: vine.string().trim().minLength(3).maxLength(100),
  }),
])

export const loginUserValidator = vine.compile(
  vine
    .object({
      password: vine.string().trim().minLength(8),
    })
    .merge(emailOrPseudo)
)

export const emailValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const passwordValidator = vine.compile(
  vine.object({
    password: vine.string().trim().minLength(8),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(100).optional(),
    profession: vine.string().trim().minLength(3).maxLength(100).optional(),
    role: vine.enum([1, 2, 3]).optional(),
    avatar: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
    background: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
  })
)
