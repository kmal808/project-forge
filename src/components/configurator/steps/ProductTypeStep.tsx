import React from 'react'
import { ProductType } from '../../../types'
import { Home, Warehouse, Shield, DoorClosed } from 'lucide-react'

interface ProductTypeStepProps {
	selectedType?: ProductType
	onComplete: (type: ProductType) => void
}

const productTypes = [
	{
		value: 'windows' as const,
		label: 'Windows',
		icon: Home,
		description: 'Energy-efficient windows for any style',
	},
	{
		value: 'siding' as const,
		label: 'Siding',
		icon: Warehouse,
		description: 'Durable, weather-resistant siding options',
	},
	{
		value: 'security-doors' as const,
		label: 'Security Doors',
		icon: Shield,
		description: 'Heavy-duty security door solutions',
	},
	{
		value: 'entry-doors' as const,
		label: 'Entry Doors',
		icon: DoorClosed,
		description: 'Beautiful, secure entry doors',
	},
]

export function ProductTypeStep({
	selectedType,
	onComplete,
}: ProductTypeStepProps) {
	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-primary'>
					Select Product Type
				</h2>
				<p className='mt-1 text-sm text-secondary'>
					Choose the type of product you want to configure
				</p>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{productTypes.map((type) => {
					const Icon = type.icon
					return (
						<button
							key={type.value}
							onClick={() => onComplete(type.value)}
							className={`flex flex-col items-center rounded-lg border-2 p-6 text-center transition-all hover:border-indigo-600 hover:bg-indigo-50 ${
								selectedType === type.value
									? 'border-indigo-600 bg-indigo-50'
									: 'border-secondary'
							}`}>
							<Icon
								className={`h-12 w-12 ${
									selectedType === type.value
										? 'text-indigo-600'
										: 'text-secondary'
								}`}
							/>
							<h3 className='mt-4 font-medium text-primary'>{type.label}</h3>
							<p className='mt-1 text-sm text-secondary'>{type.description}</p>
						</button>
					)
				})}
			</div>
		</div>
	)
}
