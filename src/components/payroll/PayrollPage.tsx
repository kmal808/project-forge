import React from 'react'
import { PayrollEntry, CrewPayroll } from '../../types'
import { usePayroll } from '../../hooks/usePayroll'
import { EmployeePayrollTable } from './CrewPayrollTable'
import { PlusCircle, FileDown, Edit2, Check, FileText, Trash2 } from 'lucide-react'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

	const handleDeleteCrew = async (crewId: string) => {
		const crew = crews.find((c) => c.crewId === crewId)
		if (!crew) return

		// Check if crew has employees
		if (crew.employees.length > 0) {
			toast.error(
				`Cannot delete crew "${crew.crewName}". Please remove all employees first.`,
				{ duration: 4000 }
			)
			return
		}

		if (
			window.confirm(
				`Are you sure you want to delete the crew "${crew.crewName}"? This action cannot be undone.`
			)
		) {
			try {
				await deleteCrew(crewId)
				toast.success(`Crew "${crew.crewName}" deleted successfully`)
			} catch (error) {
				console.error('Error deleting crew:', error)
				toast.error('Failed to delete crew')
			}
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
		try {
			await updateEmployeeEntries(crewId, employeeId, entries)
			// Clear the draft entries for this employee
			const key = `${crewId}-${employeeId}`
			setDraftEntries((prev) => {
				const newDrafts = { ...prev }

				delete newDrafts[key]
				return newDrafts
			})
		} catch (error) {
			console.error('Error submitting entries:', error)
			toast.error('Failed to submit entries')
		}
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

	const exportPayrollPDF = async () => {
		try {
			toast.loading('Generating PDF...', { id: 'pdf-export' })
			
			// Create a container for the PDF content
			const printContainer = document.createElement('div')
			printContainer.style.cssText = `
				position: absolute;
				top: -9999px;
				left: -9999px;
				width: 210mm;
				background: white;
				padding: 20px;
				font-family: system-ui, -apple-system, sans-serif;
			`
			
			// Generate PDF content
			const date = new Date().toLocaleDateString()
			printContainer.innerHTML = `
				<div style="margin-bottom: 30px; text-align: center;">
					<h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #1f2937;">Payroll Report</h1>
					<p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Generated on ${date}</p>
				</div>
				${crews.map(crew => {
					const crewTotal = crew.employees.reduce((total, emp) => 
						total + emp.entries.reduce((empTotal, entry) => 
							empTotal + entry.amounts.reduce((sum, amount) => sum + amount, 0), 0), 0)
					
					return `
						<div style="margin-bottom: 40px; page-break-inside: avoid;">
							<h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
								${crew.crewName} - Total: $${crewTotal.toFixed(2)}
							</h2>
							${crew.employees.map(employee => {
								const employeeTotal = employee.entries.reduce((total, entry) => 
									total + entry.amounts.reduce((sum, amount) => sum + amount, 0), 0)
								
								if (employee.entries.length === 0) {
									return `
										<div style="margin-bottom: 20px;">
											<h3 style="font-size: 16px; font-weight: 500; margin-bottom: 10px; color: #374151;">
												${employee.name} - No entries
											</h3>
										</div>
									`
								}
								
								return `
									<div style="margin-bottom: 30px; page-break-inside: avoid; break-inside: avoid;">
										<h3 style="font-size: 16px; font-weight: 500; margin-bottom: 15px; color: #374151;">
											${employee.name} - Total: $${employeeTotal.toFixed(2)}
										</h3>
										<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid;">
											<thead>
												<tr style="background-color: #f9fafb;">
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: 600;">Job</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: 600;">#</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Sun</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Mon</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Tue</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Wed</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Thu</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Fri</th>
													<th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: 600;">Sat</th>
												</tr>
											</thead>
											<tbody>
												${employee.entries.map(entry => `
													<tr>
														<td style="border: 1px solid #d1d5db; padding: 8px;">${entry.jobName}</td>
														<td style="border: 1px solid #d1d5db; padding: 8px;">${entry.jobNumber}</td>
														${entry.amounts.map(amount => `
															<td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">
																${amount > 0 ? '$' + amount.toFixed(2) : '-'}
															</td>
														`).join('')}
													</tr>
												`).join('')}
											</tbody>
										</table>
									</div>
								`
							}).join('')}
						</div>
					`
				}).join('')}
			`
			
			document.body.appendChild(printContainer)
			
			// Capture the content as canvas
			const canvas = await html2canvas(printContainer, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff'
			})
			
			// Remove the temporary container
			document.body.removeChild(printContainer)
			
			// Create PDF
			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			})
			
			const imgWidth = 210
			const pageHeight = 295
			const imgHeight = (canvas.height * imgWidth) / canvas.width
			let heightLeft = imgHeight
			let position = 0
			
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight
			
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight
				pdf.addPage()
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
				heightLeft -= pageHeight
			}
			
			const filename = `payroll-report-${new Date().toISOString().split('T')[0]}.pdf`
			pdf.save(filename)
			
			toast.success('PDF exported successfully!', { id: 'pdf-export' })
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast.error('Failed to generate PDF', { id: 'pdf-export' })
		}
	}

	return (
		<div className='space-y-8'>
			<div className='card-header flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold text-primary mb-2'>Payroll Management</h2>
					<p className='text-secondary'>Manage crew payroll and employee entries</p>
				</div>
				<div className='flex gap-3'>
					<button onClick={exportPayrollPDF} className='btn-primary'>
						<FileText size={18} />
						Export PDF
					</button>
					<button onClick={exportPayroll} className='btn-secondary'>
						<FileDown size={18} />
						Export JSON
					</button>
				</div>
			</div>

			<ErrorBoundary>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					crews.map((crew) => (
						<div
							key={crew.crewId}
							className='card'>
							<div className='mb-6 flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									{editingCrewId === crew.crewId ? (
										<input
											type='text'
											value={editingCrewName}
											onChange={(e) => setEditingCrewName(e.target.value)}
											className='rounded-md border-primary text-slate-900 text-xl font-semibold'
											autoFocus
										/>
									) : (
										<h3 className='text-xl font-semibold text-slate-900'>
											{crew.crewName}
										</h3>
									)}
									<button
										onClick={() => handleEditCrewName(crew)}
										className='ml-2 rounded-full p-1 text-primary hover:accent hover:text-slate-900 hover:accent-hover'>
										{editingCrewId === crew.crewId ? (
											<Check className='h-5 w-5' />
										) : (
											<Edit2 className='h-5 w-5' />
										)}
									</button>
									<button
										onClick={() => handleDeleteCrew(crew.crewId)}
										className='ml-1 rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600'
										title={crew.employees.length > 0 ? 'Remove all employees first' : 'Delete crew'}>
										<Trash2 className='h-5 w-5' />
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
										crewId={crew.crewId}
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
				<div className='flex justify-center'>
					<button
						onClick={handleAddCrew}
						className='btn-secondary border-2 border-dashed border-primary/30 hover:border-(--color-accent)/50 text-lg px-8 py-4'>
						<PlusCircle size={24} />
						Add New Crew
					</button>
				</div>
			</ErrorBoundary>
		</div>
	)
}
