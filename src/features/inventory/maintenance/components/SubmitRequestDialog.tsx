// src/features/maintenance/components/SubmitRequestDialog.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload } from 'lucide-react'

const schema = z.object({
  roomNumber: z.string().min(1),
  issueTitle: z.string().min(1),
  description: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  image: z.any().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubmitRequestDialog({ open, onOpenChange }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Mock API call
    await new Promise(r => setTimeout(r, 1000))
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Maintenance Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Room Number</Label>
            <Input {...register('roomNumber')} placeholder="101" />
          </div>
          <div>
            <Label>Issue Title</Label>
            <Input {...register('issueTitle')} placeholder="AC not cooling" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Please describe the issue..." rows={3} />
          </div>
          <div>
            <Label>Priority</Label>
            <Select onValueChange={(v) => register('priority').onChange({ target: { value: v } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High (Urgent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Photo (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">Click to upload</p>
              <input type="file" className="hidden" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}