import { useState } from 'react'
import { useRooms } from '@/hooks/useRooms'
import RoomsTable from './components/RoomsTable'
import CreateRoomDialog from './components/CreateRoomDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Room } from '@/types/room.types'

export default function RoomsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('ALL')
  const [status, setStatus] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const { rooms, pagination: roomPagination, isLoading: roomsLoading, deleteRoom } = useRooms({
    type: type === 'ALL' ? '' : type,
    status: status === 'ALL' ? '' : status,
    page,
    size: 10,
  })

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
  }

  const handleDeleteRoom = async (room: Room) => {
    const confirmed = window.confirm(`Are you sure you want to delete room ${room.roomNumber}? This action cannot be undone.`)
    
    if (confirmed) {
      try {
        toast.loading(`Deleting room ${room.roomNumber}...`)
        await deleteRoom(room.id)
        toast.dismiss()
        toast.success(`Room ${room.roomNumber} deleted successfully`)
      } catch (error) {
        toast.dismiss()
        toast.error('Failed to delete room')
        console.error('Delete room error:', error)
      }
    }
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setEditingRoom(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all rooms in your property</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomPagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(room => room.status === 'AVAILABLE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rooms.filter(room => room.status === 'OCCUPIED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {rooms.filter(room => room.status === 'MAINTENANCE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms List</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search rooms by number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-10"
              />
            </div>

            {/* Room Type Filter */}
            <Select value={type} onValueChange={(v) => { setType(v); setPage(0); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="SINGLE">Single</SelectItem>
                <SelectItem value="DOUBLE">Double</SelectItem>
                <SelectItem value="SHARED">Shared</SelectItem>
              </SelectContent>
            </Select>

            {/* Room Status Filter */}
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <RoomsTable
            data={rooms}
            isLoading={roomsLoading}
            pagination={{
              pageIndex: page,
              pageSize: 10,
              pageCount: roomPagination.pages,
              total: roomPagination.total,
            }}
            onPageChange={setPage}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
          />
        </CardContent>
      </Card>

      <CreateRoomDialog 
        open={isCreateOpen || !!editingRoom} 
        onOpenChange={handleCloseDialog}
        room={editingRoom}
      />
    </div>
  )
}
