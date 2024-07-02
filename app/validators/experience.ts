import vine from '@vinejs/vine'

export const createExperienceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    organization: vine.string().trim().minLength(3).maxLength(255),
    startDate: vine.string(),
    endDate: vine.string().optional(),
  })
)

export const updateExperienceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    organization: vine.string().trim().minLength(3).maxLength(255).optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)
