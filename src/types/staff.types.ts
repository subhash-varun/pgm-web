import { z } from 'zod'

export const staffSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  adminId: z.number(),
  role: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  createdAt: z.string(),
})

export type Staff = z.infer<typeof staffSchema>

export interface StaffFilters {
  adminId?: number
  page?: number
  size?: number
}

export interface StaffPageResponse {
  content: Staff[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}