import { prisma } from "../lib/prisma.ts"
import { generateId } from "../lib/nanoid.ts"

class ValidationError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export const userService = {
    validateCreate: (data: any) => {
        const { name, ntfy_topic } = data

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ValidationError(400, 'Invalid or missing name')
        }

        if (!ntfy_topic || typeof ntfy_topic !== 'string' || ntfy_topic.trim().length === 0) {
            throw new ValidationError(400, 'Invalid or missing ntfy_topic')
        }

        return {
            name: name.trim(),
            ntfy_topic: ntfy_topic.trim(),
        }
    },

    validateUpdate: (data: any) => {
        const updates: any = {}

        if (data.name !== undefined) {
            if (typeof data.name !== 'string' || data.name.trim().length === 0) {
                throw new ValidationError(400, 'Invalid name')
            }
            updates.name = data.name.trim()
        }

        if (data.ntfy_topic !== undefined) {
            if (typeof data.ntfy_topic !== 'string' || data.ntfy_topic.trim().length === 0) {
                throw new ValidationError(400, 'Invalid ntfy_topic')
            }
            updates.ntfy_topic = data.ntfy_topic.trim()
        }

        if (Object.keys(updates).length === 0) {
            throw new ValidationError(400, 'No valid fields to update')
        }

        return updates
    },
    getById: async (userId: string) => {
        return await prisma.user.findFirst({
            where: {
                user_id: userId
            },
            include: {
                briefing: true,
                watchlist: true
            }
        })
    },
    getTickers: async (userId: string) => {
        return await prisma.watchlist.findMany({
            where: {
                user_id: userId
            },
            select: {
                ticker: true
            }
        })
    },
    getAll: async () => {
        return await prisma.user.findMany()
    },
    getAllWithTickers: async () => {
        return await prisma.user.findMany({
            include: {
                watchlist: {
                    select: {
                        ticker: true
                    }
                }
            }
        })
    },
    create: async (data: { name: string; ntfy_topic: string}) => {
        const userId = generateId()
        return await prisma.user.create({
            data: {
                user_id: userId,
                ...data
            }
        })
    },
    update: async (userId: string, data: Partial<{ name: string; ntfy_topic: string }>) => {
        return await prisma.user.update({
            where: {user_id: userId}, data
        })
    },

    delete: async (userId: string) => {
        return await prisma.user.delete({
            where: {user_id: userId}
        })
    }

}