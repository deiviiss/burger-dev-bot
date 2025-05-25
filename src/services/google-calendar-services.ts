import { format, addMinutes } from 'date-fns'

/**
 * get current calendar
 * @returns {Promise<string>}
 */

const getCurrentCalendar = async (): Promise<string> => {
  try {
    const response = await fetch('https://hook.us2.make.com/p3sennl4m2otlh2ls3tyxnhcwxw20vv2')
    if (!response.ok) throw new Error(`Error al obtener calendario: ${response.statusText}`)


    const json: { date: string }[] = await response.json()
    const list = json.map(({ date }) => {
      const startDate = new Date(date)

      if (isNaN(startDate.getTime())) {
        console.error(`[ERROR]: Fecha inválida recibida ->`, date)
        return 'Error: Fecha inválida'
      }

      const endDate = addMinutes(startDate, 210)

      return `Espacio reservado (no disponible): Desde ${format(startDate, 'yyyy-MM-dd h:mm a')} Hasta ${format(endDate, 'yyyy-MM-dd h:mm a')}`
    }).join('\n')

    return list
  } catch (err) {
    console.error(`[ERROR]:`, err.message || err, err.stack)
    return 'No se pudo obtener el calendario'
  }
}

/**
 * add to calendar
 * @param text JSON string
 * @returns {Promise<Response | void>}
 */

const appToCalendar = async (text: string): Promise<Response | void> => {
  try {
    const cleanText = text.replace(/```json|```/g, '').trim()

    if (!text || typeof text !== 'string') {
      console.error(`[ERROR]: Entrada inválida para JSON.parse ->`, text)
      return
    }

    const payload = JSON.parse(cleanText)

    const response = await fetch('https://hook.us2.make.com/gk770dn31quf389187ieyouplcoxcysa', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error(`Error al agregar evento: ${response.statusText}`)

    return response
  } catch (err) {
    console.error(`[ERROR]:`, err.message || err, err.stack)
  }
}

export { getCurrentCalendar, appToCalendar }