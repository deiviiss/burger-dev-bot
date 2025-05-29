import { createProvider } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

export const baileysProvider = createProvider(Provider, {
  browser: ["Windows", "Chrome", "Chrome 114.0.5735.198"],
  version: [2, 3000, 1023223821],
  usePairingCode: false
})