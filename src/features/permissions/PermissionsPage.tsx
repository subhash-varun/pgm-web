import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Key, Plus, Edit, Trash2, Code, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/usePermissions'

export default function PermissionsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [selectedPermissionId, setSelectedPermissionId] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const {
    permissions,
    pagination,
    createPermission,
    updatePermission,
    deletePermission,
    isLoading,
  } = usePermissions({ page, size: 12 })

  const [formData, setFormData] = useState({ key: '', name: '', description: '' })

  useEffect(() => {
    if (!isEditOpen && !isCreateOpen) {
      setFormData({ key: '', name: '', description: '' })
      setSelectedPermissionId(null)
    }
  }, [isEditOpen, isCreateOpen])

  const handleCreate = async () => {
    if (!formData.key.trim() || !formData.name.trim()) {
      toast({ title: 'Error', description: 'Key and Name are required', variant: 'destructive' })
      return
    }
    try {
      await createPermission(formData)
      toast({ title: 'Success', description: 'Permission created successfully' })
      setIsCreateOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to create permission', variant: 'destructive' })
    }
  }

  const handleEdit = async () => {
    if (!selectedPermissionId || !formData.key.trim() || !formData.name.trim()) return
    try {
      await updatePermission({ id: selectedPermissionId, data: formData })
      toast({ title: 'Success', description: 'Permission updated successfully' })
      setIsEditOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to update permission', variant: 'destructive' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await deletePermission(id)
      toast({ title: 'Success', description: 'Permission deleted successfully' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete permission', variant: 'destructive' })
    }
  }

  const openEditDialog = (permission) => {
    setSelectedPermissionId(permission.id)
    setFormData({
      key: permission.key,
      name: permission.name,
      description: permission.description || '',
    })
    setIsEditOpen(true)
  }

  if (isLoading && permissions.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Permissions Management</h1>
          <p className="text-sm text-gray-600 mt-1">Define and manage system permissions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-800 hover:bg-slate-900" data-testid="create-permission-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>Add a new permission to your system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key">Permission Key</Label>
                <Input
                  id="key"
                  placeholder="e.g., users.create"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
                <p className="text-xs text-gray-500">Use lowercase with dots (e.g., module.action)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Create Users"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this permission allows"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-slate-800 hover:bg-slate-900">
                Create Permission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {permissions.map((permission) => (
          <Card key={permission.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Key className="w-4 h-4 text-slate-700" />
                  </div>
                  <CardTitle className="text-base">{permission.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded border">
                <Code className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <code className="text-slate-700 font-mono truncate">{permission.key}</code>
              </div>

              <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                {permission.description || 'No description'}
              </CardDescription>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(permission.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(permission)}
                  className="flex-1 text-xs"
                  data-testid={`edit-permission-${permission.id}`}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 text-xs"
                      data-testid={`delete-permission-${permission.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this permission? This will affect all roles using it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(permission.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {permissions.length === 0 && !isLoading && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No permissions found</h3>
              <p className="text-gray-500 text-sm">Create your first permission to get started</p>
            </div>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">Permission Key</Label>
              <Input
                id="edit-key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-slate-800 hover:bg-slate-900">
              Update Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
