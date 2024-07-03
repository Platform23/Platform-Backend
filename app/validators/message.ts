import vine from '@vinejs/vine'

const contentGroup = vine.group([
  vine.group.if((data) => 'image' in data, {
    image: vine.file({
      size: '10mb',
      extnames: ['jpg', 'png', 'jpeg'],
    }),
  }),
  vine.group.if((data) => 'content' in data, {
    content: vine.string().trim().minLength(1).optional().nullable(),
  }),
])

export const createMessageValidator = vine.compile(
  vine
    .object({
      network: vine.number(),
    })
    .merge(contentGroup)
)
