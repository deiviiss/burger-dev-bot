import { FlowValue } from "@/interfaces/types"
import { BotState } from "@builderbot/bot/dist/types"

const handleCurrentFlowState = async (flow: FlowValue, _state: BotState) => {
  await _state.update({ currentFlow: flow })
}

const getCurrentFlow = (_state: BotState): FlowValue | undefined => {
  return _state.get<FlowValue>('currentFlow')
}

const clearCurrentFlow = async (_state: BotState) => {
  await _state.update({ currentFlow: undefined }) // o usa delete si es necesario
}


export { handleCurrentFlowState, getCurrentFlow, clearCurrentFlow }