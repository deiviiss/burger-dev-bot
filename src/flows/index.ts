import { createFlow } from '@builderbot/bot'
import { mainFlow } from './welcomeFlow'
import { flowAsks, flowCashSelect, flowConfirm, flowConfirmOrder, flowModify, flowTransferSelect } from './confirm.flow'
import { flowTalk } from './talk.flow'
import { flowOrder } from './order.flow'
import { catchAllMediaFlow } from './catch.all.media.flow'

export default createFlow([
  mainFlow,
  flowConfirm,
  flowTalk,
  flowOrder,
  flowAsks,
  flowModify,
  catchAllMediaFlow,
  flowConfirmOrder,
  flowCashSelect,
  flowTransferSelect
])