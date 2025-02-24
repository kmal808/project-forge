import React from 'react';
import { Bug, Eye, Wind, Shield } from 'lucide-react';

interface ScreenStepProps {
  selectedScreen?: string;
  onComplete: (screen: string) => void;
}

const screenOptions = [
  {
    id: 'standard-mesh',
    name: 'Standard Mesh',
    description: 'Classic fiberglass mesh screen',
    icon: Bug,
    features: [
      'Basic insect protection',
      'Good visibility',
      'Cost-effective'
    ],
    price: 'Included'
  },
  {
    id: 'better-view',
    name: 'Better View Screen',
    description: 'High-visibility mesh for clearer views',
    icon: Eye,
    features: [
      'Enhanced visibility',
      'Improved airflow',
      'Reduced glare'
    ],
    price: '+$45'
  },
  {
    id: 'heavy-duty',
    name: 'Heavy Duty Screen',
    description: 'Reinforced mesh for added durability',
    icon: Shield,
    features: [
      'Pet resistant',
      'Extra durability',
      'Enhanced protection'
    ],
    price: '+$65'
  },
  {
    id: 'solar',
    name: 'Solar Screen',
    description: 'Sun-blocking mesh for energy efficiency',
    icon: Wind,
    features: [
      'UV protection',
      'Heat reduction',
      'Energy saving'
    ],
    price: '+$85'
  }
];

export function ScreenStep({ selectedScreen, onComplete }: ScreenStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Screen Type</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a screen that provides the right balance of visibility and protection
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenOptions.map((screen) => {
          const Icon = screen.icon;
          return (
            <button
              key={screen.id}
              onClick={() => onComplete(screen.id)}
              className={`group relative flex flex-col rounded-lg border-2 p-6 text-left transition-all hover:border-indigo-600 ${
                selectedScreen === screen.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <Icon className={`h-8 w-8 ${
                  selectedScreen === screen.id ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedScreen === screen.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {screen.price}
                </span>
              </div>
              <h3 className="font-medium text-gray-900">{screen.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{screen.description}</p>
              <ul className="mt-4 space-y-2">
                {screen.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${
                      selectedScreen === screen.id ? 'bg-indigo-600' : 'bg-gray-400'
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