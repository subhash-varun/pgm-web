import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '@/types/inventory.types'

interface Props {
  items: InventoryItem[]
}

export default function LowStockAlert({ items }: Props) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert!</AlertTitle>
      <AlertDescription>
        {items.length} item(s) have low stock: 
        <span className="font-semibold ml-1">
          {items.map(i => `${i.itemName} (${i.quantity})`).join(', ')}
        </span>
      </AlertDescription>
    </Alert>
  )
}