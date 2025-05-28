import { createProvider } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

export const baileysProvider = createProvider(Provider, {
  version: [2, 3000, 1023223821]
})