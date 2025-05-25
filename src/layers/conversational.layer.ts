import { BotContext, BotMethods, BotState } from "@builderbot/bot/dist/types";
import { handleHistory } from "@/utils/handleHistory";

// Its function is to store in the state all the messages that the user writes
export default async ({ body }: BotContext, { state, }: BotMethods) => {
  await handleHistory({ content: body, role: 'user' }, state as BotState)
}