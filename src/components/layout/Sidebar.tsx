// src/components/layout/Sidebar.tsx
import { Home, Users, DoorClosed, Receipt, Package, UserCog, Shield, Lock, ChevronLeft, ChevronRight, Building2, Bell, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions'

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Tenants', path: '/tenants' },
  { icon: DoorClosed, label: 'Rooms', path: '/rooms' },
  { icon: Receipt, label: 'Payments', path: '/payments' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: UserCog, label: 'Staff', path: '/staff' },
  { icon: Shield, label: 'Admins', path: '/admins' },
  { icon: Lock, label: 'Roles & Permissions', path: '/roles' },
]

const conditionalMenuItems = [
  { 
    icon: Bell, 
    label: 'Notifications', 
    path: '/notifications',
    permission: 'NOTIFICATION_CREATE'
  },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()
  const { profile, isLoading: isLoadingProfile } = useAuth()
  const { canCreateNotifications, isLoading: isLoadingPermissions } = useNotificationPermissions()
  const [collapsed, setCollapsed ] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  // Helper to get initials safely
  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return '??'
    return name
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } hidden md:flex bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/40 border-r border-blue-100/50 flex flex-col h-full shadow-lg shadow-blue-100/30 transition-all duration-300`}
        data-testid="sidebar-container"
      >
        {/* Header */}
        <div
          className="border-b border-blue-100/50 cursor-pointer hover:bg-blue-50/50 transition-all duration-200 backdrop-blur-sm"
          style={{ padding: '1rem' }}
          onClick={() => navigate('/')}
          data-testid="sidebar-logo"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PG Manager
                </h1>
                <p className="text-xs text-blue-600/70 font-medium">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50'
                    : 'text-gray-700 hover:bg-blue-50/50 hover:shadow-sm'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}

          {/* Conditional: Notifications */}
          {conditionalMenuItems.map((item) => {
            const shouldShow = item.permission === 'NOTIFICATION_CREATE' 
              ? canCreateNotifications 
              : true

            if (!shouldShow || isLoadingPermissions || isLoadingProfile) {
              return null
            }

            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50/50 hover:shadow-sm'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-blue-100/50 space-y-2 bg-gradient-to-t from-blue-50/30 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 hover:bg-blue-50/50 text-blue-600"
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="mobile-sidebar"
      >
        {/* Mobile Header with Close Button */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PG Manager
              </h1>
              <p className="text-xs text-blue-600/70 font-medium">Management System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="hover:bg-gray-100"
            data-testid="mobile-sidebar-close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto bg-white">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}

          {/* Conditional: Notifications for Mobile */}
          {conditionalMenuItems.map((item) => {
            const shouldShow = item.permission === 'NOTIFICATION_CREATE' 
              ? canCreateNotifications 
              : true

            if (!shouldShow || isLoadingPermissions || isLoadingProfile) {
              return null
            }

            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}