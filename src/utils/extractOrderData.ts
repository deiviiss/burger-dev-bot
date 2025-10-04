import { getAIResponse } from "@/services/ai-services";

/**
* Utilities to extract data from the pre-formatted digital menu message
*/

// Prompt to extract the verification code from the message
export const extractVerificationCodePrompt = (message: string) => `
Eres un asistente especializado en extraer códigos de verificación de pedidos de menú digital.

El mensaje del usuario SÍ contiene un pedido preformateado con información estructurada que incluye:
- Productos pedidos
- Total del pedido
- Código de verificación en formato: "Código de verificación: BD-XXXXX"
- Datos del cliente (nombre, dirección, método de pago)

Tu tarea es revisar si el mensaje del usuario contiene un pedido generado desde el sistema, lo cual se identifica por un ID que sigue el formato: "Código de verificación: BD-FTJE29" de una estructura de pedido como:

🛒 Nuevo Pedido

Código de verificación: BD-FTJE29

1x Helado de Vainilla - $35.00

1x 2 Hot Dogs por $50 - $50.00

Total: $85.00

------
Tipo de pedido: Domicilio

📍 Dirección: Nuevo León 21, Fidel Velázquez, 24023 San Francisco de Campeche, Camp., México
🗺 Referencia: Casa azul frente al parque
📍 Ubicación: https://www.google.com/maps?q=19.8664671,-90.4928949

👤 Recibe: David
📞 Teléfono: 9811250049
💳 Pago: Efectivo

¡Gracias por tu pedido! Por favor, presiona el botón de enviar mensaje para continuar.

INSTRUCCIONES IMPORTANTES:
- Busca específicamente el texto "Código de verificación: BD-" seguido de caracteres alfanuméricos
- Extrae SOLO los caracteres que vienen después de "BD-" (ejemplo: si ves "BD-FTJE29", responde "FTJE29")
- No incluyas "BD-" en tu respuesta
- Si encuentras el código, responde únicamente con él (ejemplo: "FTJE29")
- Si NO encuentras ningún código de verificación en el formato correcto, responde exactamente "no-code"

Mensaje del usuario:
${message}

Respuesta (solo el código o "no-code"):
`;

// Prompt to extract the client name from the message
export const extractCustomerNamePrompt = (message: string) => `
Eres un asistente especializado en extraer el nombre del cliente de pedidos de menú digital.

El mensaje del usuario SÍ contiene información estructurada del cliente en formato:
"Cliente: [Nombre del cliente]"

INSTRUCCIONES IMPORTANTES:
- Busca específicamente el texto "Cliente:" seguido del nombre
- Extrae SOLO el nombre completo del cliente (todo lo que viene después de "Cliente: ")
- Si encuentras el nombre, responde únicamente con él
- Si NO encuentras el patrón "Nombre del cliente:", busca el patrón "Recibe:" y responde únicamente con él
- Si NO encuentras el patrón "Cliente:" o "Recibe:", responde exactamente "no-name"

Mensaje del usuario:
${message}

Respuesta (solo el nombre o "no-name"):
`;

// Prompt to extract the delivery address from the message
export const extractDeliveryAddressPrompt = (message: string) => `
Eres un asistente especializado en extraer la dirección de entrega de pedidos de menú digital.

El mensaje del usuario SÍ contiene información estructurada de entrega en formato:
"Dirección: [Dirección completa]"

INSTRUCCIONES IMPORTANTES:
- Busca específicamente el texto "Dirección:" seguido de la dirección
- Extrae SOLO la dirección completa (todo lo que viene después de "Dirección: ")
- Si encuentras la dirección, responde únicamente con ella
- Si NO encuentras el patrón "Dirección:", responde exactamente "no-address"

Mensaje del usuario:
${message}

Respuesta (solo la dirección o "no-address"):
`;

