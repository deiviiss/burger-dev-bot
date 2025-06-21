'use server'

import { z } from "zod"
import prisma from "@/lib/prisma"

// Zod schema for user creation/update
const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phoneNumber: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"),
})

type InputUser = z.infer<typeof userSchema>

export const createUpdateUser = async (input: InputUser) => {
  const userParsed = userSchema.safeParse(input)

  if (!userParsed.success) {
    return {
      ok: false,
      message: 'Datos inválidos',
    }
  }

  const { id, name, phoneNumber } = userParsed.data

  try {

    if (id) {
      const userUpdated = await prisma.user.update({
        where: { id },
        data: {
          name,
          phoneNumber,
        }
      })

      return {
        ok: true,
        message: "Usuario actualizado con éxito",
        user: userUpdated
      }
    }

    const userCreated = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        createdAt: new Date(),
      }
    })

    return {
      ok: true,
      message: "Usuario creado con éxito",
      user: userCreated
    }

  } catch (error) {
    return {
      ok: false,
      message: "Ocurrió un error inesperado, por favor intente de nuevo",
    }
  }
}
