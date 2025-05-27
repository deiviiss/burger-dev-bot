import { getAIResponse } from "@/services/ai-services";
import { clearHistory, handleHistory, getHistoryParse } from "@/utils/handleHistory";
import { addKeyword, EVENTS } from "@builderbot/bot";
import { BotState } from "@builderbot/bot/dist/types";
import prisma from "@/lib/prisma";
import { create } from "domain";
import { createUpdateUser } from "@/http/users/create-update-user";
import { get } from "http";
import { getUserByPhoneNumber } from "@/http/users/get-user-by-phone-number";
import { User } from "@/utils/types";

const findCodePrompt = (history: string) => {
  const PROMPT = `
Eres un asistente encargado de confirmar pedidos de un menú digital.
Tu tarea es revisar si el mensaje del usuario contiene un pedido generado desde el sistema, lo cual se identifica por un ID que sigue el formato: "Código de verificación: BD-FTJE29" de una estructura de pedido como:

🛒 Nuevo Pedido

1x Hamburguesa Sencilla - $45.00
1x Papas Fritas Chicas - $25.00
1x Coca-Cola - $20.00

Total: $90.00

Código de verificación: BD-FTJE29

¡Gracias por tu pedido! Por favor, presiona el botón de enviar mensaje para continuar.

Usa el historial de conversación para identificar el pedido y el código de verificación. Si el mensaje del usuario contiene un pedido, responde con el código de verificación. Si no hay un pedido claro, responde no-code

No incluyas BD- en la respuesta, solo el código de verificación.

Historial de conversación:
${history}

Ejemplo de respuestas:
FTJE29
no-code
`
  return PROMPT
}

const getTotalOrderPrompt = (history: string) => {
  const PROMPT = `
  Dado el historial de conversación el cliente ya ha levantado su pedido lo que necesito es que me digas el total de su pedido.

  Responde solo con el total del pedido, sin más información.
  Historial de conversación:
  ${history}

  Responde solo con el total del pedido como número decimal, sin el signo de pesos ni texto adicional. Ejemplo: 90.00

  Ejemplo de respuesta:
  90.00
  `
  return PROMPT
}

const getPaymentMethod = (paymentMethod: string) => {
  const PROMPT = `
  El cliente ha indicado que su forma de pago es ${paymentMethod}. 
  Responde solo con la forma de pago, sin más información.
  Si no es una forma de pago válida, responde "no-payment".

De acuerdo a las opciones de pago que aceptamos, las formas de pago válidas son:
  1- Transferencia Bancaria
  2- Efectivo
  3- Tarjeta de Crédito/Débito
  4- Otro método de pago
  Si el cliente menciona una forma de pago que no está en esta lista, responde "no-payment".
  Responde solo con la forma de pago, sin más información.

  Ejemplo de respuestas:
  Transferencia Bancaria  
  no-payment
  `
  return PROMPT
}

const confirmOrderPrompt = ({
  history,
  name,
  address,
  paymentMethod,
  order
}: {
  history: string;
  name: string;
  address: string;
  paymentMethod: string;
  order: string;
}) => {
  const PROMPT = `
El cliente ya ha indicado los productos que desea y sus datos personales (nombre, dirección, método de pago). Tu tarea es confirmar el pedido con todos los datos, nombre, dirección, método de pago.

Usa el pedido adjunto para identificar:
- Qué productos pidió el cliente
- Las cantidades y variaciones (si las mencionó)
- Cualquier instrucción adicional

PEDIDO ADJUNTO:
${order}

Historial de conversación:
${history}

Nombre del cliente: ${name}
Domicilio de entrega: ${address}
Forma de pago: ${paymentMethod}

Después, responde con un resumen amable del pedido con nombre, dirección, método de pago y pregunta si está todo bien o desea modificar algo.
No saludes al cliente, solo responde con el resumen del pedido.

Ejemplo de respuesta:
Aquí está el resumen de tu pedido:
1x Hamburguesa Sencilla - $45.00
1x Papas Fritas Chicas - $25.00
1x Coca-Cola - $20.00

Total: $90.00

A nombre de: ${name}
Domicilio de entrega: ${address}
Forma de pago: ${paymentMethod}
Tiempo de entrega: 35 minutos

Por favor, revisa y confirma si todo está correcto o si deseas hacer algún cambio. 😊

Sé claro, amable y mantén un tono cercano, como si atendieras por WhatsApp.
`
  return PROMPT
}

