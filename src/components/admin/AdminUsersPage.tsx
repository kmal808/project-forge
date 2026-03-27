import React from 'react'
import { supabase } from '../../lib/supabase'
import type { UserRole } from '../../types'
import { toast } from 'sonner'
import { Trash2, UserPlus } from 'lucide-react'

type RoleRow = {
	id: string
	userId: string
	role: UserRole
	email?: string
	name?: string
	employeeId?: string
	crewName?: string
}

type EmployeeRow = {
	id: string
	name: string
	crewId?: string
	userId?: string
}

const ROLE_OPTIONS: UserRole[] = ['admin', 'warehouse', 'sales', 'crew']

function coerceRole(value: unknown): UserRole | null {
	if (typeof value !== 'string') return null
	const normalized = value.trim().toLowerCase()
	if (
		normalized === 'admin' ||
		normalized === 'warehouse' ||
		normalized === 'sales' ||
		normalized === 'crew'
	) {
		return normalized
	}
	return null
}

export function AdminUsersPage() {
	const [rows, setRows] = React.useState<RoleRow[]>([])
	const [employees, setEmployees] = React.useState<EmployeeRow[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [newUserId, setNewUserId] = React.useState('')
	const [newRole, setNewRole] = React.useState<UserRole>('crew')
	const [newEmployeeId, setNewEmployeeId] = React.useState('')
	const [savingId, setSavingId] = React.useState<string | null>(null)
	const [linkByRoleId, setLinkByRoleId] = React.useState<Record<string, string>>({})

	const formatUserId = (value: string) => {
		if (value.length <= 16) return value
		return `${value.slice(0, 8)}...${value.slice(-8)}`
	}

	const fetchRoles = React.useCallback(async () => {
		try {
			setIsLoading(true)
			const [
				{ data, error },
				{ data: employeesData, error: employeesError },
				{ data: crewsData, error: crewsError },
			] =
				await Promise.all([
					(supabase as any)
						.from('roles')
						.select('*')
						.order('created_at', { ascending: false }),
					(supabase as any).from('employees').select('id, user_id, name, crew_id'),
					(supabase as any).from('crews').select('id, name'),
				])

			if (employeesError) {
				// Non-blocking: role management still works without employee names.
				console.warn('Failed to load employee names:', employeesError)
			}
			if (crewsError) {
				console.warn('Failed to load crews:', crewsError)
			}

			const crewNameById = new Map<string, string>()
			for (const crew of Array.isArray(crewsData) ? crewsData : []) {
				const id = String(crew.id ?? '').trim()
				const name = String(crew.name ?? '').trim()
				if (id && name) crewNameById.set(id, name)
			}

			const normalizedEmployees: EmployeeRow[] = (
				Array.isArray(employeesData) ? employeesData : []
			)
				.map((employee: Record<string, unknown>) => {
					const id = String(employee.id ?? '').trim()
					const name = String(employee.name ?? '').trim()
					const crewId = String(employee.crew_id ?? employee.crewId ?? '').trim()
					const userId = String(employee.user_id ?? employee.userId ?? '').trim()
					if (!id || !name) return null
					return {
						id,
						name,
						crewId: crewId || undefined,
						userId: userId || undefined,
					}
				})
				.filter(Boolean) as EmployeeRow[]

			setEmployees(normalizedEmployees)

			const employeeByUserId = new Map<string, EmployeeRow>()
			for (const employee of normalizedEmployees) {
				if (employee.userId && !employeeByUserId.has(employee.userId)) {
					employeeByUserId.set(employee.userId, employee)
				}
			}

			if (error) throw error

			const mapped = (Array.isArray(data) ? data : [])
				.map((row: Record<string, unknown>) => {
					const role = coerceRole(
						row.role ??
							row.name ??
							row.user_role ??
							row.userRole ??
							row.role_name ??
							row.roleName
					)
					const userId = String(
						row.user_id ??
							row.userId ??
							row.uid ??
							row.auth_user_id ??
							row.authUserId ??
							''
					)

					if (!role || !userId) return null

					const email = String(
						row.email ?? row.user_email ?? row.userEmail ?? row.auth_email ?? ''
					).trim()
					const name = String(
						row.name ??
							row.full_name ??
							row.fullName ??
							row.display_name ??
							row.displayName ??
							employeeByUserId.get(userId)?.name ??
							''
					).trim()
					const employee = employeeByUserId.get(userId)
					const crewName =
						employee?.crewId && crewNameById.get(employee.crewId)
							? crewNameById.get(employee.crewId)
							: undefined

					return {
						id: String(row.id ?? userId),
						userId,
						role,
						email: email || undefined,
						name: name || undefined,
						employeeId: employee?.id,
						crewName,
					} as RoleRow
				})
				.filter(Boolean) as RoleRow[]

			setRows(mapped)
		} catch (err) {
			console.error('Failed to fetch roles:', err)
			toast.error('Failed to load role assignments')
		} finally {
			setIsLoading(false)
		}
	}, [])

	React.useEffect(() => {
		fetchRoles()
	}, [fetchRoles])

	const addRoleAssignment = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newUserId.trim()) {
			toast.error('User ID is required')
			return
		}

		try {
			setSavingId('new')
			const payload = {
				user_id: newUserId.trim(),
				role: newRole,
			}
			const { error } = await (supabase as any).from('roles').insert(payload)
			if (error) throw error

			if (newEmployeeId) {
				const { error: linkError } = await (supabase as any)
					.from('employees')
					.update({ user_id: newUserId.trim() })
					.eq('id', newEmployeeId)
				if (linkError) throw linkError
			}

			toast.success('Role assignment added')
			setNewUserId('')
			setNewRole('crew')
			setNewEmployeeId('')
			await fetchRoles()
		} catch (err) {
			console.error('Failed to add role assignment:', err)
			toast.error('Failed to add role assignment')
		} finally {
			setSavingId(null)
		}
	}

	const updateRole = async (row: RoleRow, role: UserRole) => {
		try {
			setSavingId(row.id)
			const { error } = await (supabase as any)
				.from('roles')
				.update({ role })
				.eq('id', row.id)
			if (error) throw error

			setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role } : r)))
			toast.success('Role updated')
		} catch (err) {
			console.error('Failed to update role:', err)
			toast.error('Failed to update role')
		} finally {
			setSavingId(null)
		}
	}

	const removeRoleAssignment = async (row: RoleRow) => {
		if (
			!window.confirm(
				`Remove role assignment for user ${row.userId}? They will lose gated access.`
			)
		) {
			return
		}

		try {
			setSavingId(row.id)
			const { error } = await (supabase as any).from('roles').delete().eq('id', row.id)
			if (error) throw error
			setRows((prev) => prev.filter((r) => r.id !== row.id))
			toast.success('Role assignment removed')
		} catch (err) {
			console.error('Failed to remove role assignment:', err)
			toast.error('Failed to remove role assignment')
		} finally {
			setSavingId(null)
		}
	}

	const linkEmployeeToUser = async (row: RoleRow) => {
		const selectedEmployeeId = linkByRoleId[row.id]
		if (!selectedEmployeeId) {
			toast.error('Select an employee to link')
			return
		}

		try {
			setSavingId(row.id)
			const { error } = await (supabase as any)
				.from('employees')
				.update({ user_id: row.userId })
				.eq('id', selectedEmployeeId)
			if (error) throw error
			toast.success('Employee linked to user')
			setLinkByRoleId((prev) => ({ ...prev, [row.id]: '' }))
			await fetchRoles()
		} catch (err) {
			console.error('Failed to link employee:', err)
			toast.error('Failed to link employee')
		} finally {
			setSavingId(null)
		}
	}

	const unlinkedEmployees = employees.filter((employee) => !employee.userId)

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-secondary'>Admin Users</h1>
				<p className='mt-1 text-sm text-secondary'>
					Manage role assignments used by route access controls.
				</p>
			</div>

			<div className='rounded-lg border border-primary bg-primary p-6'>
				<h2 className='text-lg font-semibold text-secondary'>Add Role Assignment</h2>
				<form onSubmit={addRoleAssignment} className='mt-4 grid gap-4 sm:grid-cols-3'>
					<input
						type='text'
						value={newUserId}
						onChange={(e) => setNewUserId(e.target.value)}
						placeholder='Auth User UUID'
						className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
					/>
					<select
						value={newRole}
						onChange={(e) => setNewRole(e.target.value as UserRole)}
						className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'>
						{ROLE_OPTIONS.map((role) => (
							<option key={role} value={role}>
								{role}
							</option>
						))}
					</select>
					<select
						value={newEmployeeId}
						onChange={(e) => setNewEmployeeId(e.target.value)}
						className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'>
						<option value=''>Optional: Link Employee</option>
						{unlinkedEmployees.map((employee) => (
							<option key={employee.id} value={employee.id}>
								{employee.name}
							</option>
						))}
					</select>
					<button
						type='submit'
						className='btn-primary sm:col-span-3'
						disabled={savingId === 'new'}>
						<UserPlus className='h-4 w-4' />
						Add
					</button>
				</form>
			</div>

			<div className='overflow-hidden rounded-lg border border-primary bg-primary'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
								Identity
							</th>
							<th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
								Role
							</th>
							<th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
								Crew
							</th>
							<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-200'>
						{isLoading ? (
							<tr>
								<td className='px-4 py-6 text-sm text-secondary' colSpan={4}>
									Loading role assignments...
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td className='px-4 py-6 text-sm text-secondary' colSpan={4}>
									No role assignments found.
								</td>
							</tr>
						) : (
							rows.map((row) => (
								<tr key={row.id}>
									<td className='px-4 py-3 text-sm text-secondary'>
										<div className='space-y-0.5'>
											<div className='font-medium text-secondary'>
												{row.name || row.email || formatUserId(row.userId)}
											</div>
											<div className='text-xs text-gray-500'>{row.userId}</div>
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										<select
											value={row.role}
											onChange={(e) =>
												updateRole(row, e.target.value as UserRole)
											}
											disabled={savingId === row.id}
											className='rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800'>
											{ROLE_OPTIONS.map((role) => (
												<option key={role} value={role}>
													{role}
												</option>
											))}
										</select>
									</td>
									<td className='px-4 py-3 text-sm text-secondary'>
										{row.crewName || '-'}
									</td>
									<td className='px-4 py-3 text-right'>
										<div className='flex items-center justify-end gap-2'>
											{!row.employeeId && (
												<>
													<select
														value={linkByRoleId[row.id] || ''}
														onChange={(e) =>
															setLinkByRoleId((prev) => ({
																...prev,
																[row.id]: e.target.value,
															}))
														}
														disabled={savingId === row.id}
														className='rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800'>
														<option value=''>Link employee...</option>
														{unlinkedEmployees.map((employee) => (
															<option key={employee.id} value={employee.id}>
																{employee.name}
															</option>
														))}
													</select>
													<button
														type='button'
														onClick={() => linkEmployeeToUser(row)}
														disabled={savingId === row.id}
														className='rounded-md border border-primary px-2 py-1 text-xs text-secondary hover:bg-secondary'>
														Link
													</button>
												</>
											)}
											<button
												type='button'
												onClick={() => removeRoleAssignment(row)}
												disabled={savingId === row.id}
												className='inline-flex items-center rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-800'>
												<Trash2 className='h-4 w-4' />
												<span className='sr-only'>Remove role assignment</span>
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

