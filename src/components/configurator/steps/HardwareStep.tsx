import React from 'react';
import { Key, Lock, Settings } from 'lucide-react';

interface HardwareStepProps {
  selectedHardware?: string;
  onComplete: (hardware: string) => void;
}

const hardwareOptions = [
  {
    id: 'brushed-nickel',
    name: 'Brushed Nickel',
    description: 'Modern brushed nickel finish',
    icon: Key,
    features: [
      'Corrosion resistant',
      'Contemporary look',
      'Easy to clean'
    ]
  },
  {
    id: 'oil-rubbed-bronze',
    name: 'Oil Rubbed Bronze',
    description: 'Traditional dark bronze finish',
    icon: Lock,
    features: [
      'Classic appearance',
      'Durable finish',
      'Ages gracefully'
    ]
  },
  {
    id: 'matte-black',
    name: 'Matte Black',
    description: 'Modern matte black finish',
    icon: Settings,
    features: [
      'Contemporary style',
      'Fingerprint resistant',
      'Matches modern decor'
    ]
  },
  {
    id: 'polished-brass',
    name: 'Polished Brass',
    description: 'Classic polished brass finish',
    icon: Key,
    features: [
      'Traditional elegance',
      'Warm appearance',
      'Timeless appeal'
    ]
  }
];

export function HardwareStep({ selectedHardware, onComplete }: HardwareStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Hardware Finish</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a hardware finish that matches your style
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {hardwareOptions.map((hardware) => {
          const Icon = hardware.icon;
          return (
            <button
              key={hardware.id}
              onClick={() => onComplete(hardware.id)}
              className={`group flex flex-col rounded-lg border-2 p-6 text-left transition-all hover:border-indigo-600 ${
                selectedHardware === hardware.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <Icon className={`h-8 w-8 ${
                  selectedHardware === hardware.id ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedHardware === hardware.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Premium
                </div>
              </div>
              <h3 className="font-medium text-gray-900">{hardware.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{hardware.description}</p>
              <ul className="mt-4 space-y-2">
                {hardware.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${
                      selectedHardware === hardware.id ? 'bg-indigo-600' : 'bg-gray-400'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}