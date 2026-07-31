import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Building2, Lock, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data),
    onSuccess: (res) => {
      login(res.data.data.token)
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })
      navigate('/')
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    },
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <Card 
        className="w-full max-w-md relative z-10 shadow-2xl border-blue-100 backdrop-blur-sm bg-white/80 dark:bg-slate-900/90"
        data-testid="login-card"
      >
        <CardHeader className="space-y-4 text-center pb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-lg">
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-blue-50 mt-2">
              Sign in to PG Management System
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
              </label>
              <Input
                {...register('email')}
                placeholder="Enter your email"
                type="email"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                data-testid="login-email-input"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password
              </label>
              <Input
                {...register('password')}
                placeholder="Enter your password"
                type="password"
                disabled={mutation.isPending}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                data-testid="login-password-input"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold mt-6 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={mutation.isPending}
              data-testid="login-submit-button"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-4 hover:underline transition-all"
                data-testid="signup-link"
              >
                Sign Up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-600 text-sm">
        <p>© 2025 PG Management System. All rights reserved.</p>
      </div>
      {/* Demo Credentials */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-md border border-blue-200 rounded-xl shadow-lg p-4 text-sm w-64">
          <p className="font-semibold text-blue-700 mb-2">
            Test Login Credentials
          </p>
          <div className="space-y-1 text-gray-700">
            <p>
              <span className="font-medium">Email:</span>{' '}
              <span className="font-mono">admin@pgm.com</span>
            </p>
            <p>
              <span className="font-medium">Password:</span>{' '}
              <span className="font-mono">admin123</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use these credentials to explore the system
          </p>
        </div>
      </div>

    </div>
  )
}