// src/components/layout/Topbar.tsx
import { Bell, User, X, Wifi, WifiOff, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { profile, isLoadingProfile } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { isConnected } = useRealtimeNotifications() // Real-time connection status

  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await markAsRead(notificationId)
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark as read')
    }
    setShowNotifications(false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // Get user initials
  const getUserInitials = () => {
    if (!profile?.name) return 'U'
    const nameParts = profile.name.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return profile.name.substring(0, 2).toUpperCase()
  }

  // Get user role display
  const getUserRole = () => {
    if (!profile?.roles || profile.roles.length === 0) return 'User'
    const role = profile.roles[0].replace('ROLE_', '')
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  // Format time
  const formatNotificationTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  // Badge color by type
  const getNotificationBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'warning':
      case 'alert':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'success':
      case 'payment':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-gray-100"
          onClick={onMenuClick}
          data-testid="mobile-menu-button"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 transition-all duration-200"
              data-testid="notifications-button"
            >
              <Bell className="w-5 h-5 text-gray-600" />

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 min-w-[24px] px-2 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}

              {/* Connection Status Indicator */}
              <div
                className={`absolute top-1 left-1 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all ${
                  isConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
                title={isConnected ? 'Real-time connected' : 'Connecting...'}
              />
              {isConnected ? (
                <Wifi className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-500" />
              ) : (
                <WifiOff className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-400" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-96 p-0" data-testid="notifications-dropdown">
            <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
              <span className="font-semibold text-gray-900">Notifications</span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 font-medium">
                    {unreadCount} new
                  </Badge>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.body}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                          {notification.type && (
                            <Badge
                              className={`text-xs px-2 py-0.5 font-medium ${getNotificationBadgeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm"
                  onClick={() => {
                    setShowNotifications(false)
                    navigate('/notifications')
                  }}
                >
                  View all notifications →
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group">
              <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-indigo-200 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                  {isLoadingProfile ? '...' : getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {isLoadingProfile ? 'Loading...' : profile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {isLoadingProfile ? '' : getUserRole()}
                  {isConnected && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">{profile?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{profile?.email || ''}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                  {isConnected ? 'Online (Real-time)' : 'Connecting...'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
              <X className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}