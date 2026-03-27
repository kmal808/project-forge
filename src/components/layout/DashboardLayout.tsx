import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
	Menu,
	Users,
	Calculator,
	Package,
	FileSpreadsheet,
	Shield,
	ChevronDown,
	ChevronRight,
	LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeSelector } from '../ui/ThemeSelector'
import { ContainerList } from '../inventory/ContainerList'

const navigation = [
	{
		icon: Users,
		label: 'Crews',
		path: '/crews',
	},
	{
		icon: Calculator,
		label: 'Payroll',
		path: '/payroll',
	},
	{
		icon: Package,
		label: 'Inventory',
		path: '/inventory',
		hasSubmenu: true,
	},
	{
		icon: FileSpreadsheet,
		label: 'Configurator',
		path: '/configurator',
	},
]

export function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = React.useState(true)
	const [inventoryExpanded, setInventoryExpanded] = React.useState(true)
	const location = useLocation()
	const { logout, user } = useAuth()

	// Handle window resize
	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 1024) {
				setSidebarOpen(false)
			}
		}

		window.addEventListener('resize', handleResize)
		handleResize() // Initial check

		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Keep inventory expanded when user navigates into inventory pages.
	React.useEffect(() => {
		if (location.pathname.startsWith('/inventory')) {
			setInventoryExpanded(true)
		}
	}, [location.pathname])

	return (
		<div className='min-h-screen bg-secondary'>
			{/* Sidebar backdrop */}
			{sidebarOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/20'
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-primary border-r border-primary shadow-lg transition-transform duration-200 ease-in-out ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				}`}>
				<div className='flex h-16 items-center justify-between px-4'>
					<span />
					<button
						onClick={() => setSidebarOpen(false)}
						className='text-secondary hover:text-primary transition-colors'>
						<Menu className='h-6 w-6' />
					</button>
				</div>

				<nav className='mt-4 space-y-1 px-2'>
					{navigation.map((item) => (
						<div key={item.path}>
							{item.hasSubmenu ? (
								<div className='space-y-2'>
									<button
										type='button'
										onClick={() => setInventoryExpanded((prev) => !prev)}
										className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
											location.pathname.startsWith(item.path)
												? 'bg-secondary text-brand-orange'
												: 'text-secondary hover:bg-secondary hover:text-primary'
										}`}>
										<item.icon className='mr-3 h-5 w-5' />
										<span className='flex-1 text-left'>{item.label}</span>
										{inventoryExpanded ? (
											<ChevronDown className='h-4 w-4' />
										) : (
											<ChevronRight className='h-4 w-4' />
										)}
									</button>
									{inventoryExpanded && (
										<div className='pl-9'>
											<ContainerList />
										</div>
									)}
								</div>
							) : (
								<Link
									to={item.path}
									className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
										location.pathname === item.path
											? 'bg-secondary text-brand-orange'
											: 'text-secondary hover:bg-secondary hover:text-primary'
									}`}>
									<item.icon className='mr-3 h-5 w-5' />
									<span>{item.label}</span>
								</Link>
							)}
						</div>
					))}
					{user?.role === 'admin' && (
						<Link
							to='/admin/users'
							className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
								location.pathname === '/admin/users'
									? 'bg-secondary text-brand-orange'
									: 'text-secondary hover:bg-secondary hover:text-primary'
							}`}>
							<Shield className='mr-3 h-5 w-5' />
							<span>Admin Users</span>
						</Link>
					)}
				</nav>
			</div>

			{/* Main content */}
			<div
				className={`transition-all duration-200 ${
					sidebarOpen ? 'lg:pl-64' : ''
				}`}>
				<div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-primary bg-primary px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8'>
					{!sidebarOpen && (
						<button
							type='button'
							className='-m-2.5 p-2.5 text-secondary hover:text-primary transition-colors'
							onClick={() => setSidebarOpen(true)}>
							<span className='sr-only'>Open sidebar</span>
							<Menu className='h-6 w-6' aria-hidden='true' />
						</button>
					)}

					<Link
						to='/dashboard'
						className='text-lg font-bold text-primary hover:text-brand-orange transition-colors'>
						Project Forge 🛠️
					</Link>

					<div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
						<div className='flex flex-1'></div>
						<div className='flex items-center gap-x-4 lg:gap-x-6'>
							{user?.role && (
								<span className='inline-flex items-center rounded-full border border-primary bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary'>
									{user.role}
								</span>
							)}
							<ThemeSelector />
							<button onClick={logout} className='btn-secondary'>
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
