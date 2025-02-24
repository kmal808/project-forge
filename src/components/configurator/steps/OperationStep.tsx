import React from 'react'
import { ProductType } from '../../../types'
import { ArrowLeftRight, ArrowUpDown, Maximize2 } from 'lucide-react'

interface OperationStepProps {
  productType: ProductType
  selectedOperation?: string
  onComplete: (operation: string) => void
}

const operationOptions: Record<
  ProductType,
  Array<{
    id: string
    name: string
    description: string
    icon: React.ElementType
  }>
> = {
  windows: [
    {
      id: 'sliding-left',
      name: 'Sliding Left (XO)',
      description: 'Left panel slides over fixed right panel',
      icon: ArrowLeftRight,
    },
    {
      id: 'sliding-right',
      name: 'Sliding Right (OX)',
      description: 'Right panel slides over fixed left panel',
      icon: ArrowLeftRight,
    },
    {
      id: 'double-hung',
      name: 'Double Hung',
      description: 'Both sashes move up and down',
      icon: ArrowUpDown,
    },
    {
      id: 'double-sliding',
      name: 'Double Sliding',
      description: 'Both sashes slide horizontally',
      icon: ArrowLeftRight,
    },
    {
      id: 'single-hung',
      name: 'Single Hung',
      description: 'Bottom sash moves up and down',
      icon: ArrowUpDown,
    },
    {
      id: 'fixed',
      name: 'Fixed',
      description: 'Non-operating picture window',
      icon: Maximize2,
    },
  ],
  siding: [
    {
      id: 'horizontal',
      name: 'Horizontal',
      description: 'Traditional horizontal lap siding installation',
      icon: ArrowLeftRight,
    },
    {
      id: 'vertical',
      name: 'Vertical',
      description: 'Board and batten vertical installation',
      icon: ArrowUpDown,
    },
  ],
  'security-doors': [
    {
      id: 'left-hand',
      name: 'Left Hand',
      description: 'Hinged on left side when viewed from outside',
      icon: ArrowLeftRight,
    },
    {
      id: 'right-hand',
      name: 'Right Hand',
      description: 'Hinged on right side when viewed from outside',
      icon: ArrowLeftRight,
    },
  ],
  'entry-doors': [
    {
      id: 'left-hand',
      name: 'Left Hand',
      description: 'Hinged on left side when viewed from outside',
      icon: ArrowLeftRight,
    },
    {
      id: 'right-hand',
      name: 'Right Hand',
      description: 'Hinged on right side when viewed from outside',
      icon: ArrowLeftRight,
    },
    {
      id: 'double-door',
      name: 'Double Door',
      description: 'Both doors are operable',
      icon: Maximize2,
    },
  ],
  other: [
    {
      id: 'custom',
      name: 'Custom',
      description: 'Custom operation type',
      icon: Maximize2,
    },
  ],
}

export function OperationStep({
  productType,
  selectedOperation,
  onComplete,
}: OperationStepProps) {
  const operations = operationOptions[productType] || []

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-900'>
          Select Operation Style
        </h2>
        <p className='mt-1 text-sm text-gray-500'>
          Choose how your product will operate
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {operations.map((operation) => {
          const Icon = operation.icon
          return (
            <button
              key={operation.id}
              onClick={() => onComplete(operation.id)}
              className={`flex flex-col items-center rounded-lg border-2 p-6 text-center transition-all hover:border-indigo-600 hover:bg-indigo-50 ${
                selectedOperation === operation.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}>
              <Icon
                className={`h-12 w-12 ${
                  selectedOperation === operation.id
                    ? 'text-indigo-600'
                    : 'text-gray-400'
                }`}
              />
              <h3 className='mt-4 font-medium text-gray-900'>
                {operation.name}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {operation.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
