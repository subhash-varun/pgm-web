import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
//   DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenants } from '@/hooks/useTenants'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

// Zod schema with proper number transformation
const formSchema = z.object({
  roomNumber: z.string().min(1, 'Room Number is required').transform(Number),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  idProofType: z.string().min(1, 'ID proof type is required'),
  idProofNumber: z.string().min(1, 'ID proof number is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  depositAmount: z.string().min(1, 'Deposit is required').transform(Number),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateTenantDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const { createTenant } = useTenants({})

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNumber: 0,
      name: '',
      email: '',
      phone: '',
      idProofType: 'Aadhar',
      idProofNumber: '',
      checkInDate: new Date().toISOString().split('T')[0], // today
      depositAmount: 0,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createTenant(data)
      reset()
      onOpenChange(false)
      // Force refresh tenants list
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    } catch (error: any) {
      console.error('Failed to create tenant:', error)
      // Optional: show toast error
      alert(error?.response?.data?.message || 'Failed to create tenant')
    }
  }

  const onOpenChangeWrapper = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Tenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="roomNumber">Room ID *</Label>
              <Input
                id="roomNumber"
                {...register('roomNumber')}
                placeholder="e.g. 101"
                className="mt-1"
              />
              {errors.roomNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.roomNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Rahul Sharma"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="rahul@gmail.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="9876543210"
                maxLength={10}
                className="mt-1"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="idProofType">ID Proof Type *</Label>
              <Input
                id="idProofType"
                {...register('idProofType')}
                placeholder="Aadhar / Passport / Driving License"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="idProofNumber">ID Proof Number *</Label>
              <Input
                id="idProofNumber"
                {...register('idProofNumber')}
                placeholder="1234 5678 9012"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="checkInDate">Check-in Date *</Label>
              <Input
                id="checkInDate"
                {...register('checkInDate')}
                type="date"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="depositAmount">Deposit Amount (₹) *</Label>
              <Input
                id="depositAmount"
                {...register('depositAmount')}
                placeholder="12000"
                className="mt-1"
              />
              {errors.depositAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.depositAmount.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
                ) : (
                'Add Tenant'
                )}
            </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}