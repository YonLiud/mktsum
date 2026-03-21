import { prisma } from "../lib/prisma.ts"
import { generateId } from "../lib/nanoid.ts"

export const briefingService = {
    getAll: async () => {
        return await prisma.briefing.findMany()        
    },
    getById: async (briefingId: string) => {
        return await prisma.briefing.findUnique({
            where: {
                briefing_id: briefingId
            }
        })
    },
    getByUser: async (userId: string) => {
        return await prisma.briefing.findMany({
            where: {user_id: userId}
        })
    },
    getLatestByUser: async (userId: string) => {
        return await prisma.briefing.findFirst({
            where: {user_id: userId},
            orderBy: {created_at: 'desc'}
        })
    },
    create: async (data: { user_id: string, full_summary: string, short_summary: string, sources?: string }) => {
        const briefingId = generateId()

        return await prisma.briefing.create({
            data: {
                briefing_id: briefingId,
                ...data
            }
        })
    },
    update: async (briefingId: string, data: Partial<{ full_summary: string; short_summary: string; sources: string }>) => {
        return await prisma.briefing.update({
            where: { briefing_id: briefingId },
            data
        })
    },

    delete: async (briefingId: string) => {
        return await prisma.briefing.delete({
            where: { briefing_id: briefingId }
        })
    }

}