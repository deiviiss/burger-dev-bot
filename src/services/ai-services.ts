import { config } from "../config"
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: config.apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gemini-2.5-flash", // o gemini-2.5-pro si necesitas más precisión
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response from the model
    return response.choices[0]?.message?.content || "Sin respuesta del modelo.";
  } catch (error) {
    console.error('Error al llamar a Gemini API:', error)
    return 'Hubo un problema al procesar tu solicitud.'
  }
}

/**
 * Parses an image (base64) with Gemini and returns the model's response.
* Example use: Check if a bank slip is valid.
 */
export async function getAIResponseImage(base64: string, data: {
  ownerName: string;
  cardEnding: string;
  total: number;
}): Promise<string> {
  const prompt = `
Eres un asistente experto en validación de comprobantes bancarios. 
Analiza la siguiente imagen y verifica lo siguiente:

1. ¿La imagen parece un comprobante bancario o de transferencia real?
2. ¿El nombre del titular en el comprobante coincide o se parece a: "${data.ownerName}"?
3. ¿Se puede leer una terminación de tarjeta (últimos dígitos) que coincida con: "${data.cardEnding}"?
4. ¿El monto transferido es igual o muy cercano a $${data.total.toFixed(2)} MXN?

Responde exclusivamente en formato JSON con las siguientes claves:

{
"is_receipt": true | false,
"valid_name": true | false,
"valid_account": true | false,
"valid_amount": true | false,
"message": "breve explicación en español de los hallazgos"
}

No inventes datos si no puedes leerlos con claridad. 
Si el texto está borroso o incompleto, marca los campos dudosos como false.
`;
  try {
    const response = await client.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const output =
      response.choices[0]?.message?.content?.trim().toLowerCase() || "error";


    return output;
  } catch (error) {
    console.error("Error al llamar a Gemini API (imagen):", error);
    return "error";
  }
}