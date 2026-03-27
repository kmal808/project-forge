import React from 'react'
import { useContainers } from '../../hooks/useContainers'
import { Package2, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

interface ContainerListProps {
	collapsed?: boolean
}

export function ContainerList({ collapsed = false }: ContainerListProps) {
	const { containerId } = useParams()
	const { containers, isLoading, addContainer, deleteContainer } =
		useContainers()
	const navigate = useNavigate()
	const [showNewContainer, setShowNewContainer] = React.useState(false)
	const [containerNumber, setContainerNumber] = React.useState('')

	const containerNumberRegex = /^[A-Z]{4}-\d{6}$/

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!containerNumberRegex.test(containerNumber)) {
			toast.error('Invalid container number format (e.g., ABCD-123456)')
			return
		}
		try {
			await addContainer(containerNumber)
			setContainerNumber('')
			setShowNewContainer(false)
		} catch (error) {
			console.error('Failed to add container:', error)
		}
	}

	const handleDeleteContainer = async (id: string, name: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete container "${name}"? This action cannot be undone.`
			)
		) {
			return
		}

		try {
			await deleteContainer(id)
			// If the deleted container was selected, go back to the empty state.
			if (containerId === id) navigate('/inventory')
		} catch (error) {
			console.error('Failed to delete container:', error)
			// `deleteContainer` already toasts; keep this as a safety net.
			toast.error('Failed to delete container')
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-4'>
				<div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
			</div>
		)
	}

	return (
		<div className={collapsed ? 'space-y-1' : 'space-y-2'}>
			{showNewContainer ? (
				<form
					onSubmit={handleSubmit}
					className='space-y-2 rounded-md bg-gray-50 p-2'>
					<input
						type='text'
						value={containerNumber}
						onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
						className='w-full rounded-md border border-gray-300 px-3 py-1 text-sm'
						placeholder='ABCD-123456'
						pattern='[A-Z]{4}-\d{6}'
						required
						autoFocus
					/>
					<div className='flex justify-end gap-2'>
						<button
							type='button'
							onClick={() => setShowNewContainer(false)}
							className='text-xs text-gray-500 hover:text-gray-700'>
							Cancel
						</button>
						<button
							type='submit'
							className='text-xs text-brand-orange hover:text-brand-orange/80'
							disabled={!containerNumberRegex.test(containerNumber)}>
							Add
						</button>
					</div>
				</form>
			) : (
				<button
					onClick={() => setShowNewContainer(true)}
					className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
					<Plus className='h-4 w-4' />
					<span>New Container</span>
				</button>
			)}

			{containers.map((container) => (
				<div
					key={container.id}
					className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
						containerId === container.id
							? 'bg-brand-orange text-primary'
							: 'text-primary hover:bg-gray-100'
					}`}>
					<Link
						to={`/inventory/${container.id}`}
						className='flex min-w-0 flex-1 items-center gap-2'>
						<Package2 className='h-4 w-4 flex-none' />
						<span className='truncate'>{container.containerNumber}</span>
					</Link>

					<div className='flex items-center gap-2'>
						{container.itemCount && container.itemCount > 0 && (
							<span
								className={`text-xs ${
									containerId === container.id
										? 'text-white/80'
										: 'text-gray-400'
								}`}>
								{container.itemCount}
							</span>
						)}

						<button
							type='button'
							onClick={() =>
								handleDeleteContainer(
									container.id,
									container.containerNumber
								)
							}
							className='rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-900'>
							<Trash2 className='h-4 w-4' />
							<span className='sr-only'>Delete container</span>
						</button>
					</div>
				</div>
			))}
		</div>
	)
}
