import { prisma } from "../lib/prisma.ts"
import { generateId } from "../lib/nanoid.ts"

export const watchlistService = {
    getByUser: async (userId: string) => {
        return prisma.watchlist.findMany({
            where: {
                user_id: userId
            }
        })
    },
    getAllUniqueTickers: async () => {
        return await prisma.watchlist.findMany({
            distinct: ['ticker'],
            select: { ticker: true }
        })
    },
    getUsersByTicker: async (ticker: string) => {
        return await prisma.watchlist.findMany({
            where: {ticker},
            include: {user: true}
        })
    },
    addTicker: async (userId: string, ticker: string) => {
        const watchlistId = generateId()

        try {
            return await prisma.watchlist.create({
                data: {
                    watchlist_id: watchlistId,
                    user_id: userId,
                    ticker: ticker
                }
            })
        } catch (error: any) {
            if (error.code == 'P2002') {
                return { error: 'User already has this ticker'}
            }
            throw error
        }
    },
    hasTicker: async (userId: string, ticker: string) => {
        const exists = await prisma.watchlist.findUnique({
            where: {
                user_id_ticker: {
                    user_id: userId,
                    ticker: ticker
                }
            }
        })
        return !!exists
    },
    removeTicker: async (userId: string, ticker: string) => {
        try {
            return await prisma.watchlist.delete({
                where: {
                    user_id_ticker: {
                        user_id: userId,
                        ticker: ticker
                    }
                }
            })
        } catch (error: any) {
            if (error.code == 'P2025') {
                return { error: 'Ticker not found in watchlist'}
            }
            throw error
        }
    }
}