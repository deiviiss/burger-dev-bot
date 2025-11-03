import { createProvider } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

export const baileysProvider = createProvider(Provider, {
  version: [2, 3000, 1025190524],
  browser: ["Windows", "Chrome", "Chrome 114.0.5735.198"],
  writeMyself: "both",
  experimentalStore: true,
  timeRelease: 86400000,
  usePairingCode: false
})