// src/types/tenant.types.ts
import { z } from 'zod'

export const tenantSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  roomNumber: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  idProofType: z.string(),
  idProofNumber: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string().nullable(),
  depositAmount: z.number(),
  status: z.enum(['ACTIVE', 'MOVED_OUT']),
  createdAt: z.string(),
})

export type Tenant = z.infer<typeof tenantSchema>

export interface TenantFilters {
  search?: string
  status?: string
  page?: number
  size?: number
}

export interface TenantPageResponse {
  content: Tenant[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

