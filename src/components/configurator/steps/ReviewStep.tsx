import React from 'react'
import { Edit2, ShoppingCart, Package } from 'lucide-react'
import type { ConfiguratorItem, ConfiguratorStep } from '../../../types'

interface ReviewStepProps {
	item: ConfiguratorItem
	onAddToCart: (item: ConfiguratorItem) => void
	onEdit: (step: ConfiguratorStep) => void
}

const formatPrice = (price: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(price)
}

export function ReviewStep({ item, onAddToCart, onEdit }: ReviewStepProps) {
	const [quantity, setQuantity] = React.useState(1)
	const windowBasePrice = 30
	const sidingBasePrice = 2500
	const securityDoorBasePrice = 2000
	const entryDoorBasePrice = 2000
	// base price should be set based on the id of the series selected
	// Windows price by united inches
	// Security doors price by model
	// Siding price by the square (1 square = 10' x 10' = 100 sq.ft.)
	// Entry doors price by model

	const screenPriceAdditions = {
		'standard-mesh': 0,
		'better-view': 45,
		'heavy-duty': 65,
		solar: 85,
	}

	const calculatePrice = () => {
		if (item.productType === 'windows') {
			const sizeFactor = item.width + item.height // width + height = united inches
			const screenAddition =
				screenPriceAdditions[
					item.screenType as keyof typeof screenPriceAdditions
				] || 0
			return (windowBasePrice * sizeFactor + screenAddition) * quantity
		}
		if (item.productType === 'siding') {
			return sidingBasePrice * quantity
		}
		if (item.productType === 'security-doors') {
			return securityDoorBasePrice * quantity
		}
		if (item.productType === 'entry-doors') {
			return entryDoorBasePrice * quantity
		} else {
			return 0
		}
	}

	const handleAddToCart = () => {
		onAddToCart({
			...item,
			id: `item-${Date.now()}`,
			quantity,
			unitPrice: calculatePrice() / quantity,
		})
	}

	return (
		<div className='space-y-8'>
			<div>
				<h2 className='text-xl font-semibold text-primary'>
					Review Configuration
				</h2>
				<p className='mt-1 text-sm text-gray-primary'>
					Review your selections and add to cart
				</p>
			</div>

			<div className='rounded-lg border border-gray-200 bg-primary shadow'>
				<div className='p-6'>
					<div className='flex items-center justify-between'>
						<h3 className='text-lg font-medium text-primary'>
							Product Details
						</h3>
						<Package className='h-6 w-6 text-primary' />
					</div>

					<dl className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2'>
						{[
							{
								label: 'Product Type',
								value: item.productType,
								step: 'product-type',
							},
							{ label: 'Series', value: item.series, step: 'series' },
							{
								label: 'Dimensions',
								value: `${item.width}" × ${item.height}"`,
								step: 'dimensions',
							},
							{ label: 'Operation', value: item.operation, step: 'operation' },
							{ label: 'Frame Color', value: item.frameColor, step: 'color' },
							{ label: 'Glass Type', value: item.glassType, step: 'glass' },
							{ label: 'Hardware', value: item.hardware, step: 'hardware' },
							{ label: 'Screen', value: item.screenType, step: 'screen' },
						].map((detail) => (
							<div
								key={detail.label}
								className='relative rounded-lg border border-gray-100 bg-gray-50 p-4'>
								<dt className='text-sm font-medium text-gray-500'>
									{detail.label}
								</dt>
								<dd className='mt-1 text-sm text-gray-900'>{detail.value}</dd>
								<button
									onClick={() => onEdit(detail.step as ConfiguratorStep)}
									className='absolute right-4 top-4 text-indigo-600 hover:text-indigo-500'>
									<Edit2 className='h-4 w-4' />
								</button>
							</div>
						))}
					</dl>
				</div>

				<div className='border-t border-gray-200 px-6 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<label
								htmlFor='quantity'
								className='text-sm font-medium text-gray-700'>
								Quantity
							</label>
							<input
								type='number'
								id='quantity'
								min='1'
								value={quantity}
								onChange={(e) =>
									setQuantity(Math.max(1, parseInt(e.target.value) || 1))
								}
								className='w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
							/>
						</div>
						<div className='text-right'>
							<p className='text-sm font-medium text-gray-500'>Total Price</p>
							<p className='text-2xl font-semibold text-gray-900'>
								{formatPrice(calculatePrice())}
							</p>
						</div>
					</div>
				</div>

				<div className='border-t border-gray-200 px-6 py-4'>
					<button
						onClick={handleAddToCart}
						className='button-primary flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-primary shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
						<ShoppingCart className='h-5 w-5' />
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	)
}
