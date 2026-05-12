import React from 'react'
import { PayrollEntry, CrewPayroll } from '../../types'
import { usePayroll } from '../../hooks/usePayroll'
import { EmployeePayrollTable } from './CrewPayrollTable'
import {
	PlusCircle,
	FileDown,
	Edit2,
	Check,
	FileText,
	Trash2,
	Save,
} from 'lucide-react'
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
		submitAllEmployeeEntries,
		isLoading,
	} = usePayroll()
	const [editingCrewId, setEditingCrewId] = React.useState<string | null>(null)
	const [editingCrewName, setEditingCrewName] = React.useState('')
	const [draftEntries, setDraftEntries] = React.useState<
		Record<string, PayrollEntry[]>
	>({})
	const [isSubmittingAll, setIsSubmittingAll] = React.useState(false)

	const effectiveCrews = React.useMemo(
		() =>
			crews.map((crew) => ({
				...crew,
				employees: crew.employees.map((employee) => {
					const key = `${crew.crewId}-${employee.employeeId}`
					return {
						...employee,
						entries: draftEntries[key] || employee.entries,
					}
				}),
			})),
		[crews, draftEntries]
	)

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
		const crew = crews.find((c) => c.crewId === crewId)
		const employee = crew?.employees.find((emp) => emp.employeeId === employeeId)
		const baseEntries = draftEntries[key] || employee?.entries || []

		setDraftEntries((prev) => {
			const updatedEntries = [...baseEntries]
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
		const crew = crews.find((c) => c.crewId === crewId)
		const employee = crew?.employees.find((emp) => emp.employeeId === employeeId)
		const baseEntries = draftEntries[key] || employee?.entries || []

		setDraftEntries((prev) => ({
			...prev,
			[key]: [...baseEntries, entry],
		}))
	}

	const handleRemoveEntry = (
		crewId: string,
		employeeId: string,
		index: number
	) => {
		const key = `${crewId}-${employeeId}`
		const crew = crews.find((c) => c.crewId === crewId)
		const employee = crew?.employees.find((emp) => emp.employeeId === employeeId)
		const baseEntries = draftEntries[key] || employee?.entries || []

		setDraftEntries((prev) => {
			const entries = [...baseEntries]
			entries.splice(index, 1)
			return { ...prev, [key]: entries }
		})
	}

	const handleSubmitAllPayroll = async () => {
		setIsSubmittingAll(true)
		try {
			await submitAllEmployeeEntries(
				effectiveCrews.flatMap((crew) =>
					crew.employees.map((employee) => ({
						crewId: crew.crewId,
						employeeId: employee.employeeId,
						entries: employee.entries,
					}))
				)
			)
			setDraftEntries({})
		} catch (error) {
			console.error('Error submitting all payroll:', error)
			toast.error('Failed to submit payroll')
		} finally {
			setIsSubmittingAll(false)
		}
	}

	const exportPayroll = () => {
		const data = JSON.stringify(effectiveCrews, null, 2)
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

			const date = new Date().toLocaleDateString()
			printContainer.innerHTML = `
				<div data-pdf-block="report-header" style="margin-bottom: 24px; text-align: center;">
					<h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #1f2937;">Payroll Report</h1>
					<p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Generated on ${date}</p>
				</div>
				${effectiveCrews
					.map((crew) => {
						const crewTotal = crew.employees.reduce(
							(total, emp) =>
								total +
								emp.entries.reduce(
									(empTotal, entry) =>
										empTotal +
										entry.amounts.reduce((sum, amount) => sum + amount, 0),
									0
								),
							0
						)

						const employeeBlocks =
							crew.employees.length === 0
								? `
						<div data-pdf-block="employee" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
							<h3 style="font-size: 16px; font-weight: 500; margin: 0; color: #374151;">
								No employees
							</h3>
						</div>`
								: crew.employees
										.map((employee) => {
											const employeeTotal = employee.entries.reduce(
												(total, entry) =>
													total +
													entry.amounts.reduce((sum, amount) => sum + amount, 0),
												0
											)

											if (employee.entries.length === 0) {
												return `
													<div data-pdf-block="employee" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
														<h3 style="font-size: 16px; font-weight: 500; margin: 0; color: #374151;">
															${employee.name} - No entries
														</h3>
													</div>
												`
											}

											return `
							<div data-pdf-block="employee" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
								<h3 style="font-size: 16px; font-weight: 500; margin: 0 0 12px 0; color: #374151;">
									${employee.name} - Total: $${employeeTotal.toFixed(2)}
								</h3>
								<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
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
										${employee.entries
											.map(
												(entry) => `
											<tr>
												<td style="border: 1px solid #d1d5db; padding: 8px;">${entry.jobName}</td>
												<td style="border: 1px solid #d1d5db; padding: 8px;">${entry.jobNumber}</td>
												${entry.amounts
													.map(
														(amount) => `
													<td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">
														${amount > 0 ? '$' + amount.toFixed(2) : '-'}
													</td>
												`
													)
													.join('')}
											</tr>
										`
											)
											.join('')}
									</tbody>
								</table>
							</div>
						`
										})
										.join('')

						return `
							<div data-pdf-block="crew-header" style="margin-bottom: 12px;">
								<h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
									${crew.crewName} - Total: $${crewTotal.toFixed(2)}
								</h2>
							</div>
							${employeeBlocks}
						`
					})
					.join('')}
			`

			document.body.appendChild(printContainer)

			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4',
			})

			const margin = 10
			const pageWidth = pdf.internal.pageSize.getWidth()
			const pageHeight = pdf.internal.pageSize.getHeight()
			const contentWidth = pageWidth - margin * 2
			const maxContentHeight = pageHeight - margin * 2
			let currentY = margin

			const blocks = Array.from(
				printContainer.querySelectorAll<HTMLElement>('[data-pdf-block]')
			)
			let hasRenderedCrew = false

			for (const block of blocks) {
				const blockType = block.getAttribute('data-pdf-block')

				if (blockType === 'crew-header') {
					if (hasRenderedCrew) {
						pdf.addPage()
						currentY = margin
					}
					hasRenderedCrew = true
				}

				const canvas = await html2canvas(block, {
					scale: 2,
					useCORS: true,
					allowTaint: true,
					backgroundColor: '#ffffff',
				})

				const blockHeightMm = (canvas.height * contentWidth) / canvas.width

				if (
					blockHeightMm <= maxContentHeight &&
					currentY + blockHeightMm > pageHeight - margin
				) {
					pdf.addPage()
					currentY = margin
				}

				if (blockHeightMm <= maxContentHeight) {
					pdf.addImage(
						canvas.toDataURL('image/png'),
						'PNG',
						margin,
						currentY,
						contentWidth,
						blockHeightMm
					)
					currentY += blockHeightMm + 2
					continue
				}

				const maxSliceHeightPx = Math.floor(
					(maxContentHeight * canvas.width) / contentWidth
				)
				let sourceY = 0
				while (sourceY < canvas.height) {
					const sliceHeightPx = Math.min(maxSliceHeightPx, canvas.height - sourceY)
					const sliceCanvas = document.createElement('canvas')
					sliceCanvas.width = canvas.width
					sliceCanvas.height = sliceHeightPx
					const ctx = sliceCanvas.getContext('2d')
					if (!ctx) break

					ctx.drawImage(
						canvas,
						0,
						sourceY,
						canvas.width,
						sliceHeightPx,
						0,
						0,
						canvas.width,
						sliceHeightPx
					)

					const sliceHeightMm = (sliceHeightPx * contentWidth) / canvas.width
					if (currentY + sliceHeightMm > pageHeight - margin) {
						pdf.addPage()
						currentY = margin
					}

					pdf.addImage(
						sliceCanvas.toDataURL('image/png'),
						'PNG',
						margin,
						currentY,
						contentWidth,
						sliceHeightMm
					)

					currentY += sliceHeightMm + 1
					sourceY += sliceHeightPx
				}

				if (currentY > pageHeight - margin - 10) {
					pdf.addPage()
					currentY = margin
				}
			}

			document.body.removeChild(printContainer)

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
					<button
						onClick={handleSubmitAllPayroll}
						className='btn-primary'
						disabled={isSubmittingAll}>
						<Save size={18} />
						{isSubmittingAll ? 'Submitting...' : 'Submit All Payroll'}
					</button>
				</div>
			</div>

			<ErrorBoundary>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					effectiveCrews.map((crew) => (
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

							{crew.employees.map((employee) => (
								<EmployeePayrollTable
									key={employee.employeeId}
									employeeName={employee.name}
									onNameChange={(name) =>
										handleUpdateEmployeeName(
											crew.crewId,
											employee.employeeId,
											name
										)
									}
									onDelete={() => handleDeleteEmployee(employee.employeeId)}
									entries={employee.entries}
									onEntryChange={(index, entry) =>
										handleEntryChange(crew.crewId, employee.employeeId, index, entry)
									}
									onAddEntry={(entry) =>
										handleAddEntry(crew.crewId, employee.employeeId, entry)
									}
									onRemoveEntry={(index) =>
										handleRemoveEntry(crew.crewId, employee.employeeId, index)
									}
								/>
							))}
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
