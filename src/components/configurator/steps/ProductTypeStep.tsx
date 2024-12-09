import React from 'react';
import { ProductType } from '../../../types';
import { Square, Columns, Shield, DoorClosed } from 'lucide-react';

interface ProductTypeStepProps {
  selectedType?: ProductType;
  onComplete: (type: ProductType) => void;
}

const productTypes = [
  { 
    value: 'windows' as const,
    label: 'Windows',
    icon: Square,
    description: 'Energy-efficient windows for any style'
  },
  {
    value: 'siding' as const,
    label: 'Siding',
    icon: Columns,
    description: 'Durable, weather-resistant siding options'
  },
  {
    value: 'security-doors' as const,
    label: 'Security Doors',
    icon: Shield,
    description: 'Heavy-duty security door solutions'
  },
  {
    value: 'entry-doors' as const,
    label: 'Entry Doors',
    icon: DoorClosed,
    description: 'Beautiful, secure entry doors'
  }
];

export function ProductTypeStep({ selectedType, onComplete }: ProductTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Product Type</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the type of product you want to configure
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => onComplete(type.value)}
              className={`flex flex-col items-center rounded-lg border-2 p-6 text-center transition-all hover:border-indigo-600 hover:bg-indigo-50 ${
                selectedType === type.value
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <Icon className={`h-12 w-12 ${
                selectedType === type.value ? 'text-indigo-600' : 'text-gray-400'
              }`} />
              <h3 className="mt-4 font-medium text-gray-900">{type.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{type.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}