import { getAIResponse, getAIResponseImage } from "@/services/ai-services";
import { clearHistory, handleHistory, getHistoryParse } from "@/utils/handleHistory";
import { addKeyword, EVENTS } from "@builderbot/bot";
import { BotState } from "@builderbot/bot/dist/types";
import prisma from "@/lib/prisma";
import { createUpdateUser } from "@/actions/users/create-update-user";
import { getUserByPhoneNumber } from "@/actions/users/get-user-by-phone-number";
import { extractAllOrderData } from "@/utils/extractOrderData";
import fs from "fs/promises";
import path from "path";
import os from "os";


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
--- FIN DEL PEDIDO ---

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


//====================== FLOWS ======================

// This flow is used to confirm the verification code and get the order
const flowConfirm = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic, endFlow, gotoFlow }) => {
    const history = getHistoryParse(state as BotState)

    try {
      // Extract all data from the preformatted message
      const orderData = await extractAllOrderData(history)

      if (!orderData.isComplete) {
        await flowDynamic(`No pudimos encontrar todos los datos necesarios en tu mensaje. Por favor, realiza tu pedido nuevamente desde el menú digital para incluir nombre, dirección y método de pago.`, { delay: 1000 })
        await flowDynamic(`https://burgerdev-demo.vercel.app 😊`, { delay: 1000 })
        await clearHistory(state as BotState)
        return endFlow()
      }

      // Search the order in the database using the verification code
      const orderDB = await prisma.order.findFirst({
        where: {
          shortId: orderData.verificationCode,
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

      if (!orderDB) {
        await flowDynamic(`No encontramos tu pedido con el código ${orderData.verificationCode}. Por favor, realiza uno nuevo en nuestro menú digital:`, { delay: 1000 })
        await flowDynamic(`https://burgerdev-demo.vercel.app 😊`, { delay: 1000 })
        await clearHistory(state as BotState)
        return endFlow()
      }

      //? Esta validación no se necesita? ya que el código de verificación ya se valido al consultar la base de datos con el código
      // Validate that the code matches
      if (orderData.verificationCode !== orderDB?.shortId) {
        await flowDynamic(`El código de verificación no coincide con nuestro registro. Por favor, realiza tu pedido en nuestro menú digital para tener un código de verificación actualizado.`, { delay: 1000 })

        await flowDynamic(`https://burgerdev-demo.vercel.app 😊`, { delay: 1000 })
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

      // Save all extracted data to the state
      await state.update({
        order: order,
        name: orderData.customerName,
        address: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        orderType: orderData.orderType,
      })

      // Go directly to the final confirmation flow
      return gotoFlow(flowConfirmOrder)
    } catch (error) {
      console.error('❌ Error en el flujo de confirmación:', error)
      await flowDynamic(`Ocurrió un error al procesar tu pedido, por favor intenta de nuevo más tarde. 😊`, { delay: 1000 })
      await clearHistory(state as BotState)
      return endFlow()
    }
  })

const flowConfirmOrder = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic, state }) => {
    const history = getHistoryParse(state as BotState)
    const name = state.get('name')
    const address = state.get('address')
    const paymentMethod = state.get('paymentMethod')
    const order = state.get('order')

    const summary = await getAIResponse(confirmOrderPrompt({
      history, name, address, paymentMethod, order
    }))

    await handleHistory({ content: summary, role: 'assistant' }, state as BotState)

    await flowDynamic(summary)
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow, fallBack, gotoFlow }) => {
    const confirmation = ctx.body

    if (confirmation.includes('_event_')) {
      await flowDynamic(`No puedo procesar imágenes, audios, archivos o mensajes especiales en este paso. 🙈`, {
        delay: 1000
      });
      await flowDynamic(`Por favor, responde si todo está correcto o si deseas modificar algo. 😊`, {
        delay: 1000
      });

      return fallBack()
    }

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

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          name: state.get('name')
        }
      })


      if (state.get('paymentMethod').toLowerCase().includes('transferencia')) {

        return gotoFlow(flowTransferPayment)
      }

      if (state.get('paymentMethod').toLowerCase().includes('efectivo')) {
        return gotoFlow(flowCashPayment)
      }

      return gotoFlow(flowOrderComplete)
    }

    if (result.trim().toUpperCase() === 'MODIFICAR') {
      await flowDynamic(`Para modificar tu pedido, por favor vuelve a nuestro menú digital y modifica tu pedido, luego haz click en el botón de *Pedir por WhatsApp* desde el carrito del menú digital:

https://burgerdev-demo.vercel.app 😊`)

      return endFlow()
    }
  }
  )

