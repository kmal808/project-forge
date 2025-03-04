import React from 'react'
import { ConfiguratorStepper } from './ConfiguratorStepper'
import { ProductTypeStep } from './steps/ProductTypeStep'
import { SeriesStep } from './steps/SeriesStep'
import { DimensionsStep } from './steps/DimensionsStep'
import { OperationStep } from './steps/OperationStep'
import { ColorStep } from './steps/ColorStep'
import { GlassStep } from './steps/GlassStep'
import { HardwareStep } from './steps/HardwareStep'
import { ScreenStep } from './steps/ScreenStep'
import { ReviewStep } from './steps/ReviewStep'
import { ConfiguratorCart } from './ConfiguratorCart'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import type {
	ConfiguratorStep,
	ConfiguratorItem,
	ProductType,
} from '../../types'
import { ShoppingCart } from 'lucide-react'

export function ConfiguratorPage() {
	const [currentStep, setCurrentStep] =
		React.useState<ConfiguratorStep>('product-type')
	const [cart, setCart] = React.useState<ConfiguratorItem[]>([])
	const [currentItem, setCurrentItem] = React.useState<
		Partial<ConfiguratorItem>
	>({})
	const [showCart, setShowCart] = React.useState(false)

	const handleStepComplete = (stepData: Partial<ConfiguratorItem>) => {
		setCurrentItem((prev) => ({ ...prev, ...stepData }))

		const steps: ConfiguratorStep[] = [
			'product-type',
			'series',
			'dimensions',
			'operation',
			'color',
			'glass',
			'hardware',
			'screen',
			'review',
		]

		const currentIndex = steps.indexOf(currentStep)
		if (currentIndex < steps.length - 1) {
			setCurrentStep(steps[currentIndex + 1])
		}
	}

	const handleAddToCart = (item: ConfiguratorItem) => {
		setCart((prev) => [...prev, item])
		setCurrentItem({})
		setCurrentStep('product-type')
	}

	const handleRemoveFromCart = (itemId: string) => {
		setCart((prev) => prev.filter((item) => item.id !== itemId))
	}

	return (
		<div className='min-h-screen bg-secondary'>
			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<div className='mb-8 flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-primary'>CPQ</h1>
						<p className='mt-2 text-sm text-gray-600'>
							Configure, Price, & Quote
						</p>
					</div>
					<button
						onClick={() => setShowCart(true)}
						className='flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-primary hover:bg-indigo-500'>
						<ShoppingCart className='h-5 w-5' />
						<span>Cart ({cart.length})</span>
					</button>
				</div>

				<ErrorBoundary>
					<div className='rounded-lg bg-primary p-6 shadow-lg'>
						<ConfiguratorStepper currentStep={currentStep} />

						<div className='mt-8'>
							<ErrorBoundary>
								{currentStep === 'product-type' && (
									<ProductTypeStep
										selectedType={currentItem.productType}
										onComplete={(type) =>
											handleStepComplete({ productType: type })
										}
									/>
								)}
								{currentStep === 'series' && (
									<SeriesStep
										productType={currentItem.productType as ProductType}
										selectedSeries={currentItem.series}
										onComplete={(series) => handleStepComplete({ series })}
									/>
								)}
								{currentStep === 'dimensions' && (
									<DimensionsStep
										width={currentItem.width}
										height={currentItem.height}
										onComplete={(dimensions) => handleStepComplete(dimensions)}
									/>
								)}
								{currentStep === 'operation' && (
									<OperationStep
										productType={currentItem.productType as ProductType}
										selectedOperation={currentItem.operation}
										onComplete={(operation) =>
											handleStepComplete({ operation })
										}
									/>
								)}
								{currentStep === 'color' && (
									<ColorStep
										selectedColor={currentItem.frameColor}
										onComplete={(color) =>
											handleStepComplete({ frameColor: color })
										}
									/>
								)}
								{currentStep === 'glass' && (
									<GlassStep
										selectedGlass={currentItem.glassType}
										onComplete={(glass) =>
											handleStepComplete({ glassType: glass })
										}
									/>
								)}
								{currentStep === 'hardware' && (
									<HardwareStep
										selectedHardware={currentItem.hardware}
										onComplete={(hardware) => handleStepComplete({ hardware })}
									/>
								)}
								{currentStep === 'screen' && (
									<ScreenStep
										selectedScreen={currentItem.screenType}
										onComplete={(screen) =>
											handleStepComplete({ screenType: screen })
										}
									/>
								)}
								{currentStep === 'review' && (
									<ReviewStep
										item={currentItem as ConfiguratorItem}
										onAddToCart={handleAddToCart}
										onEdit={(step) => setCurrentStep(step)}
									/>
								)}
							</ErrorBoundary>
						</div>
					</div>
				</ErrorBoundary>
			</div>

			<ErrorBoundary>
				<ConfiguratorCart
					items={cart}
					open={showCart}
					onClose={() => setShowCart(false)}
					onRemoveItem={handleRemoveFromCart}
				/>
			</ErrorBoundary>
		</div>
	)
}