const validateConfirmation = (history: string) => {
  const PROMPT = `
Eres una inteligencia artificial que analiza respuestas de clientes en WhatsApp después de que se les muestra un resumen de su pedido y total.

Tu tarea es determinar si el cliente "confirmó que todo está correcto" o si indicó que desea hacer "algún cambio".

Respuesta del cliente:
${history}

Solo responde con una de estas dos opciones:
- "CONFIRMADO" → si la respuesta es positiva, clara o contiene frases como "sí", "todo bien", "correcto", "así está bien", "gracias", "perfecto", "ok", "adelante", etc.
- "MODIFICAR" → si la respuesta sugiere algún cambio, duda, corrección, o si no está seguro.

Ejemplos:
"Sí, todo bien." → CONFIRMADO  
"Solo cambia la coca por una sprite." → MODIFICAR  
"Gracias, así está perfecto." → CONFIRMADO  
"Me equivoqué con la dirección." → MODIFICAR  
"Está bien así 😊" → CONFIRMADO

Respuesta ideal: (CONFIRMADO|MODIFICAR)
  `
  return PROMPT
}

// FLOWS
// This flow is used to confirm the order and get the verification code
const flowConfirm = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic, endFlow }) => {
    console.log('===== FLOW CONFIRM =====')
    const history = getHistoryParse(state as BotState)
    try {
      const verificationCode = await getAIResponse(findCodePrompt(history))
      const totalOrder = await getAIResponse(getTotalOrderPrompt(history))

      const orderDB = await prisma.order.findFirst({
        where: {
          shortId: verificationCode.toString().trim(),
          status: 'PENDING',
        },
        select: {
          id: true,
          shortId: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          address: true,
          comment: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
              promotion: {
                select: {
                  name: true,
                  promoPrice: true,
                },
              },
            },
          },
        },
      });


      console.log('verificationCode:', verificationCode.toString().trim())

      if (verificationCode.trim().toLowerCase() === 'no-code') {
        await flowDynamic(`Por favor realiza tu pedido en nuestro menú digital para tener un código de verificación. Aquí está el enlace:   

https://menu-digital-indol.vercel.app 😊`)

        await clearHistory(state as BotState)
        return endFlow()
      }

      if (verificationCode.trim() !== orderDB?.shortId) {
        await flowDynamic(`Parece que el código ha expirado. Por favor, realiza tu pedido en nuestro menú digital para tener un código de verificación actualizado. Aquí está el enlace:

https://menu-digital-indol.vercel.app 😊`)

        await clearHistory(state as BotState)
        return endFlow()
      }

      if (Number(totalOrder.trim()) !== orderDB?.totalPrice) {
        await flowDynamic(`Parece que tu pedido ha cambiado. Por favor, revisa tu pedido en nuestro menú digital para tener un código de verificación actualizado. Aquí está el enlace:

https://menu-digital-indol.vercel.app 😊`)
        await clearHistory(state as BotState)
        return endFlow()
      }

      // Format the order to send it to the AI
      const order = {
        ...orderDB,
        items: orderDB.items.map(item => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.product?.name || null,
          promotionName: item.promotion?.name || null,
        }))
      };

      await state.update({ order: order })
    } catch (error) {
      console.error('Error en el flujo de confirmación:', error)
      await flowDynamic(`Ocurrió un error al procesar tu pedido, por favor intenta de nuevo más tarde. 😊`)
      await clearHistory(state as BotState)
      return endFlow()
    }
  })
  .addAction(async (_, { flowDynamic, gotoFlow }) => {
    await flowDynamic('Perfecto, ahora solo necesito algunos datos antes de enviarlo 😊')

    return gotoFlow(flowAsks)
  })

