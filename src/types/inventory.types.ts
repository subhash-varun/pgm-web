import { z } from 'zod'

export const inventorySchema = z.object({
  id: z.number(),
  roomId: z.number(),
  roomNumber: z.string(),
  itemName: z.string(),
  quantity: z.number(),
  conditionStatus: z.enum(['GOOD', 'NEEDS_REPAIR', 'REPLACED']),
  lastUpdated: z.string(),
})

export type InventoryItem = z.infer<typeof inventorySchema>

export interface InventoryFilters {
  roomId?: number
  itemName?: string
  conditionStatus?: string
  search?: string
  page?: number
  size?: number
}

export interface InventoryPageResponse {
  content: InventoryItem[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
