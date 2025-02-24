import React from 'react'
import { ProductType } from '../../../types'

interface SeriesStepProps {
  productType: ProductType
  selectedSeries?: string
  onComplete: (series: string) => void
}

const seriesOptions: Record<
  ProductType,
  Array<{ id: string; name: string; description: string }>
> = {
  windows: [
    {
      id: 'premium-vinyl',
      name: 'Premium Vinyl Series',
      description: 'High-performance sliding & hung vinyl windows',
    },
    {
      id: 'aluminum',
      name: 'Aluminum Series',
      description: 'Aluminum sliding & louvered windows',
    },
    {
      id: 'jalousie',
      name: 'Jalousie Series',
      description: '4" & 6" louvered windows',
    },
  ],
  siding: [
    {
      id: 'vinyl',
      name: 'Vinyl Siding',
      description: 'Low-maintenance, weather-resistant vinyl siding',
    },
    {
      id: 'fiber-cement',
      name: 'Fiber Cement',
      description: 'Durable fiber cement siding with authentic wood appearance',
    },
    {
      id: 'engineered-wood',
      name: 'Engineered Wood',
      description: 'Innovative engineered wood siding for natural aesthetics',
    },
  ],
  'security-doors': [
    {
      id: 'swing',
      name: 'Swing Security Door',
      description: 'Prehung swinging security door',
    },
    {
      id: 'sliding',
      name: 'Sliding Security Door',
      description: 'Security for sliding patio doors',
    },
  ],
  'entry-doors': [
    {
      id: 'fiberglass',
      name: 'Fiberglass Entry',
      description: 'Durable fiberglass doors with authentic wood grain',
    },
    {
      id: 'steel-entry',
      name: 'Steel Entry',
      description: 'Strong steel entry doors for maximum security',
    },
    {
      id: 'wood',
      name: 'Wood Entry',
      description: 'Classic wood entry doors for traditional elegance',
    },
  ],
  other: [
    {
      id: 'custom',
      name: 'Custom Solutions',
      description: 'Specialized solutions for unique requirements',
    },
  ],
}

export function SeriesStep({
  productType,
  selectedSeries,
  onComplete,
}: SeriesStepProps) {
  const series = seriesOptions[productType] || []

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-900'>Select Series</h2>
        <p className='mt-1 text-sm text-gray-500'>
          Choose the series to configure, price, and quote
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {series.map((option) => (
          <button
            key={option.id}
            onClick={() => onComplete(option.id)}
            className={`flex flex-col rounded-lg border-2 p-6 text-left transition-all hover:border-indigo-600 hover:bg-indigo-50 ${
              selectedSeries === option.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}>
            <h3 className='font-medium text-gray-900'>{option.name}</h3>
            <p className='mt-2 text-sm text-gray-500'>{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
