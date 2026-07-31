import { z } from 'zod'

export const roomSchema = z.object({
  id: z.number(),
  roomNumber: z.string(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'SHARED']),
  rentAmount: z.number(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']),
  facilities: z.string(),
  createdAt: z.string(),
})

export type Room = z.infer<typeof roomSchema>

export interface RoomFilters {
  type?: string
  status?: string
  minRent?: number
  maxRent?: number
  page?: number
  size?: number
}

export interface RoomPageResponse {
  content: Room[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

