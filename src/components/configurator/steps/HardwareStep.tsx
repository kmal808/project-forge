import { Key, Lock, Settings } from 'lucide-react'

interface HardwareStepProps {
	selectedHardware?: string
	onComplete: (hardware: string) => void
}

const hardwareOptions = [
	{
		id: 'white-cam',
		name: 'White Cam Lock',
		description: 'Cam Lock with a white finish',
		icon: Key,
		features: ['Sure lock technology', 'Easy to operate', 'Durable'],
	},
	{
		id: 'white-auto-lock',
		name: 'White Auto Lock',
		description: 'Auto Lock with a white finish',
		icon: Key,
		features: [
			'Automatic locking',
			'Locks when closed',
			'Easy to operate',
			'Durable',
		],
	},
	{
		id: 'brushed-nickel',
		name: 'Brushed Nickel',
		description: 'Modern brushed nickel finish',
		icon: Key,
		features: [
			'Available in cam or auto lock',
			'Corrosion resistant',
			'Contemporary look',
			'Easy to clean',
		],
	},
	{
		id: 'oil-rubbed-bronze',
		name: 'Oil Rubbed Bronze',
		description: 'Traditional dark bronze finish',
		icon: Lock,
		features: [
			'Classic appearance',
			'Durable finish',
			'Ages gracefully',
			'Available in cam or auto lock',
		],
	},
	{
		id: 'matte-black',
		name: 'Matte Black',
		description: 'Modern matte black finish',
		icon: Settings,
		features: [
			'Contemporary style',
			'Fingerprint resistant',
			'Matches modern decor',
			'Only available on designer black frame',
		],
	},
]

export function HardwareStep({
	selectedHardware,
	onComplete,
}: HardwareStepProps) {
	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-primary'>
					Select Hardware Finish
				</h2>
				<p className='mt-1 text-sm text-secondary'>
					Choose a hardware type & finish
				</p>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				{hardwareOptions.map((hardware) => {
					const Icon = hardware.icon
					return (
						<button
							key={hardware.id}
							onClick={() => onComplete(hardware.id)}
							className={`group flex flex-col rounded-lg border-2 p-6 text-left transition-all hover:border-indigo-600 ${
								selectedHardware === hardware.id
									? 'border-indigo-600 bg-indigo-50'
									: 'border-secondary'
							}`}>
							<div className='mb-4 flex items-center justify-between'>
								<Icon
									className={`h-8 w-8 ${
										selectedHardware === hardware.id
											? 'text-indigo-600'
											: 'text-secondary'
									}`}
								/>
								<div
									className={`rounded-full px-3 py-1 text-xs font-medium ${
										selectedHardware === hardware.id
											? 'bg-indigo-100 text-indigo-700'
											: 'bg-secondary text-secondary'
									}`}>
									Premium
								</div>
							</div>
							<h2 className='font-medium text-primary'>{hardware.name}</h2>
							<p className='mt-1 text-sm text-secondary'>
								{hardware.description}
							</p>
							<ul className='mt-4 space-y-2'>
								{hardware.features.map((feature, index) => (
									<li
										key={index}
										className='flex items-center text-sm text-secondary'>
										<span
											className={`mr-2 h-1.5 w-1.5 rounded-full ${
												selectedHardware === hardware.id
													? 'bg-indigo-600'
													: 'bg-secondary'
											}`}
										/>
										{feature}
									</li>
								))}
							</ul>
						</button>
					)
				})}
			</div>
		</div>
	)
}
