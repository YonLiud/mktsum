import { prisma } from "../lib/prisma.ts"
import { generateId } from "../lib/nanoid.ts"

class ValidationError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export const briefingService = {
    validateCreate: (data: any) => {
        const { user_id, full_summary, short_summary, sources, notif_sent } = data

        if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
            throw new ValidationError(400, 'Invalid or missing user_id')
        }

        if (!full_summary || typeof full_summary !== 'string' || full_summary.trim().length === 0) {
            throw new ValidationError(400, 'Invalid or missing full_summary')
        }

        if (!short_summary || typeof short_summary !== 'string' || short_summary.trim().length === 0) {
            throw new ValidationError(400, 'Invalid or missing short_summary')
        }

        const validated: any = {
            user_id: user_id.trim(),
            full_summary: full_summary.trim(),
            short_summary: short_summary.trim(),
        }

        if (sources !== undefined) {
            if (Array.isArray(sources)) {
                validated.sources = JSON.stringify(sources)
            } else if (typeof sources === 'string') {
                validated.sources = sources.trim()
            } else {
                throw new ValidationError(400, 'Invalid sources format')
            }
        }

        if (notif_sent !== undefined) {
            if (typeof notif_sent === 'string') {
                if (notif_sent !== 'true' && notif_sent !== 'false') {
                    throw new ValidationError(400, 'notif_sent must be a boolean or "true"/"false"')
                }
                validated.notif_sent = notif_sent === 'true'
            } else if (typeof notif_sent === 'boolean') {
                validated.notif_sent = notif_sent
            } else {
                throw new ValidationError(400, 'Invalid notif_sent format')
            }
        }

        return validated
    },

    validateUpdate: (data: any) => {
        const { full_summary, short_summary, sources, notif_sent } = data
        const updates: any = {}

        if (full_summary !== undefined) {
            if (typeof full_summary !== 'string' || full_summary.trim().length === 0) {
                throw new ValidationError(400, 'Invalid full_summary')
            }
            updates.full_summary = full_summary.trim()
        }

        if (short_summary !== undefined) {
            if (typeof short_summary !== 'string' || short_summary.trim().length === 0) {
                throw new ValidationError(400, 'Invalid short_summary')
            }
            updates.short_summary = short_summary.trim()
        }

        if (sources !== undefined) {
            if (Array.isArray(sources)) {
                updates.sources = JSON.stringify(sources)
            } else if (typeof sources === 'string') {
                updates.sources = sources.trim()
            } else {
                throw new ValidationError(400, 'Invalid sources format')
            }
        }

        if (notif_sent !== undefined) {
            if (typeof notif_sent === 'string') {
                if (notif_sent !== 'true' && notif_sent !== 'false') {
                    throw new ValidationError(400, 'notif_sent must be a boolean or "true"/"false"')
                }
                updates.notif_sent = notif_sent === 'true'
            } else if (typeof notif_sent === 'boolean') {
                updates.notif_sent = notif_sent
            } else {
                throw new ValidationError(400, 'Invalid notif_sent format')
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new ValidationError(400, 'No valid fields to update')
        }

        return updates
    },
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
    create: async (data: { user_id: string, full_summary: string, short_summary: string, sources?: string, notif_sent?: boolean }) => {
        const briefingId = generateId()

        return await prisma.briefing.create({
            data: {
                briefing_id: briefingId,
                ...data
            }
        })
    },
    update: async (briefingId: string, data: Partial<{ full_summary: string; short_summary: string; sources: string; notif_sent: boolean }>) => {
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