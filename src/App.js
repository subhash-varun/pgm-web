import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import '@/App.css'

// Layouts
import ProtectedLayout from '@/components/layout/ProtectedLayout'

// Public Pages
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'

// Protected Pages
import Dashboard from '@/features/dashboard/Dashboard'
import TenantsPage from '@/features/tenants/TenantsPage'
import RoomsPage from '@/features/rooms/RoomsPage'
import PaymentsPage from '@/features/payments/PaymentsPage'
import InventoryPage from '@/features/inventory/InventoryPage'
import MaintenancePage from '@/features/inventory/maintenance/MaintenancePage'
import StaffPage from '@/features/staff/StaffPage'
import RolesPage from '@/features/roles/RolesPage'
import PermissionsPage from '@/features/permissions/PermissionsPage'
import AdminPage from '@/features/admin/AdminPage'
import ProfilePage from '@/features/profile/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/admins" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
          },
        }}
      />

      {/* React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}

export default App