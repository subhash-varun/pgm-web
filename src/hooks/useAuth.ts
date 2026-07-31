import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export interface RegisterData {
  name: string
  email: string
  password: string
  contactNo: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UpdateProfileData {
  name: string
  email: string
  contactNo: string
}

export interface AdminProfile {
  id: number
  name: string
  email: string
  contactNo: string
  createdAt: string
  roles: string[]
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { login: storeLogin, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => 
      api.post<{ status: string; message: string; data: { token: string; tokenType: string; expiresIn: number } }>('/api/auth/login', data),
    onSuccess: (res) => {
      storeLogin(res.data.data.token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      api.post<{ status: string; message: string; data: AdminProfile }>('/api/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.post<{ status: string; message: string; data: {} }>('/api/auth/logout'),
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  // Get profile query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<{ status: string; message: string; data: AdminProfile }>('/api/auth/profile')
      return res.data.data
    },
    enabled: !!localStorage.getItem('pg_token'),
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => 
      api.put<{ status: string; message: string; data: AdminProfile }>('/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}
