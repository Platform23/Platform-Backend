import vine from '@vinejs/vine'

export const createNetworkValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100),
    description: vine.string().trim().minLength(3),
    cover: vine.file({
      size: '10mb',
      extnames: ['jpg', 'png', 'jpeg'],
    }),
    subjects: vine.array(vine.number()),
  })
)

export const updateNetworkValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100).optional(),
    description: vine.string().trim().minLength(3).optional(),
    cover: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
    subjects: vine.array(vine.number()).optional(),
  })
)
