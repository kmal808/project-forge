import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface RoleRouteProps {
	allow: UserRole[]
	redirectTo?: string
}

export function RoleRoute({ allow, redirectTo = '/dashboard' }: RoleRouteProps) {
	const { user, isLoading, isRoleLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<LoadingSpinner />
			</div>
		)
	}

	if (!user) {
		return <Navigate to='/login' replace state={{ from: location }} />
	}

	// Admin can access everything.
	if (user.role === 'admin') return <Outlet />

	// Avoid redirecting during role hydration. This prevents false-deny redirects
	// (e.g. warehouse user briefly treated as crew).
	if (isRoleLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<LoadingSpinner />
			</div>
		)
	}

	if (!allow.includes(user.role)) {
		return <Navigate to={redirectTo} replace />
	}

	return <Outlet />
}

