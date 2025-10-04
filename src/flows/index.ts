import { createFlow } from '@builderbot/bot'
import { mainFlow } from './welcomeFlow'
import { flowConfirm, flowConfirmOrder, flowOrderComplete, flowTransfer } from './confirm.flow'
import { flowTalk } from './talk.flow'
import { flowOrder } from './order.flow'

// ⚠️ ACTUALIZADO: Flujos optimizados - ya no necesitamos flowAsks, flowCashSelect, flowTransferSelect
export default createFlow([
  mainFlow,
  flowConfirm,
  flowTalk,
  flowOrder,
  flowConfirmOrder,
  flowOrderComplete,
  flowTransfer
])