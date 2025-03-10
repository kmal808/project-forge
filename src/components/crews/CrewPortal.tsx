import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { WalkthroughForm } from './WalkthroughForm'
import { MaterialsList } from './MaterialsList'
import { PunchList } from './PunchList'
import { FileUploader } from './FileUploader'
import { ClipboardList, Package2, CheckSquare, Upload } from 'lucide-react'
import { useMaterials } from '../../hooks/useMaterials'
import { usePunchList } from '../../hooks/usePunchList'
import { useFiles } from '../../hooks/useFiles'
import { useWalkthroughs } from '../../hooks/useWalkthroughs'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export function CrewPortal() {
	const {
		materials,
		addMaterial,
		updateMaterial,
		deleteMaterial,
		isLoading: materialsLoading,
	} = useMaterials()
	const {
		items: punchListItems,
		addItem: addPunchListItem,
		updateItem: updatePunchListItem,
		deleteItem: deletePunchListItem,
	} = usePunchList()
	const { files: uploads, addFile } = useFiles()
	const { addWalkthrough } = useWalkthroughs()

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

	const handleFileUpload = async (files: FileUpload[]) => {
		for (const file of files) {
			await addFile(file)
		}
	}

	return (
		<div className='min-h-screen bg-secondary py-8'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-primary'>Crew Portal</h1>
					<p className='mt-2 text-sm text-primary'>
						Manage your job site tasks, materials, and documentation
					</p>
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
						className='rounded-lg bg-primary p-6 shadow'>
						<ErrorBoundary>
							{materialsLoading ? (
								<LoadingSpinner />
							) : (
								<MaterialsList
									items={materials}
									onAddItem={handleAddMaterial}
									onUpdateItem={handleUpdateMaterial}
									onDeleteItem={handleDeleteMaterial}
								/>
							)}
						</ErrorBoundary>
					</TabsContent>

					<TabsContent
						value='punch-list'
						className='rounded-lg bg-primary p-6 shadow'>
						<ErrorBoundary>
							<PunchList
								items={punchListItems}
								onAddItem={handleAddPunchListItem}
								onUpdateItem={handleUpdatePunchListItem}
								onDeleteItem={handleDeletePunchListItem}
							/>
						</ErrorBoundary>
					</TabsContent>

					<TabsContent
						value='files'
						className='rounded-lg bg-primary p-6 shadow'>
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
						className='rounded-lg bg-primary p-6 shadow'>
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
