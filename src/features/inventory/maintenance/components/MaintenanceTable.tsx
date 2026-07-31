import {type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { MaintenanceRequest } from '@/types/maintenance.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Image, User } from 'lucide-react'

interface Props {
  data: MaintenanceRequest[]
  isLoading: boolean
  pagination: any
  onPageChange: (page: number) => void
  onStatusChange: (id: number, status: string) => Promise<void>
  onAssign: (id: number, staff: string) => Promise<void>
}

export default function MaintenanceTable({ data, isLoading, pagination, onPageChange, onStatusChange, onAssign }: Props) {
  const columns: ColumnDef<MaintenanceRequest>[] = [
    { accessorKey: 'roomNumber', header: 'Room' },
    { accessorKey: 'tenantName', header: 'Tenant' },
    { accessorKey: 'issueTitle', header: 'Issue' },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.original.priority
        return <Badge variant={p === 'HIGH' ? 'destructive' : p === 'MEDIUM' ? 'secondary' : 'default'}>{p}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Select defaultValue={row.original.status} onValueChange={(v) => onStatusChange(row.original.id, v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: 'assign',
      header: 'Assigned To',
      cell: ({ row }) => (
        <Select defaultValue={row.original.assignedTo || ''} onValueChange={(v) => onAssign(row.original.id, v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ramesh">Ramesh</SelectItem>
            <SelectItem value="Suresh">Suresh</SelectItem>
            <SelectItem value="Mahesh">Mahesh</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: 'image',
      cell: ({ row }) => row.original.imageUrl ? <Image className="w-5 h-5 text-blue-600" /> : null,
    },
  ]

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No requests</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        <p className="text-sm text-gray-600">Showing {data.length} of {pagination.total}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.pageIndex - 1)} disabled={pagination.pageIndex === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.pageIndex + 1)} disabled={pagination.pageIndex >= pagination.pageCount - 1}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}