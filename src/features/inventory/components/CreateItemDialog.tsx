import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInventory } from '@/hooks/useInventory'
import { useRooms } from '@/hooks/useRooms'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  roomId: z.coerce.number().positive('Room is required'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  conditionStatus: z.enum(['GOOD', 'NEEDS_REPAIR', 'REPLACED']),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateItemDialog({ open, onOpenChange }: Props) {
  const { createItem } = useInventory({})
  const { rooms, isLoading: loadingRooms } = useRooms({ size: 100 })

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      conditionStatus: 'GOOD',
      quantity: 1,
    },
  })

  const selectedCondition = watch('conditionStatus')
  const selectedRoomId = watch('roomId')

  const onSubmit = async (data: FormData) => {
    await createItem(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="create-item-dialog">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="room">Room *</Label>
            <Select
              value={selectedRoomId ? String(selectedRoomId) : ''}
              onValueChange={(v) => setValue('roomId', Number(v))}
            >
              <SelectTrigger id="room" data-testid="create-room-select" disabled={loadingRooms}>
                <SelectValue placeholder={loadingRooms ? 'Loading rooms...' : 'Select room'} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)} data-testid={`room-option-${room.id}`}>
                    {room.roomNumber} ({room.roomType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-sm text-red-600 mt-1">{errors.roomId.message}</p>}
          </div>

          <div>
            <Label htmlFor="item-name">Item Name *</Label>
            <Input
              id="item-name"
              data-testid="create-item-name-input"
              {...register('itemName')}
              placeholder="e.g., Bed, Chair, Table, Fan"
            />
            {errors.itemName && <p className="text-sm text-red-600 mt-1">{errors.itemName.message}</p>}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              data-testid="create-quantity-input"
              {...register('quantity')}
              type="number"
              min="1"
              placeholder="1"
            />
            {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <Label htmlFor="condition">Condition Status *</Label>
            <Select
              value={selectedCondition}
              onValueChange={(v) => setValue('conditionStatus', v as 'GOOD' | 'NEEDS_REPAIR' | 'REPLACED')}
            >
              <SelectTrigger id="condition" data-testid="create-condition-select">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD" data-testid="condition-good">✓ Good</SelectItem>
                <SelectItem value="NEEDS_REPAIR" data-testid="condition-needs-repair">⚠ Needs Repair</SelectItem>
                <SelectItem value="REPLACED" data-testid="condition-replaced">✕ Replaced</SelectItem>
              </SelectContent>
            </Select>
            {errors.conditionStatus && <p className="text-sm text-red-600 mt-1">{errors.conditionStatus.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              data-testid="create-cancel-button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="create-submit-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
