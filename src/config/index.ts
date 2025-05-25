import 'dotenv/config'

export const config = {
  PORT: process.env.PORT ?? 3008,
  //AI
  apiKey: process.env.API_KEY,
  url: process.env.URL
  //END AI
}