import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Sun, Moon, Palette, Snowflake, Sunset, Waves, TreePine } from 'lucide-react'
import type { Theme } from '../../types'

const themes: Array<{ id: Theme; label: string; icon: React.ElementType; description: string }> = [
	{ id: 'light', label: 'Light', icon: Sun, description: 'Clean light theme' },
	{ id: 'dark', label: 'Dark', icon: Moon, description: 'Classic dark theme' },
	{ id: 'tokyo-night', label: 'Tokyo Night', icon: Palette, description: 'Vibrant purple theme' },
	{ id: 'andromeda', label: 'Andromeda', icon: Palette, description: 'Space-inspired theme' },
	{ id: 'nordic', label: 'Nordic', icon: Snowflake, description: 'Cool minimal theme' },
	{ id: 'sunset', label: 'Sunset', icon: Sunset, description: 'Warm gradient theme' },
	{ id: 'ocean', label: 'Ocean', icon: Waves, description: 'Deep blue theme' },
	{ id: 'forest', label: 'Forest', icon: TreePine, description: 'Nature-inspired theme' },
]

export function ThemeSelector() {
	const { theme, setTheme } = useTheme()
	const [isOpen, setIsOpen] = React.useState(false)
	const currentTheme = themes.find((t) => t.id === theme)

	return (
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-secondary/60 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-primary shadow-lg hover:bg-secondary hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200'>
				{React.createElement(currentTheme?.icon || Sun, {
					className: 'h-4 w-4',
				})}
				<span className='hidden sm:block'>{currentTheme?.label}</span>
			</button>
			
			{isOpen && (
				<>
					<div 
						className='fixed inset-0 z-10'
						onClick={() => setIsOpen(false)}
					/>
					<div className='absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-primary/20 bg-secondary/90 backdrop-blur-xl shadow-2xl'>
						<div className='p-2'>
							{themes.map(({ id, label, icon, description }) => (
								<button
									key={id}
									onClick={() => {
										setTheme(id)
										setIsOpen(false)
									}}
									className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 hover:bg-primary/10 ${
										theme === id ? 'bg-(--color-accent)/20 text-primary' : 'text-secondary'
									}`}>
									{React.createElement(icon, {
										className: `h-5 w-5 ${theme === id ? 'text-(--color-accent)' : 'text-secondary'}`,
									})}
									<div className='flex-1'>
										<div className='font-medium'>{label}</div>
										<div className='text-xs text-secondary/70'>{description}</div>
									</div>
									{theme === id && (
										<div className='h-2 w-2 rounded-full bg-(--color-accent)'></div>
									)}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
