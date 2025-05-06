import React from 'react'
import { PunchListItem } from '../../types'
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface PunchListProps {
	items: PunchListItem[]
	onAddItem: (item: Omit<PunchListItem, 'id'>) => void
	onUpdateItem: (id: string, updates: Partial<PunchListItem>) => void
	onDeleteItem: (id: string) => void
}

export function PunchList({
	items,
	onAddItem,
	onUpdateItem,
	onDeleteItem,
}: PunchListProps) {
	const [newItem, setNewItem] = React.useState({
		description: '',
		status: 'pending' as const,
		priority: 'medium' as const,
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
							className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
							required
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
							className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'>
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
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div className='flex justify-end'>
					<button type='submit' className='btn-primary'>
						<Plus className='h-4 w-4' />
						Add Item
					</button>
				</div>
			</form>

			<ul className='divide-y divide-gray-200'>
				{items.map((item) => (
					<li key={item.id} className='py-4'>
						<div className='flex items-start justify-between'>
							<div className='flex items-start space-x-3'>
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
									}>
									{getStatusIcon(item.status)}
								</button>
								<div>
									<p className='text-sm font-medium text-secondary'>
										{item.description}
									</p>
									{item.notes && (
										<p className='mt-1 text-sm text-gray-500'>{item.notes}</p>
									)}
								</div>
							</div>
							<div className='flex items-center space-x-2'>
								<span
									className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(
										item.priority
									)}`}>
									{item.priority}
								</span>
								<button
									onClick={() => onDeleteItem(item.id)}
									className='text-gray-400 hover:text-gray-500'>
									<span className='sr-only'>Delete</span>
									<X className='h-5 w-5' />
								</button>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
