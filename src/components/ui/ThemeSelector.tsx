import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Sun, Moon, Palette } from 'lucide-react'
import type { Theme } from '../../types'

const themes: Array<{ id: Theme; label: string; icon: React.ElementType }> = [
	{ id: 'light', label: 'Light', icon: Sun },
	{ id: 'dark', label: 'Dark', icon: Moon },
	{ id: 'tokyo-night', label: 'Tokyo Night', icon: Palette },
	{ id: 'andromeda', label: 'Andromeda', icon: Palette },
]

export function ThemeSelector() {
	const { theme, setTheme } = useTheme()

	return (
		<div className='relative'>
			<select
				value={theme}
				onChange={(e) => setTheme(e.target.value as Theme)}
				className='appearance-none rounded-lg border border-primary bg-secondary px-3 py-2 pr-8 text-sm shadow-sm'>
				{themes.map(({ id, label }) => (
					<option key={id} value={id}>
						{label}
					</option>
				))}
			</select>
			<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2'>
				{React.createElement(themes.find((t) => t.id === theme)?.icon || Sun, {
					className: 'h-4 w-4 text-secondary',
				})}
			</div>
		</div>
	)
}
