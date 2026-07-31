import { z } from 'zod'

export const paymentSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  tenantName: z.string(),
  amount: z.number(),
  paymentDate: z.string(),
  paymentMonth: z.string(),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CARD']),
  receiptNumber: z.string().nullable(),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']),
  createdAt: z.string(),
  // Optional fields from your real API
  roomNumber: z.string().optional(),
})

export type Payment = z.infer<typeof paymentSchema>

export interface PaymentFilters {
  status?: string
  search?: string
  page?: number
  size?: number
}

export interface PaymentSummary {
  totalCollected: number
  totalPending: number
  totalOverdue: number
  monthlyRevenue: { month: string; amount: number }[]
}