// Prompt to extract the payment method from the message
export const extractPaymentMethodPrompt = (message: string) => `
Eres un asistente especializado en extraer el método de pago de pedidos de menú digital.

El mensaje del usuario SÍ contiene información estructurada de pago en formato:
"Pago: [Método de pago]"

MÉTODOS DE PAGO VÁLIDOS:
- Efectivo
- Transferencia

INSTRUCCIONES IMPORTANTES:
- Busca específicamente el texto "Pago:" seguido del método de pago
- Extrae SOLO el método de pago (todo lo que viene después de "Pago: ")
- Si encuentras el método de pago, responde únicamente con él
- Si NO encuentras el patrón "Pago:", responde exactamente "no-payment"

Mensaje del usuario:
${message}

Respuesta (solo el método de pago o "no-payment"):
`;

// Prompt to extract the order type from the message
export const extractOrderTypePrompt = (message: string) => `
Eres un asistente especializado en extraer el tipo de pedido de un mensaje de menú digital.

El mensaje del usuario SÍ contiene información estructurada en formato:
"Tipo de pedido: Domicilio" o "Tipo de pedido: Para pasar a recoger"

INSTRUCCIONES IMPORTANTES:
- Busca específicamente el texto "Tipo de pedido:" seguido del tipo
- Extrae SOLO el tipo de pedido ("Domicilio" o "Para pasar a recoger")
- Si encuentras el tipo, responde únicamente con él
- Si NO encuentras el patrón, responde exactamente "no-type"

Mensaje del usuario:
${message}

Respuesta (solo el tipo o "no-type"):
`;

export async function extractOrderType(message: string): Promise<string> {
  try {
    const orderType = await getAIResponse(extractOrderTypePrompt(message));
    return orderType.trim().toLowerCase() === 'no-type' ? '' : orderType.trim();
  } catch (error) {
    console.error('Error extrayendo tipo de pedido:', error);
    return '';
  }
}

// Function to extract verification code
export async function extractVerificationCode(message: string): Promise<string> {
  try {
    const code = await getAIResponse(extractVerificationCodePrompt(message));
    return code.trim().toLowerCase() === 'no-code' ? '' : code.trim();
  } catch (error) {
    console.error('Error extrayendo código de verificación:', error);
    return '';
  }
}

// Function to extract client name
export async function extractCustomerName(message: string): Promise<string> {
  try {
    const name = await getAIResponse(extractCustomerNamePrompt(message));
    return name.trim().toLowerCase() === 'no-name' ? '' : name.trim();
  } catch (error) {
    console.error('Error extrayendo nombre del cliente:', error);
    return '';
  }
}

// Function to extract delivery address
export async function extractDeliveryAddress(message: string): Promise<string> {
  try {
    const address = await getAIResponse(extractDeliveryAddressPrompt(message));
    return address.trim().toLowerCase() === 'no-address' ? '' : address.trim();
  } catch (error) {
    console.error('Error extrayendo dirección:', error);
    return '';
  }
}

// Function to extract payment method
export async function extractPaymentMethod(message: string): Promise<string> {
  try {
    const payment = await getAIResponse(extractPaymentMethodPrompt(message));
    return payment.trim().toLowerCase() === 'no-payment' ? '' : payment.trim();
  } catch (error) {
    console.error('Error extrayendo método de pago:', error);
    return '';
  }
}

// Function to extract all order data from the message
export async function extractAllOrderData(message: string) {
  const [verificationCode, customerName, deliveryAddress, paymentMethod, orderType] = await Promise.all([
    extractVerificationCode(message),
    extractCustomerName(message),
    extractDeliveryAddress(message),
    extractPaymentMethod(message),
    extractOrderType(message)
  ]);

  const needsAddress = orderType.toLowerCase().includes("domicilio");
  const isComplete = !!(
    verificationCode &&
    customerName &&
    paymentMethod &&
    (needsAddress ? deliveryAddress : true)
  );

  return {
    verificationCode,
    customerName,
    deliveryAddress,
    paymentMethod,
    orderType,
    isComplete
  };
}