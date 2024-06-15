import vine from '@vinejs/vine'

export const createMessageValidator = vine.compile(
  vine.object({
    content:
      vine.string().trim().minLength(1) ||
      vine.file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg'],
      }),
  })
)
