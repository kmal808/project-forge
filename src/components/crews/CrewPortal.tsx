import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { WalkthroughForm } from './WalkthroughForm'
import { MaterialsList } from './MaterialsList'
import { PunchList } from './PunchList'
import { FileUploader } from './FileUploader'
import { ClipboardList, Package2, CheckSquare, Upload } from 'lucide-react'
import { useMaterials } from '../../hooks/useMaterials'
import { usePunchList } from '../../hooks/usePunchList'
import { useMaterialLists } from '../../hooks/useMaterialLists'
import { usePunchLists } from '../../hooks/usePunchLists'
import { usePayroll } from '../../hooks/usePayroll'
import { useFiles } from '../../hooks/useFiles'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { MaterialItem, PunchListItem, FileUpload } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

export function CrewPortal() {
	const { user } = useAuth()
	const { crews, isLoading: crewsLoading } = usePayroll()
	const [selectedCrewId, setSelectedCrewId] = React.useState<string>('')
	const [selectedMaterialListId, setSelectedMaterialListId] = React.useState('')
	const [selectedPunchListId, setSelectedPunchListId] = React.useState('')
	const [newMaterialJobName, setNewMaterialJobName] = React.useState('')
	const [newMaterialJobNumber, setNewMaterialJobNumber] = React.useState('')
	const [newPunchJobName, setNewPunchJobName] = React.useState('')
	const [newPunchJobNumber, setNewPunchJobNumber] = React.useState('')

	const linkedCrewId = React.useMemo(() => {
		if (!user?.id) return ''
		for (const crew of crews) {
			if (crew.employees.some((employee) => employee.employeeId === user.id)) {
				return crew.crewId
			}
		}
		return ''
	}, [crews, user?.id])

	React.useEffect(() => {
		if (!user) return
		if (user.role === 'crew') {
			setSelectedCrewId(linkedCrewId || '')
			return
		}
		if (!selectedCrewId && crews[0]) {
			setSelectedCrewId(crews[0].crewId)
		}
	}, [user, linkedCrewId, crews, selectedCrewId])

	const activeCrewId = user?.role === 'crew' ? linkedCrewId : selectedCrewId

	const {
		lists: materialLists,
		addList: addMaterialList,
		isLoading: materialListsLoading,
	} = useMaterialLists(activeCrewId)
	const {
		lists: punchLists,
		addList: addPunchList,
		isLoading: punchListsLoading,
	} = usePunchLists(activeCrewId)

	React.useEffect(() => {
		if (!materialLists.length) {
			setSelectedMaterialListId('')
			return
		}
		if (!materialLists.some((list) => list.id === selectedMaterialListId)) {
			setSelectedMaterialListId(materialLists[0].id)
		}
	}, [materialLists, selectedMaterialListId])

	React.useEffect(() => {
		if (!punchLists.length) {
			setSelectedPunchListId('')
			return
		}
		if (!punchLists.some((list) => list.id === selectedPunchListId)) {
			setSelectedPunchListId(punchLists[0].id)
		}
	}, [punchLists, selectedPunchListId])

	const selectedMaterialList = materialLists.find(
		(list) => list.id === selectedMaterialListId
	)
	const selectedPunchList = punchLists.find((list) => list.id === selectedPunchListId)

	const {
		materials,
		addMaterial,
		updateMaterial,
		deleteMaterial,
		isLoading: materialsLoading,
	} = useMaterials(selectedMaterialListId)
	const {
		items: punchListItems,
		addItem: addPunchListItem,
		updateItem: updatePunchListItem,
		deleteItem: deletePunchListItem,
		isLoading: punchItemsLoading,
	} = usePunchList(selectedPunchListId)
	const { addFile } = useFiles()

	const handleAddMaterial = async (material: Omit<MaterialItem, 'id'>) => {
		await addMaterial(material)
	}

	const handleUpdateMaterial = async (
		id: string,
		updates: Partial<MaterialItem>
	) => {
		await updateMaterial(id, updates)
	}

	const handleDeleteMaterial = async (id: string) => {
		await deleteMaterial(id)
	}

	const handleAddPunchListItem = async (item: Omit<PunchListItem, 'id'>) => {
		await addPunchListItem(item)
	}

	const handleUpdatePunchListItem = async (
		id: string,
		updates: Partial<PunchListItem>
	) => {
		await updatePunchListItem(id, updates)
	}

	const handleDeletePunchListItem = async (id: string) => {
		await deletePunchListItem(id)
	}

	const handleCreateMaterialList = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activeCrewId) return
		await addMaterialList({
			crewId: activeCrewId,
			jobName: newMaterialJobName.trim(),
			jobNumber: newMaterialJobNumber.trim(),
		})
		setNewMaterialJobName('')
		setNewMaterialJobNumber('')
	}

	const handleCreatePunchList = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activeCrewId) return
		await addPunchList({
			crewId: activeCrewId,
			jobName: newPunchJobName.trim(),
			jobNumber: newPunchJobNumber.trim(),
		})
		setNewPunchJobName('')
		setNewPunchJobNumber('')
	}

	const handleFileUpload = async (files: FileUpload[]) => {
		for (const file of files) {
			await addFile(file)
		}
	}

	return (
		<div className='min-h-screen bg-secondary py-8'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-primary'>Installer Portal</h1>
					<p className='mt-2 text-sm text-primary'>
						Manage your job site tasks, materials, and documentation
					</p>
				</div>

				<div className='mb-4 rounded-lg border border-primary bg-primary p-4'>
					<div className='flex flex-wrap items-center gap-3'>
						<span className='text-sm font-semibold text-secondary'>Active Crew</span>
						{user?.role === 'crew' ? (
							<span className='text-sm text-secondary'>
								{crews.find((crew) => crew.crewId === activeCrewId)?.crewName ||
									'No linked crew'}
							</span>
						) : (
							<select
								value={selectedCrewId}
								onChange={(e) => setSelectedCrewId(e.target.value)}
								className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'>
								<option value=''>Select crew...</option>
								{crews.map((crew) => (
									<option key={crew.crewId} value={crew.crewId}>
										{crew.crewName}
									</option>
								))}
							</select>
						)}
					</div>
				</div>

				<Tabs defaultValue='materials' className='space-y-6'>
					<TabsList className='bg-primary p-1 grid grid-cols-4 gap-1'>
						<TabsTrigger
							value='materials'
							className='flex items-center justify-center'>
							<Package2 className='h-5 w-5 group-hover:hidden' />
							<span className='absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
								Materials List
							</span>
						</TabsTrigger>
						<TabsTrigger
							value='punch-list'
							className='flex items-center justify-center'>
							<CheckSquare className='h-5 w-5 group-hover:hidden' />
							<span className='absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
								Punch List
							</span>
						</TabsTrigger>
						<TabsTrigger
							value='files'
							className='flex items-center justify-center'>
							<Upload className='h-5 w-5 group-hover:hidden' />
							<span className='absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
								File Upload
							</span>
						</TabsTrigger>
						<TabsTrigger
							value='walkthrough'
							className='flex items-center justify-center'>
							<ClipboardList className='h-5 w-5 group-hover:hidden' />
							<span className='absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
								Walkthrough
							</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value='materials'
						className='rounded-lg bg-primary p-6 shadow-sm'>
						<ErrorBoundary>
							<div className='mb-4 grid gap-3 md:grid-cols-2'>
								<select
									value={selectedMaterialListId}
									onChange={(e) => setSelectedMaterialListId(e.target.value)}
									className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									disabled={!activeCrewId || materialListsLoading}>
									<option value=''>Select a material list...</option>
									{materialLists.map((list) => (
										<option key={list.id} value={list.id}>
											{list.jobName} ({list.jobNumber})
										</option>
									))}
								</select>

								<form
									onSubmit={handleCreateMaterialList}
									className='grid gap-2 sm:grid-cols-3'>
									<input
										type='text'
										value={newMaterialJobName}
										onChange={(e) => setNewMaterialJobName(e.target.value)}
										placeholder='Job name'
										required
										disabled={!activeCrewId}
										className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									/>
									<input
										type='text'
										value={newMaterialJobNumber}
										onChange={(e) => setNewMaterialJobNumber(e.target.value)}
										placeholder='Job #'
										required
										disabled={!activeCrewId}
										className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									/>
									<button
										type='submit'
										className='btn-primary'
										disabled={!activeCrewId}>
										New List
									</button>
								</form>
							</div>

							{materialsLoading || crewsLoading ? (
								<LoadingSpinner />
							) : (
								<MaterialsList
									items={materials}
									onAddItem={handleAddMaterial}
									onUpdateItem={handleUpdateMaterial}
									onDeleteItem={handleDeleteMaterial}
									selectedJobName={selectedMaterialList?.jobName}
									selectedJobNumber={selectedMaterialList?.jobNumber}
									disabled={!selectedMaterialListId}
								/>
							)}
						</ErrorBoundary>
					</TabsContent>

					<TabsContent
						value='punch-list'
						className='rounded-lg bg-primary p-6 shadow-sm'>
						<ErrorBoundary>
							<div className='mb-4 grid gap-3 md:grid-cols-2'>
								<select
									value={selectedPunchListId}
									onChange={(e) => setSelectedPunchListId(e.target.value)}
									className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									disabled={!activeCrewId || punchListsLoading}>
									<option value=''>Select a punch list...</option>
									{punchLists.map((list) => (
										<option key={list.id} value={list.id}>
											{list.jobName} ({list.jobNumber})
										</option>
									))}
								</select>

								<form
									onSubmit={handleCreatePunchList}
									className='grid gap-2 sm:grid-cols-3'>
									<input
										type='text'
										value={newPunchJobName}
										onChange={(e) => setNewPunchJobName(e.target.value)}
										placeholder='Job name'
										required
										disabled={!activeCrewId}
										className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									/>
									<input
										type='text'
										value={newPunchJobNumber}
										onChange={(e) => setNewPunchJobNumber(e.target.value)}
										placeholder='Job #'
										required
										disabled={!activeCrewId}
										className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800'
									/>
									<button
										type='submit'
										className='btn-primary'
										disabled={!activeCrewId}>
										New List
									</button>
								</form>
							</div>

							{punchItemsLoading || crewsLoading ? (
								<LoadingSpinner />
							) : (
							<PunchList
								items={punchListItems}
								onAddItem={handleAddPunchListItem}
								onUpdateItem={handleUpdatePunchListItem}
								onDeleteItem={handleDeletePunchListItem}
								selectedJobName={selectedPunchList?.jobName}
								selectedJobNumber={selectedPunchList?.jobNumber}
								disabled={!selectedPunchListId}
							/>
							)}
						</ErrorBoundary>
					</TabsContent>

					<TabsContent
						value='files'
						className='rounded-lg bg-primary p-6 shadow-sm'>
						<div className='space-y-6'>
							<div>
								<h3 className='text-lg font-medium text-secondary'>
									Upload Files
								</h3>
								<p className='mt-1 text-sm text-secondary'>
									Upload photos, documents, and other files related to the job
								</p>
							</div>
							<FileUploader onUpload={handleFileUpload} />
						</div>
					</TabsContent>

					<TabsContent
						value='walkthrough'
						className='rounded-lg bg-primary p-6 shadow-sm'>
						<WalkthroughForm
							onSubmit={(form) => {
								console.log('Walkthrough form submitted:', form)
								// Handle form submission
							}}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
