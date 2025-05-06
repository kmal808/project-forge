import React from 'react'
import { Save } from 'lucide-react'
import type { ContainerItem, ProductType } from '../../types'

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
	{ value: 'windows', label: 'Windows' },
	{ value: 'siding', label: 'Siding' },
	{ value: 'security-doors', label: 'Security Doors' },
	{ value: 'entry-doors', label: 'Entry Doors' },
	{ value: 'other', label: 'Other' },
]

interface InventoryFormProps {
	onSubmit: (
		item: Omit<
			ContainerItem,
			'id' | 'containerId' | 'createdAt' | 'updatedAt' | 'userId'
		>
	) => void
}

export function InventoryForm({ onSubmit }: InventoryFormProps) {
	const [formData, setFormData] = React.useState({
		jobName: '',
		jobNumber: '',
		manufacturerOrderNumber: '',
		itemType: 'windows' as ProductType,
		quantity: 1,
		notes: '',
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSubmit(formData)
		setFormData({
			jobName: '',
			jobNumber: '',
			manufacturerOrderNumber: '',
			itemType: 'windows',
			quantity: 1,
			notes: '',
		})
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				<div>
					<label
						htmlFor='jobName'
						className='block text-sm font-medium text-secondary'>
						Job Name
					</label>
					<input
						type='text'
						id='jobName'
						value={formData.jobName}
						onChange={(e) =>
							setFormData({ ...formData, jobName: e.target.value })
						}
						className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'
						required
					/>
				</div>

				<div>
					<label
						htmlFor='jobNumber'
						className='block text-sm font-medium text-secondary'>
						Job Number
					</label>
					<input
						type='text'
						id='jobNumber'
						value={formData.jobNumber}
						onChange={(e) =>
							setFormData({ ...formData, jobNumber: e.target.value })
						}
						className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'
						required
					/>
				</div>

				<div>
					<label
						htmlFor='manufacturerOrderNumber'
						className='block text-sm font-medium text-secondary'>
						Manufacturer Order #
					</label>
					<input
						type='text'
						id='manufacturerOrderNumber'
						value={formData.manufacturerOrderNumber}
						onChange={(e) =>
							setFormData({
								...formData,
								manufacturerOrderNumber: e.target.value,
							})
						}
						className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'
						required
					/>
				</div>

				<div>
					<label
						htmlFor='itemType'
						className='block text-sm font-medium text-secondary'>
						Item Type
					</label>
					<select
						id='itemType'
						value={formData.itemType}
						onChange={(e) =>
							setFormData({
								...formData,
								itemType: e.target.value as ProductType,
							})
						}
						className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'>
						{PRODUCT_TYPES.map((type) => (
							<option key={type.value} value={type.value}>
								{type.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor='quantity'
						className='block text-sm font-medium text-secondary'>
						Quantity
					</label>
					<input
						type='number'
						id='quantity'
						min='1'
						value={formData.quantity}
						onChange={(e) =>
							setFormData({
								...formData,
								quantity: parseInt(e.target.value) || 1,
							})
						}
						className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'
						required
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor='notes'
					className='block text-sm font-medium text-secondary'>
					Notes
				</label>
				<textarea
					id='notes'
					rows={3}
					value={formData.notes}
					onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
					className='mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700'
				/>
			</div>

			<div className='flex justify-end'>
				<button type='submit' className='btn-primary'>
					<Save className='h-4 w-4' />
					Add Item
				</button>
			</div>
		</form>
	)
}
