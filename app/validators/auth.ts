import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    pseudo: vine.string().trim().minLength(3).maxLength(100),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    competences: vine.array(vine.number()).minLength(1),
    communities: vine.array(vine.number()).minLength(1),
    profiles: vine.array(vine.number()).minLength(1),
  })
)

export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().nullable(),
    pseudo: vine.string().trim().minLength(3).maxLength(100).nullable(),
    password: vine.string().trim().minLength(8),
  })
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
