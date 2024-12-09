import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  Menu,
  Users,
  Calculator,
  Package,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeSelector } from '../ui/ThemeSelector'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

const navigation: NavItem[] = [
  { icon: <Users size={20} />, label: 'Crews', path: '/crews' },
  { icon: <Calculator size={20} />, label: 'Payroll', path: '/payroll' },
  { icon: <Package size={20} />, label: 'Inventory', path: '/inventory' },
  {
    icon: <FileSpreadsheet size={20} />,
    label: 'Configurator',
    path: '/configurator',
  },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <div className='min-h-screen bg-secondary'>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-primary border-r border-primary shadow-lg transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className='flex h-16 items-center justify-between px-4'>
          <h1 className='text-xl font-bold text-primary'>Project Forge ⚒</h1>
          <button onClick={() => setSidebarOpen(false)} className='lg:hidden'>
            <Menu className='h-6 w-6 text-secondary' />
          </button>
        </div>
        <nav className='mt-4 space-y-1 px-2'>
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                location.pathname === item.path
                  ? 'bg-secondary text-brand-orange'
                  : 'text-secondary hover:bg-secondary hover:text-primary'
              }`}>
              {item.icon}
              <span className='ml-3'>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-primary bg-primary px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8'>
          <button
            type='button'
            className='-m-2.5 p-2.5 text-gray-700 lg:hidden'
            onClick={() => setSidebarOpen(true)}>
            <span className='sr-only'>Open sidebar</span>
            <Menu className='h-6 w-6' aria-hidden='true' />
          </button>

          <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
            <div className='flex flex-1'></div>
            <div className='flex items-center gap-x-4 lg:gap-x-6'>
              <ThemeSelector />
              <button onClick={logout} type='button' className='btn-secondary'>
                <LogOut className='h-6 w-6' />
                <span className='text-sm'>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <main className='py-10'>
          <div className='px-4 sm:px-6 lg:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
