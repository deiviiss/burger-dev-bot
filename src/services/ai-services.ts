import { config } from "../config"

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${config.url}${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()

    // Extract the response from the model
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Estoy teniendo problemas para responder a tu solicitud, por favor intenta de nuevo más tarde.'
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
    const response = await fetch(`${config.url}${config.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error en Gemini API:", data);
      return "error";
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ||
      "error";

    return output;
  } catch (error) {
    console.error("Error al llamar a Gemini API (imagen):", error);
    return "error";
  }
}