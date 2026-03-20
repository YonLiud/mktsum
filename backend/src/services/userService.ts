import { prisma } from "../lib/prisma.ts"
import { generateId } from "../lib/nanoid.ts"

export const userService = {
    getById: async (userId: string) => {
        return await prisma.user.findFirst({
            where: {
                user_id: userId
            }
        })
    },
    getAll: async () => {
        return await prisma.user.findMany()
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