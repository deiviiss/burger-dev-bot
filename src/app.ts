import { createBot, MemoryDB } from '@builderbot/bot'
import { config } from "@/config"
import { JsonFileDB as Database } from '@builderbot/database-json'
import { baileysProvider } from '@/provider'
import flows from '@/flows'

const main = async () => {
  const { handleCtx, httpServer } = await createBot({
    flow: flows,
    provider: baileysProvider,
    database: new MemoryDB()
  })

  baileysProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body
      await bot.sendMessage(number, message, { media: urlMedia ?? null })
      return res.end('sended')
    })
  )

  // baileysProvider.server.post(
  //   '/v1/register',
  //   handleCtx(async (bot, req, res) => {
  //     const { number, name } = req.body
  //     await bot.dispatch('REGISTER_FLOW', { from: number, name })
  //     return res.end('trigger')
  //   })
  // )

  // baileysProvider.server.post(
  //   '/v1/samples',
  //   handleCtx(async (bot, req, res) => {
  //     const { number, name } = req.body
  //     await bot.dispatch('SAMPLES', { from: number, name })
  //     return res.end('trigger')
  //   })
  // )

  // baileysProvider.server.post(
  //   '/v1/blacklist',
  //   handleCtx(async (bot, req, res) => {
  //     const { number, intent } = req.body
  //     if (intent === 'remove') bot.blacklist.remove(number)
  //     if (intent === 'add') bot.blacklist.add(number)

  //     res.writeHead(200, { 'Content-Type': 'application/json' })
  //     return res.end(JSON.stringify({ status: 'ok', number, intent }))
  //   })
  // )

  httpServer(+config.PORT)
}

main()
