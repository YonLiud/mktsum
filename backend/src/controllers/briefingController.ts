import { prisma } from '../lib/prisma.js'

export const briefingController = {
  getAll: async () => {
    return await prisma.briefing.findMany({
      include: {
        user: true,
      },
    })
  },

  getOne: async (briefingId: number) => {
    return await prisma.briefing.findUnique({
      where: { briefing_id: briefingId },
      include: {
        user: true,
      },
    })
  },

  getByIdentifier: async (identifier: string) => {
    return await prisma.briefing.findUnique({
      where: { identifier },
      include: {
        user: true,
      },
    })
  },

  create: async (data: { user_id: number; full_summary: string; short_summary: string }) => {
    return await prisma.briefing.create({
      data,
    })
  },

  update: async (briefingId: number, data: Partial<{ full_summary: string; short_summary: string }>) => {
    return await prisma.briefing.update({
      where: { briefing_id: briefingId },
      data,
    })
  },

  delete: async (briefingId: number) => {
    return await prisma.briefing.delete({
      where: { briefing_id: briefingId },
    })
  },
}
