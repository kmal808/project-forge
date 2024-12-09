import React from 'react';
import { Paintbrush } from 'lucide-react';

interface ColorStepProps {
  selectedColor?: string;
  onComplete: (color: string) => void;
}

const colorOptions = [
  {
    id: 'white',
    name: 'White',
    hex: '#FFFFFF',
    description: 'Classic bright white',
  },
  {
    id: 'beige',
    name: 'Beige',
    hex: '#E8DCC4',
    description: 'Warm neutral beige',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    hex: '#8B4513',
    description: 'Rich metallic bronze',
  },
  {
    id: 'black',
    name: 'Black',
    hex: '#1A1A1A',
    description: 'Modern matte black',
  },
  {
    id: 'clay',
    name: 'Clay',
    hex: '#BFB1A4',
    description: 'Earthy clay tone',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    hex: '#228B22',
    description: 'Deep forest green',
  },
];

export function ColorStep({ selectedColor, onComplete }: ColorStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Frame Color</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a color that complements your home's exterior
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colorOptions.map((color) => (
          <button
            key={color.id}
            onClick={() => onComplete(color.id)}
            className={`group relative flex flex-col rounded-lg border-2 p-6 transition-all hover:border-indigo-600 ${
              selectedColor === color.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className="h-12 w-12 rounded-full border shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <Paintbrush className={`h-6 w-6 ${
                selectedColor === color.id ? 'text-indigo-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className="font-medium text-gray-900">{color.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{color.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}