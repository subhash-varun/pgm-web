import { useEffect } from 'react'
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
import type { InventoryItem } from '@/types/inventory.types'

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
  item: InventoryItem | null
}

export default function EditItemDialog({ open, onOpenChange, item }: Props) {
  const { updateItem } = useInventory({})
  const { rooms } = useRooms({ size: 100 })

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedCondition = watch('conditionStatus')

  useEffect(() => {
    if (item) {
      setValue('roomId', item.roomId)
      setValue('itemName', item.itemName)
      setValue('quantity', item.quantity)
      setValue('conditionStatus', item.conditionStatus)
    }
  }, [item, setValue])

  const onSubmit = async (data: FormData) => {
    if (!item) return
    await updateItem({ id: item.id, data })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-item-dialog">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-room">Room</Label>
            <Select
              value={String(watch('roomId') || '')}
              onValueChange={(v) => setValue('roomId', Number(v))}
            >
              <SelectTrigger id="edit-room" data-testid="edit-room-select">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)}>
                    {room.roomNumber} ({room.roomType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-sm text-red-600 mt-1">{errors.roomId.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-item-name">Item Name</Label>
            <Input
              id="edit-item-name"
              data-testid="edit-item-name-input"
              {...register('itemName')}
              placeholder="e.g., Bed, Chair, Table"
            />
            {errors.itemName && <p className="text-sm text-red-600 mt-1">{errors.itemName.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              data-testid="edit-quantity-input"
              {...register('quantity')}
              type="number"
              min="1"
            />
            {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-condition">Condition Status</Label>
            <Select
              value={selectedCondition}
              onValueChange={(v) => setValue('conditionStatus', v as 'GOOD' | 'NEEDS_REPAIR' | 'REPLACED')}
            >
              <SelectTrigger id="edit-condition" data-testid="edit-condition-select">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">✓ Good</SelectItem>
                <SelectItem value="NEEDS_REPAIR">⚠ Needs Repair</SelectItem>
                <SelectItem value="REPLACED">✕ Replaced</SelectItem>
              </SelectContent>
            </Select>
            {errors.conditionStatus && <p className="text-sm text-red-600 mt-1">{errors.conditionStatus.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="edit-cancel-button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="edit-submit-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
