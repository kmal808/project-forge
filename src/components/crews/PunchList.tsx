import React from 'react'
import { PunchListItem } from '../../types'
import { Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'

interface PunchListProps {
	items: PunchListItem[]
	onAddItem: (item: Omit<PunchListItem, 'id'>) => void
	onUpdateItem: (id: string, updates: Partial<PunchListItem>) => void
	onDeleteItem: (id: string) => void
	selectedJobName?: string
	selectedJobNumber?: string
	disabled?: boolean
}

export function PunchList({
	items,
	onAddItem,
	onUpdateItem,
	onDeleteItem,
	selectedJobName,
	selectedJobNumber,
	disabled = false,
}: PunchListProps) {
	const [newItem, setNewItem] = React.useState<{
		description: string
		status: PunchListItem['status']
		priority: PunchListItem['priority']
		notes: string
	}>({
		description: '',
		status: 'pending',
		priority: 'medium',
		notes: '',
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onAddItem(newItem)
		setNewItem({
			description: '',
			status: 'pending',
			priority: 'medium',
			notes: '',
		})
	}

	const getStatusIcon = (status: PunchListItem['status']) => {
		switch (status) {
			case 'completed':
				return <CheckCircle className='h-5 w-5 text-green-500' />
			case 'in-progress':
				return <Clock className='h-5 w-5 text-yellow-500' />
			default:
				return <AlertCircle className='h-5 w-5 text-red-500' />
		}
	}

	const getPriorityColor = (priority: PunchListItem['priority']) => {
		switch (priority) {
			case 'high':
				return 'text-red-700 bg-red-50 ring-red-600/20'
			case 'medium':
				return 'text-yellow-700 bg-yellow-50 ring-yellow-600/20'
			default:
				return 'text-green-700 bg-green-50 ring-green-600/20'
		}
	}

	return (
		<div className='space-y-6'>
			{selectedJobName && selectedJobNumber && (
				<div className='rounded-md border border-primary/30 bg-secondary/40 px-4 py-3'>
					<p className='text-sm font-medium text-secondary'>
						Active Punch List: {selectedJobName} ({selectedJobNumber})
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<div>
						<label
							htmlFor='description'
							className='block text-sm font-medium text-secondary'>
							Description
						</label>
						<input
							type='text'
							id='description'
							value={newItem.description}
							onChange={(e) =>
								setNewItem({ ...newItem, description: e.target.value })
							}
							className='mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
							required
							disabled={disabled}
						/>
					</div>

					<div>
						<label
							htmlFor='priority'
							className='block text-sm font-medium text-secondary'>
							Priority
						</label>
						<select
							id='priority'
							value={newItem.priority}
							onChange={(e) =>
								setNewItem({
									...newItem,
									priority: e.target.value as PunchListItem['priority'],
								})
							}
							className='mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
							disabled={disabled}>
							<option value='low'>Low</option>
							<option value='medium'>Medium</option>
							<option value='high'>High</option>
						</select>
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
						rows={2}
						value={newItem.notes}
						onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
						className='mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-700 shadow-xs ring-1 ring-inset ring-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
						disabled={disabled}
					/>
				</div>

				<div className='flex justify-end'>
					<button type='submit' className='btn-primary' disabled={disabled}>
						<Plus className='h-4 w-4' />
						Add Item
					</button>
				</div>
			</form>

			<div className='overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
				<table className='min-w-full divide-y divide-gray-300'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-600 sm:pl-6'>
								Description
							</th>
							<th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-600'>
								Priority
							</th>
							<th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-600'>
								Status
							</th>
							<th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-600'>
								Notes
							</th>
							<th className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
								<span className='sr-only'>Actions</span>
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-200 bg-white'>
						{items.map((item) => (
							<tr key={item.id}>
								<td className='py-4 pl-4 pr-3 text-sm font-medium text-gray-600 sm:pl-6'>
									{item.description}
								</td>
								<td className='whitespace-nowrap px-3 py-4 text-sm'>
									<span
										className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(
											item.priority
										)}`}>
										{item.priority}
									</span>
								</td>
								<td className='whitespace-nowrap px-3 py-4 text-sm text-gray-600'>
									<button
										onClick={() =>
											onUpdateItem(item.id, {
												status:
													item.status === 'pending'
														? 'in-progress'
														: item.status === 'in-progress'
														? 'completed'
														: 'pending',
											})
										}
										className='flex items-center gap-2'>
										{getStatusIcon(item.status)}
										<span className='capitalize'>{item.status.replace('-', ' ')}</span>
									</button>
								</td>
								<td className='px-3 py-4 text-sm text-gray-600'>{item.notes || '-'}</td>
								<td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
									<button
										onClick={() => onDeleteItem(item.id)}
										className='text-red-600 hover:text-red-900'>
										<Trash2 className='h-4 w-4' />
										<span className='sr-only'>Delete</span>
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
