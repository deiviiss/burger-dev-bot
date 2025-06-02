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
    console.log('data', data)

    // Extract the response from the model
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Estoy teniendo problemas para responder a tu solicitud, por favor intenta de nuevo más tarde.'
  } catch (error) {
    console.error('Error al llamar a Gemini API:', error)
    return 'Hubo un problema al procesar tu solicitud.'
  }
}