import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { InventoryItem } from '@/types/inventory.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  onConfirm: () => void
  isDeleting: boolean
}

export default function DeleteConfirmDialog({ open, onOpenChange, item, onConfirm, isDeleting }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="delete-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{item?.itemName}</strong> from room <strong>{item?.roomNumber}</strong>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-cancel-button" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-testid="delete-confirm-button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
