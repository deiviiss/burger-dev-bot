import { User } from "@/utils/types";
import prisma from "@/lib/prisma";

export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by phone number:", error);
    return null;
  }
}