const flowTransferPayment = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {

    await flowDynamic(`Aquí tienes los datos bancarios para realizar tu transferencia:

        Banco: Santander
        Cuenta: 0123456789
        CLABE: 012345678901234567
        Titular: Burger Bot Demo

Por favor, realiza la transferencia y envíame el comprobante. 😊`)
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, fallBack, gotoFlow, state, provider }) => {
    const confirmation = ctx.body?.trim()?.toLowerCase() || '';

    // Detect message type
    const isImage = !!ctx.message?.imageMessage;
    const isText = !!ctx.message?.conversation || !!ctx.message?.extendedTextMessage;

    //! Uncomment in production
    // console.log('Tipo de mensaje:', {
    //   type: isImage ? 'imagen' : isText ? 'texto' : 'otro',
    //   confirmation
    // });

    // Cancel order
    if (isText && confirmation === 'cancelar') {
      // TODO: update model order
      await flowDynamic('Pedido cancelado 😊', { delay: 1000 });
      await flowDynamic(`Si deseas hacer un nuevo pedido, puedes volver a nuestro menú digital:

https://burgerdev-demo.vercel.app 😊`);
      await flowDynamic('Hasta luego!');
      return;
    }

    // If text but not "cancelar", ask for image again
    if (isText && confirmation !== 'cancelar') {
      await flowDynamic(
        `Por favor, envíame el comprobante como imagen o escribe "Cancelar" para detener el pedido. 😊`,
        { delay: 1000 }
      );
      return fallBack();
    }

    // Process image
    if (isImage) {
      await flowDynamic('Dame un momento para validar la transferencia...', { delay: 2000 });

      try {
        // const imageUrl = ctx.message.imageMessage.url;

        // Save the image in a temporary folder (according to the official doc)
        const localPath = await provider.saveFile(ctx, { path: "./tmp" });
        // console.log("📸 Archivo guardado en:", localPath);

        // Read the image and convert it to base64
        const imageBuffer = await fs.readFile(localPath);
        // console.log("📸 Imagen leída:", imageBuffer);
        const base64 = imageBuffer.toString('base64');

        // Process image with AI
        const rta = await getAIResponseImage(base64, {
          ownerName: "Carlos David Hilera Ramirez",
          cardEnding: "0967",
          total: state.get("order")?.totalPrice || 0,
        })

        let result: {
          is_receipt: boolean;
          valid_name: boolean;
          valid_account: boolean;
          valid_amount: boolean;
          message: string;
        };
        try {
          const cleanJson = rta
            .replace(/^[\s\n\r]+|[\s\n\r]+$/g, "")
            .replace(/```json|```/g, "")
            .replace(/\n/g, " ")

          result = JSON.parse(cleanJson);
        } catch {
          await flowDynamic("❌ No pude interpretar el comprobante. Inténtalo de nuevo, por favor.");
          return fallBack();
        }

        const { is_receipt, valid_name, valid_account, valid_amount } = result;

        // If the image doesn't look like a bank receipt
        if (!is_receipt) {
          await flowDynamic("❌ La imagen no parece un comprobante bancario. Por favor, verifica que sea la captura correcta.");
          await fs.unlink(localPath);
          return fallBack();
        }

        // If some data is missing
        if (!valid_name || !valid_account || !valid_amount) {
          const issues = [];

          if (!valid_name) issues.push("el nombre del titular");
          if (!valid_account) issues.push("la cuenta bancaria");
          if (!valid_amount) issues.push("el monto de la transferencia");

          await flowDynamic(`❌ Detecté que ${issues.join(" y ")} no coincide con los datos del negocio.`);
          await flowDynamic(`Por favor, revisa tu comprobante o vuelve a enviarlo si fue un error. 😊`);
          await fs.unlink(localPath);
          return fallBack();
        }

        // Everything is valid
        await state.update({ paymentMethod: 'Transferencia Bancaria' });
        await flowDynamic('✅ El comprobante ha sido validado correctamente.');

        // Send message to the restaurant
        await provider.sendMessage(
          '+5219811250049',
          `📦 Nuevo comprobante de ${state.get('name')}.\n` +
          `✅ Validado automáticamente por el sistema.`,
          {
            media: localPath
          }
        )

        await fs.unlink(localPath);

        return gotoFlow(flowOrderComplete);
      } catch (error) {
        console.error('Error al procesar el comprobante:', error);
        await flowDynamic('😓 Tuvimos un problema al analizar el comprobante. Inténtalo de nuevo más tarde.');
        return fallBack();
      }
    }

    // Reject audios, locations or documents and other types of messages
    await flowDynamic(`No puedo procesar ese tipo de mensaje en este paso. 🙈`, {
      delay: 1000
    });
    await flowDynamic(`Por favor, envíame el comprobante como imagen o escribe "Cancelar" para detener el pedido. 😊`, {
      delay: 1000
    });

    return fallBack();
  });

