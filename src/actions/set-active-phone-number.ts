import prisma from "@/lib/prisma";

export const setActivePhoneNumber = async (label: 'bot' | 'owner') => {
  try {
    await prisma.phoneNumberMenu.updateMany({
      data: { isActive: false },
    });

    await prisma.phoneNumberMenu.update({
      where: { label },
      data: { isActive: true },
    });
  } catch (error) {
    console.error("Error setting active phone number:", error);
    throw error;
  }
};
