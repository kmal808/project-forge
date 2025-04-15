import React from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import type { CrewPayroll, PayrollEntry } from '../types'

export function usePayroll() {
	const [crews, setCrews] = React.useState<CrewPayroll[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [error, setError] = React.useState<Error | null>(null)

	const fetchPayrollData = React.useCallback(async () => {
		try {
			setIsLoading(true)
			console.log('Fetching payroll data...')

			// First, fetch all crews
			const { data: crewsData, error: crewsError } = await supabase
				.from('crews')
				.select('id, name')
				.order('created_at', { ascending: false })

			if (crewsError) {
				console.error('Error fetching crews:', crewsError)
				throw crewsError
			}

			console.log('Raw crews data:', crewsData)

			// Then, for each crew, fetch its employees
			const crewsWithEmployees = await Promise.all(
				(crewsData || []).map(async (crew) => {
					const { data: employeesData, error: employeesError } = await supabase
						.from('employees')
						.select('id, name')
						.eq('crew_id', crew.id)

					if (employeesError) {
						console.error(`Error fetching employees for crew ${crew.id}:`, employeesError)
						throw employeesError
					}

					// For each employee, fetch their payroll entries
					const employeesWithEntries = await Promise.all(
						(employeesData || []).map(async (employee) => {
							const { data: entriesData, error: entriesError } = await supabase
								.from('payroll_entries')
								.select('*')
								.eq('employee_id', employee.id)

							if (entriesError) {
								console.error(`Error fetching entries for employee ${employee.id}:`, entriesError)
								throw entriesError
							}

							return {
								employeeId: employee.id,
								name: employee.name,
								entries: (entriesData || []).map((entry) => ({
									jobName: entry.job_name,
									jobNumber: entry.job_number,
									amounts: [
										entry.sunday_amount || 0,
										entry.monday_amount || 0,
										entry.tuesday_amount || 0,
										entry.wednesday_amount || 0,
										entry.thursday_amount || 0,
										entry.friday_amount || 0,
										entry.saturday_amount || 0,
									],
									date: entry.date,
								})),
							}
						})
					)

					return {
						crewId: crew.id,
						crewName: crew.name,
						employees: employeesWithEntries,
					}
				})
			)

			console.log('Transformed crews:', crewsWithEmployees)
			setCrews(crewsWithEmployees)
		} catch (err) {
			console.error('Error in fetchPayrollData:', err)
			setError(
				err instanceof Error ? err : new Error('Failed to fetch payroll data')
			)
			toast.error('Failed to fetch payroll data')
		} finally {
			setIsLoading(false)
		}
	}, [])

	React.useEffect(() => {
		fetchPayrollData()
	}, [fetchPayrollData])

	React.useEffect(() => {
		const channels = [
			supabase
				.channel('crews_changes')
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'crews' },
					() => fetchPayrollData()
				)
				.subscribe(),
			supabase
				.channel('employees_changes')
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'employees' },
					() => fetchPayrollData()
				)
				.subscribe(),
			supabase
				.channel('payroll_changes')
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'payroll_entries' },
					() => fetchPayrollData()
				)
				.subscribe(),
		]

		return () => {
			channels.forEach((channel) => supabase.removeChannel(channel))
		}
	}, [fetchPayrollData])

	const addCrew = async (crew: Omit<CrewPayroll, 'crewId'>) => {
		try {
			const { data: userData, error: userError } = await supabase.auth.getUser()
			if (userError) throw userError

			const { data, error } = await supabase
				.from('crews')
				.insert([
					{
						name: crew.crewName,
						user_id: userData.user.id,
					},
				])
				.select()
				.single()

			if (error) throw error

			setCrews((prev) => [
				...prev,
				{
					crewId: data.id,
					crewName: data.name,
					employees: [],
				},
			])

			toast.success('Crew added successfully')
			return data
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to add crew'
			toast.error(message)
			throw err
		}
	}

	const updateCrew = async (crewId: string, updates: Partial<CrewPayroll>) => {
		try {
			if (updates.crewName) {
				const { error } = await supabase
					.from('crews')
					.update({ name: updates.crewName })
					.eq('id', crewId)

				if (error) throw error
			}

			if (updates.employees) {
				const crew = crews.find((c) => c.crewId === crewId)
				if (!crew) throw new Error('Crew not found')

				const { data: userData, error: userError } =
					await supabase.auth.getUser()
				if (userError) throw userError

				// Update existing employees
				for (const employee of updates.employees) {
					const existingEmployee = crew.employees.find(
						(e) => e.employeeId === employee.employeeId
					)

					if (existingEmployee) {
						// Update employee name if it changed
						if (existingEmployee.name !== employee.name) {
							const { error } = await supabase
								.from('employees')
								.update({ name: employee.name })
								.eq('id', employee.employeeId)

							if (error) throw error
						}
					} else {
						// Add new employee
						const { error } = await supabase.from('employees').insert([
							{
								name: employee.name,
								crew_id: crewId,
								user_id: userData.user.id,
							},
						])

						if (error) throw error
					}
				}
			}

			await fetchPayrollData() // Refresh data
			toast.success('Crew updated successfully')
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to update crew'
			toast.error(message)
			throw err
		}
	}

	const deleteEmployee = async (employeeId: string) => {
		try {
			const { error } = await supabase
				.from('employees')
				.delete()
				.eq('id', employeeId)

			if (error) throw error

			setCrews((prev) =>
				prev.map((crew) => ({
					...crew,
					employees: crew.employees.filter(
						(emp) => emp.employeeId !== employeeId
					),
				}))
			)

			toast.success('Employee deleted successfully')
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to delete employee'
			toast.error(message)
			throw err
		}
	}

	const updateEmployeeEntries = async (
		crewId: string,
		employeeId: string,
		entries: PayrollEntry[]
	) => {
		try {
			const { data: userData, error: userError } = await supabase.auth.getUser()
			if (userError) throw userError

			// Delete existing entries for this employee
			const { error: deleteError } = await supabase
				.from('payroll_entries')
				.delete()
				.eq('employee_id', employeeId)

			if (deleteError) throw deleteError

			// Only insert new entries if there are any
			if (entries.length > 0) {
				// Now insert the entries with the correct structure
				for (const entry of entries) {
					// Calculate total amount for the week
					const totalAmount = entry.amounts.reduce((sum, amount) => sum + (Number(amount) || 0), 0)
					
					const { error: insertError } = await supabase
						.from('payroll_entries')
						.insert({
							employee_id: employeeId,
							job_name: entry.jobName,
							job_number: entry.jobNumber,
							amount: totalAmount,
							date: entry.date,
							user_id: userData.user.id,
						})

					if (insertError) {
						console.error('Error inserting entry:', insertError)
						throw insertError
					}
				}
			}

			// Update the local state immediately without refreshing
			setCrews(prev => prev.map(crew => {
				if (crew.crewId === crewId) {
					return {
						...crew,
						employees: crew.employees.map(emp => {
							if (emp.employeeId === employeeId) {
								return {
									...emp,
									entries: entries // Set to the new entries (empty array if deleted)
								}
							}
							return emp
						})
					}
				}
				return crew
			}))

			toast.success('Payroll entries updated successfully')
		} catch (err) {
			console.error('Error updating entries:', err)
			const message =
				err instanceof Error ? err.message : 'Failed to update payroll entries'
			toast.error(message)
			throw err
		}
	}

	const deleteCrew = async (crewId: string) => {
		try {
			const { error } = await supabase.from('crews').delete().eq('id', crewId)

			if (error) throw error

			setCrews((prev) => prev.filter((crew) => crew.crewId !== crewId))
			toast.success('Crew deleted successfully')
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to delete crew'
			toast.error(message)
			throw err
		}
	}

	return {
		crews,
		isLoading,
		error,
		addCrew,
		updateCrew,
		deleteCrew,
		deleteEmployee,
		updateEmployeeEntries,
		refresh: fetchPayrollData,
	}
}
