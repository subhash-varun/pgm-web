import { useState } from 'react'
import { useTenants } from '@/hooks/useTenants'
import TenantTable from './components/TenantTable'
import CreateTenantDialog from './components/CreateTenantDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'

export default function TenantsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, isLoading } = useTenants({ search, status, page, size: 10 })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-10"
              />
            </div>
            <Select
                value={status || "all"}
                onValueChange={(v: string) => {
                    setStatus(v === 'all' ? '' : v)
                    setPage(0)
                }}
                >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="MOVED_OUT">Moved Out</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <TenantTable
            data={data?.content || []}
            isLoading={isLoading}
            pagination={{
              pageIndex: page,
              pageSize: 10,
              pageCount: data?.totalPages || 0,
              total: data?.totalElements || 0,
            }}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <CreateTenantDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}