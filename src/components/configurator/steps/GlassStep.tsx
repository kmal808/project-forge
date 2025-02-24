import React from 'react'
import { Sun, Plus, Shield, Waves } from 'lucide-react'

interface GlassStepProps {
  selectedGlass?: string
  onComplete: (glass: string) => void
}

const glassOptions = [
  {
    id: 'inf-e',
    name: 'Infinite-E Glass',
    description: 'Triple coated glass with a low emissivity coating',
    icon: Sun,
    features: [
      'High visibility',
      'Maximum natural light',
      'Double-strength glass',
    ],
  },
  {
    id: 'esp',
    name: 'Infinite-E Plus Glass',
    description: 'Infinite-E with the added sound & security package',
    icon: Plus,
    features: [
      'Energy efficient',
      'UV protection',
      'Reduced heat transfer',
      'Triple-strength glass',
    ],
  },
  {
    id: 'tempered',
    name: 'Tempered Glass',
    description: 'Safety glass',
    icon: Shield,
    features: ['Impact resistant', 'Safety rated', 'Building code compliant'],
  },
  {
    id: 'obscure',
    name: 'Obscure Glass',
    description: 'Textured glass for privacy',
    icon: Waves,
    features: ['Privacy', 'Decorative', 'Light diffusing'],
  },
]

export function GlassStep({ selectedGlass, onComplete }: GlassStepProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-900'>
          Select Glass Type
        </h2>
        <p className='mt-1 text-sm text-gray-500'>
          Choose the glass option that best suits your needs
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {glassOptions.map((glass) => {
          const Icon = glass.icon
          return (
            <button
              key={glass.id}
              onClick={() => onComplete(glass.id)}
              className={`flex flex-col rounded-lg border-2 p-6 text-left transition-all hover:border-indigo-600 ${
                selectedGlass === glass.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}>
              <div className='mb-4 flex items-center justify-between'>
                <Icon
                  className={`h-8 w-8 ${
                    selectedGlass === glass.id
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                  }`}
                />
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    selectedGlass === glass.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                  Recommended
                </span>
              </div>
              <h3 className='font-medium text-gray-900'>{glass.name}</h3>
              <p className='mt-1 text-sm text-gray-500'>{glass.description}</p>
              <ul className='mt-4 space-y-2'>
                {glass.features.map((feature, index) => (
                  <li
                    key={index}
                    className='flex items-center text-sm text-gray-600'>
                    <span
                      className={`mr-2 h-1.5 w-1.5 rounded-full ${
                        selectedGlass === glass.id
                          ? 'bg-indigo-600'
                          : 'bg-gray-400'
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
