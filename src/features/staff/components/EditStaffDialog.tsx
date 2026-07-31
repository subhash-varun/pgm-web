import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useStaff } from '@/hooks/useStaff'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type FormData = z.infer<typeof schema>

interface Props {
  staffId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (data: { id: number; data: FormData }) => Promise<void>
}

export default function EditStaffDialog({ staffId, open, onOpenChange, onUpdate }: Props) {
  const { singleStaff } = useStaff({ id: staffId })
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Load data on open
  React.useEffect(() => {
    if (singleStaff) {
      reset({
        name: singleStaff.name,
        email: singleStaff.email,
        role: singleStaff.role,
        status: singleStaff.status,
      })
    }
  }, [singleStaff, reset])

  const onSubmit = async (data: FormData) => {
    await onUpdate({ id: staffId, data })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register('name')} />
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register('email')} type="email" />
          </div>
          <div>
            <Label>Role</Label>
            <Input {...register('role')} />
          </div>
          <div>
            <Label>Status</Label>
            <Select onValueChange={(v) => register('status').onChange({ target: { value: v } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Update Staff'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}