// This flow is used to ask for the name, address and payment method of the user
// ==================================================================================
const flowAsks = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    await flowDynamic('¿Quién recibe?')
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
    const name = ctx.body
    await state.update({ name: name })

    // await handleHistory({ content: `Mi nombre es ${name}`, role: 'user' }, state as BotState)
    await flowDynamic(`Gracias, ¿Cuál es el domicilio de entrega?`, {
      delay: 1500
    })
    await flowDynamic('Por favor, incluye la calle, número, colonia y cualquier referencia que consideres importante. 🏠', {
      delay: 1500
    })
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
    const address = ctx.body
    await state.update({ address: address })

    // await handleHistory({ content: `Mi domicilio es ${address}`, role: 'user' }, state as BotState)

    await flowDynamic('Correcto, ¿Cuál es tu forma de pago? 💳', {
      delay: 1500
    })
    await flowDynamic('Aceptamos transferencia bancaria, efectivo y otros métodos de pago. Por favor, indícanos cuál prefieres. 😊', {
      delay: 1500
    })
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const paymentMethod = ctx.body
    const paymentMethodFormat = await getAIResponse(getPaymentMethod(paymentMethod))
    await state.update({ paymentMethod: paymentMethodFormat })

    if (paymentMethodFormat.trim().toLowerCase() === 'no-payment') {
      await flowDynamic(`Opción no reconocida. Por favor, escríbeme el número o nombre de la opción que prefieras. 😊`)
      return fallBack('1- Transferencia Bancaria\n2- Efectivo\n3- Tarjeta de Crédito/Débito\n4- Otro método de pago')
    }

    // await handleHistory({ content: `Mi forma de pago es ${paymentMethod}`, role: 'user' }, state as BotState)
    const history = getHistoryParse(state as BotState)
    console.log('Historial parseado in Asks:', history)
    console.log('============ end Historial parseado in Asks =================')
    const name = state.get('name')
    console.log('name:', name)
    const address = state.get('address')
    console.log('address:', address)
    const order = state.get('order')
    console.log('order:', order)

    const result = await getAIResponse(confirmOrderPrompt({
      history, name, address, paymentMethod: paymentMethodFormat, order
    }))
    await handleHistory({ content: result, role: 'assistant' }, state as BotState)
    console.log('Resultado:', result)

    await flowDynamic(result)
  }
  )
  .addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
    const confirmation = ctx.body

    await handleHistory({ content: confirmation, role: 'user' }, state as BotState)
    const history = getHistoryParse(state as BotState)

    const result = await getAIResponse(validateConfirmation(history))

    if (result.trim().toUpperCase() === 'CONFIRMADO') {
      let user
      //! Create or update the user in the database could be a utility function
      // create a new user if it doesn't exist
      user = await getUserByPhoneNumber(ctx.from)

      if (!user) {
        const newUser = await createUpdateUser({
          name: state.get('name'),
          phoneNumber: ctx.from
        })

        if (!newUser.ok) {
          {
            await flowDynamic(`Ocurrió un error al crear tu usuario, por favor intenta de nuevo más tarde. 😊`)
            await clearHistory(state as BotState)
            return endFlow()
          }
        }
        user = newUser.user
        await state.update({ newUser: user.id })
      }

      // Update the order in the database
      await prisma.order.update({
        where: {
          shortId: state.get('order').shortId
        },
        data: {
          userId: user.id,
          address: state.get('address'),
          comment: state.get('paymentMethod'),
          status: 'IN_PROGRESS'
        }
      })

      // Send message to the restaurant
      console.log('Enviando mensaje a la cocina...')
      await fetch(`${process.env.DOMAIN}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: '+5219811250049',
          message: `📦 Un cliente ha completado la demostración posiblemente este interesado.

Te dejo sus datos:
          
- Nombre: ${state.get('name')}
- Teléfono: ${ctx.from}
          `
          // message: `📦 Nuevo pedido confirmado de ${state.get('name')}.\nDirección: ${state.get('address')}\nMétodo de pago: ${state.get('paymentMethod')}`
        })
      })

      await flowDynamic('¡Perfecto! Tu pedido ha sido confirmado y ya esta siendo preparado. 😊', {
        delay: 1500
      })
      await flowDynamic('Tiempo estimado de entrega: 35 minutos. ⏳', {
        delay: 1500
      })

      await flowDynamic(`📌 Este pedido fue una simulación.

Así funcionaría con tus propios clientes si tienes tu propio menú digital. 😊
        `,
        {
          delay: 3000
        })

      if (state.get('newUser')) {
        await flowDynamic(`🎉 ¡Felicidades! Has completado la demo del menú digital exitosamente.`)
        await flowDynamic(`Como agradecimiento, aquí tienes tu código de descuento: *H0LA18* 🎁`)
        await flowDynamic(`Este código te da *$199 de descuento* en la compra de tu propio menú digital. Es válido hasta el *5 de junio de 2025*.`)
        await flowDynamic(`Si te interesa activarlo o tienes dudas, *mándame un mensaje* y con gusto te ayudo. ¡Gracias por probar la demo! 😊`)
      }

      await clearHistory(state as BotState)
      return endFlow()
    }

    if (result.trim().toUpperCase() === 'MODIFICAR') {
      await flowDynamic(`Para modificar tu pedido, por favor vuelve a nuestro menú digital y modifica tu pedido, luego haz click en el botón de *Pedir por WhatsApp* desde el carrito del menú digital:

https://menu-digita-indol.vercel.app 😊`)

      await flowDynamic(`Si quieres modificar los datos de entrega escribe "MODIFICAR" 😊`)

      return endFlow()
    }
  }
  )

// This flow is used to modify the delivery data, it should be used when the user wants to change the delivery data
// ==================================================================================
const flowModify = addKeyword('MODIFICAR')
  .addAction(async (_, { state, gotoFlow, endFlow, flowDynamic }) => {
    const order = await state.get('order')

    // If the order is not found, end the flow
    if (!order) {
      await flowDynamic(`Por favor realiza tu pedido en nuestro menú digital para tener un código de verificación. Aquí está el enlace:   

https://menu-digital-indol.vercel.app 😊`)

      await clearHistory(state as BotState)
      return endFlow()
    }

    return gotoFlow(flowAsks)
  })

export { flowConfirm, flowAsks, flowModify }
