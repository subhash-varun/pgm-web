import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, Plus, Edit, Trash2, Key, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRoles } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'

export default function RolesPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)

  const {
    roles,
    pagination,
    singleRole,
    permissions: rolePermissions,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    isLoading: rolesLoading,
  } = useRoles({ page, size: 10, id: selectedRoleId || undefined })

  const { permissions: allPermissions, isLoading: permsLoading } = usePermissions({ page: 0, size: 100 })

  const [formData, setFormData] = useState({ name: '', description: '' })
  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    if (isEditOpen && singleRole) {
      setFormData({ name: singleRole.name, description: singleRole.description || '' })
    }
  }, [isEditOpen, singleRole])

  useEffect(() => {
    if (isPermissionsOpen && rolePermissions) {
      setSelectedPermissions(rolePermissions.map(p => p.id))
    }
  }, [isPermissionsOpen, rolePermissions])

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    try {
      await createRole(formData)
      toast({ title: 'Success', description: 'Role created successfully' })
      setIsCreateOpen(false)
      setFormData({ name: '', description: '' })
    } catch {
      toast({ title: 'Error', description: 'Failed to create role', variant: 'destructive' })
    }
  }

  const handleEdit = async () => {
    if (!selectedRoleId || !formData.name.trim()) return
    try {
      await updateRole({ id: selectedRoleId, data: formData })
      toast({ title: 'Success', description: 'Role updated successfully' })
      setIsEditOpen(false)
      setFormData({ name: '', description: '' })
      setSelectedRoleId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRole(id)
      toast({ title: 'Success', description: 'Role deleted successfully' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete role', variant: 'destructive' })
    }
  }

  const handleAssignPermissions = async () => {
    if (!selectedRoleId) return
    try {
      await assignPermissions({ roleId: selectedRoleId, permissionIds: selectedPermissions })
      toast({ title: 'Success', description: 'Permissions updated successfully' })
      setIsPermissionsOpen(false)
      setSelectedPermissions([])
      setSelectedRoleId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to update permissions', variant: 'destructive' })
    }
  }

  const openEditDialog = (role) => {
    setSelectedRoleId(role.id)
    setFormData({ name: role.name, description: role.description || '' })
    setIsEditOpen(true)
  }

  const openPermissionsDialog = (roleId) => {
    setSelectedRoleId(roleId)
    setIsPermissionsOpen(true)
  }

  if (rolesLoading && roles.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
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
          <h1 className="text-2xl font-semibold text-gray-900">Roles Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-800 hover:bg-slate-900" data-testid="create-role-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Add a new role to your system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role's responsibilities"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-slate-800 hover:bg-slate-900">
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Shield className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {role.isDefault && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                {role.description || 'No description'}
              </CardDescription>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Key className="w-3 h-3" />
                <span>Created {new Date(role.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPermissionsDialog(role.id)}
                  className="flex-1 text-xs"
                  data-testid={`edit-permissions-${role.id}`}
                >
                  <Key className="w-3 h-3 mr-1" />
                  Permissions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(role)}
                  className="text-xs"
                  data-testid={`edit-role-${role.id}`}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                {!role.isDefault && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 text-xs"
                        data-testid={`delete-role-${role.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this role? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(role.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {roles.length === 0 && !rolesLoading && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No roles found</h3>
              <p className="text-gray-500 text-sm">Create your first role to get started</p>
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
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name</Label>
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
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-slate-800 hover:bg-slate-900">
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compact Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>Select permissions for this role</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {permsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 rounded border">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {allPermissions.map((permission) => {
                  const isChecked = selectedPermissions.includes(permission.id)
                  return (
                    <div key={permission.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 border">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([...selectedPermissions, permission.id])
                          } else {
                            setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id))
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={`perm-${permission.id}`} className="text-sm font-medium cursor-pointer block">
                          {permission.name}
                        </label>
                        <p className="text-xs text-gray-500 line-clamp-2">{permission.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPermissions} className="bg-slate-800 hover:bg-slate-900" data-testid="save-permissions-button">
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
