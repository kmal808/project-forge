import React from 'react'
import { useParams } from 'react-router-dom'
import { InventoryForm } from './InventoryForm'
import { InventoryList } from './InventoryList'
import { useContainerItems } from '../../hooks/useContainerItems'
import { useContainers } from '../../hooks/useContainers'
import { FileDown, FileUp } from 'lucide-react'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { toast } from 'sonner'

export function InventoryPage() {
	const { containerId } = useParams<{ containerId?: string }>()
	const { containers } = useContainers()
	const {
		items,
		isLoading: itemsLoading,
		addItem,
		updateItem,
		deleteItem,
	} = useContainerItems(containerId || '')

	const selectedContainer = containers.find((c) => c.id === containerId)

	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = async (e) => {
				try {
					const importedItems = JSON.parse(e.target?.result as string)
					for (const item of importedItems) {
						await addItem(item)
					}
					toast.success('Items imported successfully')
				} catch (error) {
					console.error('Error importing items:', error)
					toast.error('Failed to import items')
				}
			}
			reader.readAsText(file)
		}
	}

	const handleExport = () => {
		if (!items.length) {
			toast.error('No items to export')
			return
		}

		if (!selectedContainer) {
			toast.error('Container not found')
			return
		}

		const data = JSON.stringify(items, null, 2)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${selectedContainer.containerNumber}-${
			new Date().toISOString().split('T')[0]
		}.json`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	if (!containerId) {
		return (
			<div className='flex h-full items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-xl font-semibold text-primary'>
						Select a Container
					</h2>
					<p className='mt-2 text-primary'>
						Choose a container from the sidebar to view its items
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-secondary'>
					Container {selectedContainer?.containerNumber}
				</h2>
				<div className='flex items-center gap-4'>
					<label className='cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-secondary shadow-sm ring-1 ring-inset ring-gray-300 hover:accent hover:text-secondary hover:accent-hover'>
						<div className='flex items-center gap-2'>
							<FileUp className='h-5 w-5' />
							Import
						</div>
						<input
							type='file'
							accept='.json'
							onChange={handleImport}
							className='hidden'
						/>
					</label>
					<button
						onClick={handleExport}
						className='btn-primary'
						disabled={!items.length}>
						<FileDown className='h-5 w-5' />
						Export
					</button>
				</div>
			</div>

			<div className='rounded-lg border border-primary bg-primary p-6'>
				<ErrorBoundary>
					<h3 className='mb-4 text-lg font-medium text-secondary'>
						Add New Item
					</h3>
					<InventoryForm onSubmit={addItem} />
				</ErrorBoundary>
			</div>

			<ErrorBoundary>
				{itemsLoading ? (
					<LoadingSpinner />
				) : (
					<InventoryList
						items={items}
						onDelete={deleteItem}
						onEdit={updateItem}
					/>
				)}
			</ErrorBoundary>
		</div>
	)
}
