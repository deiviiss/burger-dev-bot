import { addKeyword, EVENTS } from '@builderbot/bot'
import conversationalLayer from '@/layers/conversational.layer'
import mainLayer from '@/layers/main.layer'

const mainFlow = addKeyword(EVENTS.WELCOME)
  .addAction(conversationalLayer)
  .addAction(mainLayer)

export { mainFlow }