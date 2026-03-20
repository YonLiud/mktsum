import { prisma } from '../lib/prisma.js'

export const watchlistController = {
  getAll: async () => {
    return await prisma.watchlist.findMany({
      include: {
        user: true,
      },
    })
  },

  getOne: async (watchlistId: number) => {
    return await prisma.watchlist.findUnique({
      where: { watchlist_id: watchlistId },
      include: {
        user: true,
      },
    })
  },

  create: async (data: { user_id: number; ticker: string }) => {
    return await prisma.watchlist.create({
      data,
    })
  },

  update: async (watchlistId: number, data: Partial<{ ticker: string }>) => {
    return await prisma.watchlist.update({
      where: { watchlist_id: watchlistId },
      data,
    })
  },

  delete: async (watchlistId: number) => {
    return await prisma.watchlist.delete({
      where: { watchlist_id: watchlistId },
    })
  },
}
