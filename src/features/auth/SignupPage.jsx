import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/api/client'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Building2, Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits').max(10, 'Contact number must be 10 digits'),
})

export default function SignupPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/register', data),
    onSuccess: (res) => {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please login.",
      })
      navigate('/login')
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Unable to create account. Please try again.",
        variant: "destructive",
      })
    },
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-xl border" data-testid="signup-card">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Create Account
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Join PG Management System
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                Full Name
              </label>
              <Input
                {...register('name')}
                placeholder="Enter your full name"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 transition-all"
                data-testid="signup-name-input"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                Email
              </label>
              <Input
                {...register('email')}
                placeholder="Enter your email"
                type="email"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 transition-all"
                data-testid="signup-email-input"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                Contact Number
              </label>
              <Input
                {...register('contactNo')}
                placeholder="Enter your contact number"
                type="tel"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 transition-all"
                data-testid="signup-contact-input"
              />
              {errors.contactNo && <p className="text-red-500 text-sm">{errors.contactNo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                Password
              </label>
              <Input
                {...register('password')}
                placeholder="Create a password"
                type="password"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 transition-all"
                data-testid="signup-password-input"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full h-10 bg-slate-800 hover:bg-slate-900 text-white font-medium mt-6" 
              disabled={mutation.isPending}
              data-testid="signup-submit-button"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center justify-center gap-2 mx-auto"
              data-testid="back-to-login-link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-600 text-sm">
        <p>© 2025 PG Management System. All rights reserved.</p>
      </div>
    </div>
  )
}
