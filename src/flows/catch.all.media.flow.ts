import { addKeyword, EVENTS } from '@builderbot/bot'

export const catchAllMediaFlow = addKeyword([
  EVENTS.MEDIA,
  EVENTS.DOCUMENT,
  EVENTS.VOICE_NOTE,
  EVENTS.LOCATION
])
  .addAction(async (_, { flowDynamic, fallBack }) => {
    await flowDynamic('Recibí tu archivo.Por ahora solo puedo procesar texto para pedidos. 📄🖼️🎧')

    return fallBack(`Continuemos...?`)
  })