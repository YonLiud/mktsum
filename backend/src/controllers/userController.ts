import { prisma } from '../lib/prisma.js'

export const userController = {
  getAll: async () => {
    return await prisma.user.findMany({
      include: {
        watchlist: true,
        briefing: true,
      },
    })
  },

  getOne: async (userId: number) => {
    return await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        watchlist: true,
        briefing: true,
      },
    })
  },

  create: async (data: { name: string; ntfy_topic: string }) => {
    return await prisma.user.create({
      data,
    })
  },

  update: async (userId: number, data: Partial<{ name: string; ntfy_topic: string }>) => {
    return await prisma.user.update({
      where: { user_id: userId },
      data,
    })
  },

  delete: async (userId: number) => {
    return await prisma.user.delete({
      where: { user_id: userId },
    })
  },
}
