import { BotState, BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getAIResponse } from "@/services/ai-services"
import { getHistoryParse } from "@/utils/handleHistory"
import { flowConfirm } from "@/flows/confirm.flow"
import { flowTalk } from "@/flows/talk.flow"
import { getCurrentFlow } from "@/utils/handleCurrentFlow"
import { FlowValue } from "@/utils/types"
import { setBranchPhoneNumber } from "@/actions/set-active-phone-number"

type CreatePromptParams = {
  history: string
  currentState: FlowValue | undefined
}

const createPromptInitial = ({ history, currentState }: CreatePromptParams) => {
  const PROMPT_INITIAL_CONVERSATION = `
Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación relacionada con BurgerDev y determinar cuál de las siguientes acciones es la más adecuada a realizar:
--------------------------------------------------------
Historial de conversación:
${history}

Flujo actual de conversación (puede ayudar a orientar tu decisión):
currentFlow: ${currentState ?? 'ninguno'}

Posibles acciones a realizar:
1. PEDIR: Esta acción se debe realizar cuando el cliente exprese su deseo de hacer un pedido u ordenar.
2. HABLAR: Esta acción se debe realizar cuando el cliente tenga consultas o necesite más información sobre nuestro menú.
3. CONFIRMAR: Esta acción se debe realizar cuando se haya llegado a un acuerdo mutuo, proporcionando un pedido.
--------------------------------------------------------
Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.

⚠️ IMPORTANTE:
- Si el cliente muestra intención de ordenar (ej. "quiero pedir", "quiero ordenar algo"), pero NO ha recibido información del menú aún (según el historial o el currentFlow), debes mantener la acción como HABLAR.
- Solo responde PEDIR si el cliente ya ha visto el menú y ha mencionado productos específicos del menú.

Respuesta ideal (PEDIR|HABLAR|CONFIRMAR):
  `.trim()

  return PROMPT_INITIAL_CONVERSATION
}

// This layer is used to determine user intention
export default async (ctx: BotContext, { state, gotoFlow, fallBack, flowDynamic, endFlow }: BotMethods) => {
  const userMessage = ctx.body.trim().toLowerCase()
  const isAdmin = ctx.from === process.env.PHONE_NUMBER_ADMIN;

  const match = userMessage.match(/^(activar|desactivar) bot (.+)$/)

  if (isAdmin && match) {
    const mode = match[1] === 'activar' ? 'bot' : 'user'
    const label = match[2]

    const result = await setBranchPhoneNumber(label, mode)

    await flowDynamic(result.message)
    return endFlow()
  }

  const history = getHistoryParse(state as BotState)
  const currentFlow = getCurrentFlow(state as BotState)
  const prompt = createPromptInitial({ history, currentState: currentFlow })

  const intentPrediction = await getAIResponse(prompt);

  const trimmedIntent = intentPrediction.trim().toUpperCase();
  await state.update({ currentFlow: trimmedIntent })

  console.log('===== DISCRIMINADOR =====')
  console.log('Intent Prediction:', intentPrediction)
  console.log('currentFlow:', currentFlow)

  if (trimmedIntent === 'CONFIRMAR') return gotoFlow(flowConfirm);
  if (trimmedIntent === 'PEDIR') return gotoFlow(flowConfirm);
  if (trimmedIntent === 'HABLAR') return gotoFlow(flowTalk);

  return fallBack(`Hola, soy el asistente para pedidos. Por favor, arma tu pedido aquí:

https://burgerdev-demo.vercel.app 🍔📱`)
}
