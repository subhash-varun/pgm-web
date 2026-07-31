import { useDroppable } from '@dnd-kit/core'
import type { Room } from '@/types/room.types'
import { Badge } from '@/components/ui/badge'
import { DoorClosed, Bed, AlertTriangle } from 'lucide-react'

// Utility to get color classes
const getStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200'
    case 'OCCUPIED': return 'bg-red-100 text-red-800 border-red-200'
    case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

interface Props {
  rooms: Room[]
}

// ✅ Subcomponent for each room
function DroppableRoom({ room }: { room: Room }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `room-${room.id}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`relative p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow group ${
        isOver ? 'bg-blue-50' : ''
      } ${getStatusColor(room.status)}`}
    >
      <DoorClosed className="w-6 h-6 mb-2 mx-auto" />
      <h3 className="font-semibold text-sm mb-1">{room.roomNumber}</h3>
      <p className="text-xs text-gray-600 mb-2">{room.roomType}</p>
      <Badge variant="outline" className="absolute top-2 right-2 text-xs">
        ₹{room.rentAmount}
      </Badge>

      {room.status === 'OCCUPIED' && (
        <Bed className="w-3 h-3 absolute bottom-2 left-2 text-gray-400" />
      )}
      {room.status === 'MAINTENANCE' && (
        <AlertTriangle className="w-3 h-3 absolute bottom-2 right-2 text-yellow-500" />
      )}

      <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        {room.facilities}
      </div>
    </div>
  )
}

export default function OccupancyGrid({ rooms }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'room-grid' })

  // Mock grid layout if no rooms
  const gridRooms =
    rooms.length > 0
      ? rooms
      : Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          roomNumber: `Room ${i + 101}`,
          roomType: 'SINGLE' as const,
          rentAmount: 5000,
          status: 'AVAILABLE' as const,
          facilities: 'AC, WiFi',
          createdAt: new Date().toISOString(),
        }))

  return (
    <div
      ref={setNodeRef}
      className={`grid grid-cols-4 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {gridRooms.map((room) => (
        <DroppableRoom key={room.id} room={room} />
      ))}
    </div>
  )
}
