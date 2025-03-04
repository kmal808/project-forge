import React from 'react'
import { PayrollEntry, CrewPayroll } from '../../types'
import { usePayroll } from '../../hooks/usePayroll'
import { EmployeePayrollTable } from './CrewPayrollTable'
import { PlusCircle, FileDown, Edit2, Check } from 'lucide-react'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export function PayrollPage() {
	const {
		crews,
		addCrew,
		updateCrew,
		deleteCrew,
		deleteEmployee,
		updateEmployeeEntries,
		isLoading,
	} = usePayroll()
	const [editingCrewId, setEditingCrewId] = React.useState<string | null>(null)
	const [editingCrewName, setEditingCrewName] = React.useState('')
	const [draftEntries, setDraftEntries] = React.useState<
		Record<string, PayrollEntry[]>
	>({})

	const handleAddCrew = async () => {
		const newCrewName = `Crew ${crews.length + 1}`
		await addCrew({
			crewName: newCrewName,
			employees: [],
		})
	}

	const handleAddEmployee = async (crewId: string) => {
		const crew = crews.find((c) => c.crewId === crewId)
		if (crew) {
			const employeeNumber = crew.employees.length + 1
			const newEmployeeName = `Employee ${employeeNumber}`
			await updateCrew(crewId, {
				employees: [
					...crew.employees,
					{
						employeeId: `emp-${Date.now()}`,
						name: newEmployeeName,
						entries: [],
					},
				],
			})
		}
	}

	const handleEditCrewName = async (crew: CrewPayroll) => {
		if (editingCrewId === crew.crewId) {
			await updateCrew(crew.crewId, { crewName: editingCrewName })
			setEditingCrewId(null)
		} else {
			setEditingCrewId(crew.crewId)
			setEditingCrewName(crew.crewName)
		}
	}

	const handleUpdateEmployeeName = async (
		crewId: string,
		employeeId: string,
		newName: string
	) => {
		const crew = crews.find((c) => c.crewId === crewId)
		if (crew) {
			const updatedEmployees = crew.employees.map((emp) =>
				emp.employeeId === employeeId ? { ...emp, name: newName } : emp
			)
			await updateCrew(crewId, { employees: updatedEmployees })
		}
	}

	const handleDeleteEmployee = async (employeeId: string) => {
		if (
			window.confirm(
				'Are you sure you want to delete this employee? This action cannot be undone.'
			)
		) {
			await deleteEmployee(employeeId)
		}
	}

	const handleEntryChange = (
		crewId: string,
		employeeId: string,
		entryIndex: number,
		newEntry: PayrollEntry
	) => {
		const key = `${crewId}-${employeeId}`
		setDraftEntries((prev) => {
			const currentEntries = prev[key] || []
			const updatedEntries = [...currentEntries]
			updatedEntries[entryIndex] = newEntry
			return { ...prev, [key]: updatedEntries }
		})
	}

	const handleAddEntry = (
		crewId: string,
		employeeId: string,
		entry: PayrollEntry
	) => {
		const key = `${crewId}-${employeeId}`
		setDraftEntries((prev) => ({
			...prev,
			[key]: [...(prev[key] || []), entry],
		}))
	}

	const handleRemoveEntry = (
		crewId: string,
		employeeId: string,
		index: number
	) => {
		const key = `${crewId}-${employeeId}`
		setDraftEntries((prev) => {
			const entries = [...(prev[key] || [])]
			entries.splice(index, 1)
			return { ...prev, [key]: entries }
		})
	}

	const handleSubmitEntries = async (
		crewId: string,
		employeeId: string,
		entries: PayrollEntry[]
	) => {
		await updateEmployeeEntries(crewId, employeeId, entries)
		const key = `${crewId}-${employeeId}`
		setDraftEntries((prev) => {
			const newDrafts = { ...prev }
			delete newDrafts[key]
			return newDrafts
		})
	}

	const exportPayroll = () => {
		const data = JSON.stringify(crews, null, 2)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `payroll-export-${new Date().toISOString().split('T')[0]}.json`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-gray-900'>Payroll Management</h2>
				<button onClick={exportPayroll} className='btn-primary'>
					<FileDown size={20} />
					Export Payroll
				</button>
			</div>

			<ErrorBoundary>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					crews.map((crew) => (
						<div
							key={crew.crewId}
							className='rounded-lg border border-gray-200 bg-white p-6'>
							<div className='mb-6 flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									{editingCrewId === crew.crewId ? (
										<input
											type='text'
											value={editingCrewName}
											onChange={(e) => setEditingCrewName(e.target.value)}
											className='rounded-md border-gray-300 text-xl font-semibold'
											autoFocus
										/>
									) : (
										<h3 className='text-xl font-semibold text-gray-900'>
											{crew.crewName}
										</h3>
									)}
									<button
										onClick={() => handleEditCrewName(crew)}
										className='ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
										{editingCrewId === crew.crewId ? (
											<Check className='h-5 w-5' />
										) : (
											<Edit2 className='h-5 w-5' />
										)}
									</button>
								</div>
								<button
									onClick={() => handleAddEmployee(crew.crewId)}
									className='btn-primary'>
									<PlusCircle size={20} />
									Add Employee
								</button>
							</div>

							{crew.employees.map((employee) => {
								const key = `${crew.crewId}-${employee.employeeId}`
								const employeeEntries = draftEntries[key] || employee.entries

								return (
									<EmployeePayrollTable
										key={employee.employeeId}
										employeeId={employee.employeeId}
										employeeName={employee.name}
										onNameChange={(name) =>
											handleUpdateEmployeeName(
												crew.crewId,
												employee.employeeId,
												name
											)
										}
										onDelete={() => handleDeleteEmployee(employee.employeeId)}
										entries={employeeEntries}
										onEntryChange={(index, entry) =>
											handleEntryChange(
												crew.crewId,
												employee.employeeId,
												index,
												entry
											)
										}
										onAddEntry={(entry) =>
											handleAddEntry(crew.crewId, employee.employeeId, entry)
										}
										onRemoveEntry={(index) =>
											handleRemoveEntry(crew.crewId, employee.employeeId, index)
										}
										onSubmitEntries={(entries) =>
											handleSubmitEntries(
												crew.crewId,
												employee.employeeId,
												entries
											)
										}
									/>
								)
							})}
						</div>
					))
				)}
			</ErrorBoundary>

			<ErrorBoundary>
				<button
					onClick={handleAddCrew}
					className='mt-6 btn-secondary border-2 border-dashed'>
					<PlusCircle size={20} />
					Add New Crew
				</button>
			</ErrorBoundary>
		</div>
	)
}
