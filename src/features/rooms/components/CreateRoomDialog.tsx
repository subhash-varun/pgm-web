import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRooms } from '@/hooks/useRooms'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { Room } from '@/types/room.types'

const formSchema = z.object({
  roomNumber: z.string().min(1),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'SHARED']),
  rentAmount: z.coerce.number().positive(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']),
  facilities: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room | null
}

export default function CreateRoomDialog({ open, onOpenChange, room }: Props) {
  const { createRoom, updateRoom } = useRooms({})

  const isEditing = !!room

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: room ? {
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      rentAmount: room.rentAmount,
      status: room.status,
      facilities: room.facilities || '',
    } : undefined,
  })

  // Update form when room changes
  useEffect(() => {
    if (room) {
      setValue('roomNumber', room.roomNumber)
      setValue('roomType', room.roomType)
      setValue('rentAmount', room.rentAmount)
      setValue('status', room.status)
      setValue('facilities', room.facilities || '')
    } else {
      reset()
    }
  }, [room, setValue, reset])

  const onSubmit = async (data: FormData) => {
    if (isEditing && room) {
      await updateRoom({ id: room.id, data })
    } else {
      await createRoom(data)
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Room Number</Label>
            <Input {...register('roomNumber')} placeholder="101" />
            {errors.roomNumber && <p className="text-red-500 text-sm">{errors.roomNumber.message}</p>}
          </div>

          {/* Room Type */}
          <div>
            <Label>Room Type</Label>
            <Controller
              name="roomType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="DOUBLE">Double</SelectItem>
                    <SelectItem value="SHARED">Shared</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rent Amount */}
          <div>
            <Label>Rent Amount (₹)</Label>
            <Input {...register('rentAmount')} type="number" />
            {errors.rentAmount && <p className="text-red-500 text-sm">{errors.rentAmount.message}</p>}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Facilities */}
          <div>
            <Label>Facilities (optional)</Label>
            <Input {...register('facilities')} placeholder="AC, WiFi, Bed" />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : (isEditing ? 'Update Room' : 'Create Room')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