const flowCashPayment = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    await flowDynamic('¿Con cuánto pagas? 💰')
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
    const amount = ctx.body

    if (amount.includes('_events_')) {
      await flowDynamic(`No puedo procesar imágenes, audios o archivos en este paso. 🙈`, {
        delay: 1000
      });

      await flowDynamic(`Por favor, escribe con cuanto pagas en números. ✍️`, {
        delay: 1000
      });

      return fallBack()
    }

    // Parse and validate amount as a number
    const parsedAmount = parseFloat(amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
    const total = state.get('order')?.totalPrice || 0

    if (isNaN(parsedAmount)) {
      await flowDynamic(`Por favor, escribe con cuanto pagas en números. Ejemplo: 200 o 200.00 ✍️`, {
        delay: 1000
      });
      return fallBack();
    }

    // Validate that the amount is less than the total
    if (parsedAmount < total) {
      await flowDynamic(`El monto que indicaste ($${parsedAmount.toFixed(2)}) es menor al total del pedido ($${total.toFixed(2)}). 😅`, { delay: 1000 })
      await flowDynamic(`Por favor, indica un monto mayor. ✍️`, { delay: 1000 })
      // await flowDynamic(`Por favor, confirma si fue un error de escritura o si deseas cancelar el pedido.`, { delay: 1000 })
      return fallBack()
    }

    await state.update({ amountCash: parsedAmount });

    return gotoFlow(flowOrderComplete);
  })

const flowOrderComplete = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic, state, provider }) => {
    await flowDynamic('¡Perfecto! Tu pedido ha sido confirmado y ya esta siendo preparado. 😊', {
      delay: 1500
    })

    // condition order type
    if (state.get('orderType') === 'Para pasar a recoger') {
      await flowDynamic('Puedes pasar por tu pedido en 25 minutos. ⏳', {
        delay: 1500
      })
    }

    if (state.get('orderType') === 'Domicilio') {
      await flowDynamic('Tiempo estimado de entrega: 45 minutos. ⏳', {
        delay: 1500
      })
    }

    await flowDynamic(`Hasta luego 👋`,
      {
        delay: 1000
      })

    // Send message to the restaurant
    await provider.sendMessage(
      '+5219811250049',
      `📦 Pedido confirmado de ${state.get('name')}.\n${state.get('address') !== '' ? `🏠 Dirección: ${state.get('address')}\n` : '🛍️ Para pasar a recoger'}\n💳 Método de pago: ${state.get('paymentMethod')}`
      ,
      { media: null }
    )

    await clearHistory(state as BotState)
    return
  })

export { flowConfirm, flowConfirmOrder, flowOrderComplete, flowTransferPayment, flowCashPayment }
