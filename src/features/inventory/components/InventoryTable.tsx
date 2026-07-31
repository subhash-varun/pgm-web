// src/features/inventory/components/InventoryTable.tsx
import { useState, useEffect } from 'react'
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import type { InventoryItem } from '@/types/inventory.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, AlertCircle, CheckCircle, Wrench, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import EditItemDialog from './EditItemDialog'
import DeleteConfirmDialog from './DeleteConfirmDialog'

interface Props {
  data: InventoryItem[]
  isLoading: boolean
  pagination: any
  onPageChange: (page: number) => void
  onDelete: (id: number) => Promise<void>
  isDeleting: boolean
  onSortChange?: (field: string) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export default function InventoryTable({ data, isLoading, pagination, onPageChange, onDelete, isDeleting, onSortChange, sortBy, sortOrder }: Props) {
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    setSorting(sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [])
  }, [sortBy, sortOrder])

  const handleDelete = async () => {
    if (!deleteItem) return
    await onDelete(deleteItem.id)
    setDeleteItem(null)
  }

  const getConditionIcon = (status: string) => {
    switch (status) {
      case 'GOOD':
        return <CheckCircle className="w-4 h-4" />
      case 'NEEDS_REPAIR':
        return <Wrench className="w-4 h-4" />
      case 'REPLACED':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getConditionVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'GOOD':
        return 'default'
      case 'NEEDS_REPAIR':
        return 'secondary'
      case 'REPLACED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'roomNumber',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Room
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium" data-testid={`room-${row.original.id}`}>
          {row.original.roomNumber}
        </div>
      ),
    },
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Item Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium" data-testid={`item-name-${row.original.id}`}>
          {row.original.itemName}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Quantity
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const qty = row.original.quantity
        const isLowStock = qty < 5
        return (
          <div className="flex items-center gap-2" data-testid={`quantity-${row.original.id}`}>
            <span className={isLowStock ? 'text-red-600 font-bold text-lg' : 'font-medium'}>
              {qty}
            </span>
            {isLowStock && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Low</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'conditionStatus',
      header: 'Condition',
      cell: ({ row }) => {
        const status = row.original.conditionStatus
        return (
          <Badge
            variant={getConditionVariant(status)}
            className="flex items-center gap-1 w-fit"
            data-testid={`condition-${row.original.id}`}
          >
            {getConditionIcon(status)}
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600" data-testid={`last-updated-${row.original.id}`}>
          {formatDate(row.original.lastUpdated)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2" data-testid={`actions-${row.original.id}`}>
          <Button
            size="sm"
            variant="ghost"
            className="hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setEditItem(row.original)}
            data-testid={`edit-button-${row.original.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="hover:bg-red-50 text-red-600 hover:text-red-700"
            onClick={() => setDeleteItem(row.original)}
            data-testid={`delete-button-${row.original.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      if (onSortChange) {
        if (newSorting.length > 0) {
          onSortChange(newSorting[0].id)
        } else {
          onSortChange('')
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  })

  return (
    <>
      <div>
        <div className="rounded-md border" data-testid="inventory-table">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span>Loading inventory...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-1">No inventory items found</p>
                      <p className="text-sm">Add your first item to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-testid={`inventory-row-${row.original.id}`}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4" data-testid="pagination-controls">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{data.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 0}
              data-testid="pagination-previous"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-3">
              <span className="text-sm text-gray-600">
                Page <span className="font-medium">{pagination.pageIndex + 1}</span> of{' '}
                <span className="font-medium">{pagination.pageCount || 1}</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
              data-testid="pagination-next"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditItemDialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        item={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        item={deleteItem}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}