import { createFlow } from '@builderbot/bot'
import { mainFlow } from './welcomeFlow'
import { flowAsks, flowConfirm, flowModify } from './confirm.flow'
import { flowTalk } from './talk.flow'
import { flowOrder } from './order.flow'

export default createFlow([
  mainFlow,
  flowConfirm,
  flowTalk,
  flowOrder,
  flowAsks,
  flowModify
])