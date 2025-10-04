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
1. HABLAR: Esta acción se debe realizar cuando el cliente tenga consultas o necesite más información sobre nuestro menú.
2. CONFIRMAR: Esta acción se debe realizar cuando se haya detectado que hay un pedido en el historial de conversación bajo la siguiente estructura: 

🛒 Nuevo Pedido

Código de verificación: BD-XXXXX

1x Producto - $XX.XX

Total: $XX.XX

------
Tipo de pedido: Domicilio |  Para pasar a recoger

👤 Cliente: [Nombre]
🏠 Dirección: [Dirección] // Solo si es pedido de domicilio
💳 Pago: [Método de pago]

¡Gracias por tu pedido! Por favor, presiona el botón de enviar mensaje para continuar.
--------------------------------------------------------
Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.

⚠️ IMPORTANTE:
- Solo responde con CONFIRMAR si encuentras la estructura completa del pedido formateado en el historial
- Si el mensaje contiene "🛒 Nuevo Pedido", "Código de verificación: BD-", "👤 Cliente:", "Tipo de pedido:" y "💳 Pago:", entonces es CONFIRMAR
- Si NO encuentras TODOS estos elementos en el mensaje, responde con HABLAR
- NO respondas CONFIRMAR solo porque el cliente diga "quiero pedir" - debe tener la estructura completa del pedido

Respuesta ideal (HABLAR|CONFIRMAR):
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

  if (trimmedIntent === 'CONFIRMAR') return gotoFlow(flowConfirm);
  if (trimmedIntent === 'HABLAR') return gotoFlow(flowTalk);

  return fallBack(`Hola, soy el asistente para pedidos. Por favor, arma tu pedido aquí:

https://burgerdev-demo.vercel.app 🍔📱`)
}
