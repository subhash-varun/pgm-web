import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, LogIn, LogOut } from 'lucide-react'
import type { Staff, Attendance } from '@/types/staff.types'

interface Props {
  staff: Staff
  todayRecord?: Attendance
  onClockIn: () => void
  onClockOut: () => void
}

export default function AttendanceCard({ staff, todayRecord, onClockIn, onClockOut }: Props) {
  const isCheckedIn = !!todayRecord?.checkIn
  const isCheckedOut = !!todayRecord?.checkOut

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{staff.name}</CardTitle>
            <p className="text-sm text-gray-600">{staff.role}</p>
          </div>
          <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {staff.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            {isCheckedIn ? `In: ${todayRecord.checkIn?.slice(11, 16)}` : 'Not checked in'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            {isCheckedOut ? `Out: ${todayRecord.checkOut?.slice(11, 16)}` : 'Not checked out'}
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          {!isCheckedIn ? (
            <Button size="sm" className="flex-1" onClick={onClockIn}>
              <LogIn className="w-4 h-4 mr-1" />
              Clock In
            </Button>
          ) : !isCheckedOut ? (
            <Button size="sm" variant="destructive" className="flex-1" onClick={onClockOut}>
              <LogOut className="w-4 h-4 mr-1" />
              Clock Out
            </Button>
          ) : (
            <Badge variant="outline" className="w-full justify-center">
              Completed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}