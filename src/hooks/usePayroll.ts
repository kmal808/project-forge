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

			// Fetch crews with their employees and payroll entries
			const { data: crewsData, error: crewsError } = await supabase
				.from('crews')
				.select(
					`
          id,
          name,
          employees (
            id,
            name,
            payroll_entries (
              id,
              job_name,
              job_number,
              sunday_amount,
              monday_amount,
              tuesday_amount,
              wednesday_amount,
              thursday_amount,
              friday_amount,
              saturday_amount,
              date
            )
          )
        `
				)
				.order('created_at', { ascending: false })

			if (crewsError) throw crewsError

			// Transform the data to match our frontend structure
			const transformedCrews: CrewPayroll[] = (crewsData || []).map((crew) => ({
				crewId: crew.id,
				crewName: crew.name,
				employees: crew.employees.map((emp) => ({
					employeeId: emp.id,
					name: emp.name,
					entries: emp.payroll_entries.map((entry) => ({
						jobName: entry.job_name,
						jobNumber: entry.job_number,
						amounts: [
							entry.sunday_amount,
							entry.monday_amount,
							entry.tuesday_amount,
							entry.wednesday_amount,
							entry.thursday_amount,
							entry.friday_amount,
							entry.saturday_amount,
						],
						date: entry.date,
					})),
				})),
			}))

			setCrews(transformedCrews)
		} catch (err) {
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

			// Delete existing entries
			const { error: deleteError } = await supabase
				.from('payroll_entries')
				.delete()
				.eq('employee_id', employeeId)

			if (deleteError) throw deleteError

			// Insert new entries
			if (entries.length > 0) {
				const { error: insertError } = await supabase
					.from('payroll_entries')
					.insert(
						entries.map((entry) => ({
							employee_id: employeeId,
							job_name: entry.jobName,
							job_number: entry.jobNumber,
							sunday_amount: entry.amounts[0],
							monday_amount: entry.amounts[1],
							tuesday_amount: entry.amounts[2],
							wednesday_amount: entry.amounts[3],
							thursday_amount: entry.amounts[4],
							friday_amount: entry.amounts[5],
							saturday_amount: entry.amounts[6],
							date: entry.date,
							user_id: userData.user.id,
						}))
					)

				if (insertError) throw insertError
			}

			await fetchPayrollData() // Refresh data
			toast.success('Payroll entries updated successfully')
		} catch (err) {
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
