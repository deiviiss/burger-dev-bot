// src/actions/branches/set-branch-phone.ts

import prisma from '@/lib/prisma'

export const setBranchPhoneNumber = async (label: string, mode: 'bot' | 'user') => {
  const branch = await prisma.branch.findUnique({
    where: { label }
  })

  if (!branch) {
    return { ok: false, message: 'Sucursal no encontrada' }
  }

  const phoneToSet = mode === 'bot' ? branch.phoneBot : branch.phoneUser

  if (!phoneToSet) {
    return { ok: false, message: `No se ha configurado el número para el modo ${mode}` }
  }

  await prisma.branch.update({
    where: { id: branch.id },
    data: { phone: phoneToSet }
  })

  return { ok: true, message: `Bot ${mode === 'bot' ? 'activado' : 'desactivado'} para ${label}` }
}
