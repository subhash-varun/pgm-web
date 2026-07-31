// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'  // ← THIS IS THE FIX (not your custom Radix one)
import ProtectedLayout from './components/layout/ProtectedLayout'

// Public Pages
import LoginPage from './features/auth/LoginPage'
import SignupPage from './features/auth/SignupPage'

// Protected Pages
import Dashboard from './features/dashboard/Dashboard'
import TenantsPage from './features/tenants/TenantsPage'
import RoomsPage from './features/rooms/RoomsPage'
import PaymentsPage from './features/payments/PaymentsPage'
import InventoryPage from './features/inventory/InventoryPage'
import MaintenancePage from './features/inventory/maintenance/MaintenancePage'
import StaffPage from './features/staff/StaffPage'
import RolesPage from './features/roles/RolesPage'
import PermissionsPage from './features/permissions/PermissionsPage'
import AdminPage from './features/admin/AdminPage'
import ProfilePage from './features/profile/ProfilePage'
import NotificationsPage from './features/notifications/NotificationsPage'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
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
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* THIS IS THE ONLY TOASTER THAT WORKS WITH sonner */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          duration: 6000,
        }}
      />
    </>
  )
}

export default App