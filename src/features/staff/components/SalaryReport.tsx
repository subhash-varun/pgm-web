import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Staff, Attendance } from '@/types/staff.types'

interface Props {
  staff: Staff[]
  attendance: Attendance[]
}

export default function SalaryReport({ staff, attendance }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyData = staff.map(s => {
    const records = attendance.filter(a => a.staffId === s.id && a.date.startsWith(currentMonth))
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
    const salary = totalHours * (s.salary / 160) // 160 hrs/month

    return { ...s, totalHours, salary }
  })

  const totalPayroll = monthlyData.reduce((sum, s) => sum + s.salary, 0)

  const exportCSV = () => {
    const headers = ['Name', 'Role', 'Hours', 'Salary']
    const rows = monthlyData.map(s => [s.name, s.role, s.totalHours.toFixed(1), s.salary.toFixed(2)])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salary-report-${currentMonth}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Monthly Salary Report</CardTitle>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyData.map(s => (
            <div key={s.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-600">{s.role} • {s.totalHours.toFixed(1)} hrs</p>
              </div>
              <p className="font-bold">₹{s.salary.toFixed(0)}</p>
            </div>
          ))}
          <div className="border-t pt-3 font-bold text-lg">
            Total Payroll: ₹{totalPayroll.toFixed(0)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}