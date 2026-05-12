import React from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import type { CrewPayroll, PayrollEntry } from '../types'

type PayrollSubmission = {
	crewId: string
	employeeId: string
	entries: PayrollEntry[]
}

const mapEntryToPayrollRow = (
	employeeId: string,
	entry: PayrollEntry,
	userId: string
) => ({
	employee_id: employeeId,
	job_name: entry.jobName,
	job_number: entry.jobNumber,
	sunday_amount: Number(entry.amounts[0]) || 0,
	monday_amount: Number(entry.amounts[1]) || 0,
	tuesday_amount: Number(entry.amounts[2]) || 0,
	wednesday_amount: Number(entry.amounts[3]) || 0,
	thursday_amount: Number(entry.amounts[4]) || 0,
	friday_amount: Number(entry.amounts[5]) || 0,
	saturday_amount: Number(entry.amounts[6]) || 0,
	date: entry.date,
	user_id: userId,
})

export function usePayroll() {
	const [crews, setCrews] = React.useState<CrewPayroll[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [error, setError] = React.useState<Error | null>(null)
	const suppressPayrollRefreshUntilRef = React.useRef<number>(0)

	const fetchPayrollData = React.useCallback(async () => {
		try {
			setIsLoading(true)
			console.log('Fetching payroll data...')

			const { data: crewsData, error: crewsError } = await supabase
				.from('crews')
				.select('id, name')
				.order('created_at', { ascending: false })

			if (crewsError) {
				console.error('Error fetching crews:', crewsError)
				throw crewsError
			}

			console.log('Raw crews data:', crewsData)

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
		const refreshPayrollData = () => {
			if (Date.now() < suppressPayrollRefreshUntilRef.current) {
				return
			}

			fetchPayrollData()
		}

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
					refreshPayrollData
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

				for (const employee of updates.employees) {
					const existingEmployee = crew.employees.find(
						(e) => e.employeeId === employee.employeeId
					)

					if (existingEmployee) {
						if (existingEmployee.name !== employee.name) {
							const { error } = await supabase
								.from('employees')
								.update({ name: employee.name })
								.eq('id', employee.employeeId)

							if (error) throw error
						}
					} else {
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

			await fetchPayrollData()
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

	const submitAllEmployeeEntries = async (submissions: PayrollSubmission[]) => {
		try {
			const { data: userData, error: userError } = await supabase.auth.getUser()
			if (userError) throw userError

			suppressPayrollRefreshUntilRef.current = Date.now() + 5000

			for (const submission of submissions) {
				const { error: deleteError } = await supabase
					.from('payroll_entries')
					.delete()
					.eq('employee_id', submission.employeeId)

				if (deleteError) throw deleteError

				if (submission.entries.length > 0) {
					const rows = submission.entries.map((entry) =>
						mapEntryToPayrollRow(submission.employeeId, entry, userData.user.id)
					)

					const { error: insertError } = await supabase
						.from('payroll_entries')
						.insert(rows)

					if (insertError) {
						console.error('Error inserting payroll entries:', insertError)
						throw insertError
					}
				}
			}

			setCrews((prev) =>
				prev.map((crew) => ({
					...crew,
					employees: crew.employees.map((employee) => ({
						...employee,
						entries: [],
					})),
				}))
			)

			toast.success('Payroll submitted successfully')
		} catch (err) {
			console.error('Error submitting payroll:', err)
			suppressPayrollRefreshUntilRef.current = 0
			const message =
				err instanceof Error ? err.message : 'Failed to submit payroll'
			toast.error(message)
			throw err
		}
	}

	const updateEmployeeEntries = async (
		crewId: string,
		employeeId: string,
		entries: PayrollEntry[]
	) => {
		await submitAllEmployeeEntries([{ crewId, employeeId, entries }])

		setCrews((prev) =>
			prev.map((crew) => {
				if (crew.crewId !== crewId) return crew

				return {
					...crew,
					employees: crew.employees.map((employee) =>
						employee.employeeId === employeeId
							? { ...employee, entries }
							: employee
					),
				}
			})
		)
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
		submitAllEmployeeEntries,
		refresh: fetchPayrollData,
	}
}
