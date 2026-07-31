import { z } from 'zod'

export const maintenanceSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  tenantName: z.string(),
  roomNumber: z.string(),
  issueTitle: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  assignedTo: z.string().nullable(),
})

export type MaintenanceRequest = z.infer<typeof maintenanceSchema>

export interface MaintenanceFilters {
  status?: string
  priority?: string
  search?: string
  page?: number
  size?: number
}