import { useState } from 'react'
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, type SortingState } from '@tanstack/react-table'
import type { Payment } from '@/types/payment.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  data: Payment[]
  isLoading: boolean
  pagination: any
  onPageChange: (page: number) => void
  onMarkPaid: (id: number) => Promise<void>
}

export default function PaymentsTable({ data, isLoading, pagination, onPageChange, onMarkPaid }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [loadingPaymentId, setLoadingPaymentId] = useState<number | null>(null)

  const handleMarkPaid = async (id: number) => {
    setLoadingPaymentId(id)
    try {
      await onMarkPaid(id)
    } catch (error) {
      console.error('Error marking payment as paid:', error)
    } finally {
      setLoadingPaymentId(null)
    }
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'tenantName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tenant
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
        <div className="font-medium">{row.original.tenantName}</div>
      ),
    },
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
        <div className="font-medium">{row.original.roomNumber}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Amount
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
        <div className="font-medium text-green-600">
          ₹{row.original.amount.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Due Date
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
        <div className="text-sm text-gray-600">
          {new Date(row.original.dueDate).toLocaleDateString('en-IN')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Status
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
        const s = row.original.status
        return (
          <Badge variant={s === 'PAID' ? 'default' : s === 'PENDING' ? 'secondary' : 'destructive'}>
            {s}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => row.original.status !== 'PAID' && (
        <Button 
          size="sm" 
          onClick={() => handleMarkPaid(row.original.id)}
          disabled={loadingPaymentId === row.original.id}
          className="bg-green-600 hover:bg-green-700"
        >
          {loadingPaymentId === row.original.id ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" /> Mark Paid
            </>
          )}
        </Button>
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-gray-50/50">
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="font-semibold text-gray-900">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium">No payments found</div>
                    <div className="text-sm mt-1">Try adjusting your filters or add a new payment.</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {data.length > 0 ? (pagination.pageIndex * pagination.pageSize) + 1 : 0} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.total)} of{' '}
          {pagination.total} payments
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0 || isLoading}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pageCount) }, (_, i) => {
              const pageNumber = Math.max(0, Math.min(pagination.pageIndex - 2, pagination.pageCount - 5)) + i
              if (pageNumber >= pagination.pageCount) return null
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === pagination.pageIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={isLoading}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber + 1}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex >= pagination.pageCount - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
