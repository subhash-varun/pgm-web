import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Edit2, Save, X, Shield, Sparkles, Award } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'

interface ProfileData {
  id: number
  name: string
  email: string
  contactNo: string
  createdAt: string
  roles: string[]
}

interface ProfileUpdateData {
  name: string
  email: string
  contactNo: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    email: '',
    contactNo: '',
  })

  // Fetch profile data
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/api/auth/profile')
      return response.data
    },
  })

  const profile: ProfileData | undefined = profileResponse?.data

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await api.put('/api/auth/profile', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      })
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Set form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        contactNo: profile.contactNo,
      })
    }
  }, [profile])

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.contactNo.trim()) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required.',
        variant: 'destructive',
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.contactNo)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      })
      return
    }

    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        contactNo: profile.contactNo,
      })
    }
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto animate-fade-in">
        <Skeleton className="h-12 w-64 mb-3" />
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-gray-500">Unable to load profile data</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <User className="w-4 h-4" />
            Manage your personal information
          </p>
        </div>
        <Badge className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <Shield className="w-4 h-4 mr-2" />
          {profile.roles.join(', ') || 'User'}
        </Badge>
      </div>

      <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-purple-500/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  {profile.name}
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2 text-base">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Joined {formatDate(profile.createdAt)}
                </CardDescription>
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="border-2 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {/* Name Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="flex items-center gap-2 text-base font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              Full Name
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-lg h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                placeholder="Enter your name"
                disabled={updateMutation.isPending}
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="flex items-center gap-2 text-base font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Email Address
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-lg h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                placeholder="Enter your email"
                disabled={updateMutation.isPending}
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-lg font-semibold text-gray-900">{formData.email}</p>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <Label htmlFor="contactNo" className="flex items-center gap-2 text-base font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                id="contactNo"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value.replace(/\D/g, '') })}
                className="text-lg h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                disabled={updateMutation.isPending}
              />
            ) : (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-lg font-semibold text-gray-900">{formData.contactNo}</p>
              </div>
            )}
          </div>

          {/* Security Note */}
          {isEditing && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <strong>Note:</strong> Make sure all information is accurate before saving.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              User ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              #{profile.id}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              Account Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {profile.roles[0] || 'User'}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Active
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}