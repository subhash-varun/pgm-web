// src/features/tenants/components/EditTenantDialog.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenants } from '@/hooks/useTenants'
import { useQueryClient } from '@tanstack/react-query'
import type { Tenant } from '@/types/tenant.types'
import { Loader2 } from 'lucide-react'
import React from 'react'

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  depositAmount: z.coerce.number().positive('Deposit must be positive'),
})

type EditFormData = z.infer<typeof editSchema>

interface EditTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant | null
}

export default function EditTenantDialog({
  open,
  onOpenChange,
  tenant,
}: EditTenantDialogProps) {
  const queryClient = useQueryClient()
  const { updateTenant } = useTenants({})

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      depositAmount: 0,
    },
  })

  React.useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        depositAmount: tenant.depositAmount,
      })
    }
  }, [tenant, reset])

  const onSubmit = async (data: EditFormData) => {
    if (!tenant) return
    try {
      await updateTenant({ id: tenant.id, data })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      onOpenChange(false)
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to update')
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  if (!tenant) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Tenant</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Room:</span> {tenant.roomNumber} |{' '}
            <span className="font-semibold">Status:</span>{' '}
            <span className="uppercase font-bold">{tenant.status}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Full Name</Label>
              <Input {...register('name')} className="mt-1" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register('email')} type="email" className="mt-1" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register('phone')} maxLength={10} className="mt-1" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Deposit Amount (₹)</Label>
              <Input {...register('depositAmount')} type="number" className="mt-1" />
              {errors.depositAmount && <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}