import React from 'react';
import { Check } from 'lucide-react';
import type { ConfiguratorStep } from '../../types';

interface ConfiguratorStepperProps {
  currentStep: ConfiguratorStep;
}

const steps = [
  { id: 'product-type', name: 'Product Type' },
  { id: 'series', name: 'Series' },
  { id: 'dimensions', name: 'Dimensions' },
  { id: 'operation', name: 'Operation' },
  { id: 'color', name: 'Color' },
  { id: 'glass', name: 'Glass' },
  { id: 'hardware', name: 'Hardware' },
  { id: 'screen', name: 'Screen' },
  { id: 'review', name: 'Review' },
] as const;

export function ConfiguratorStepper({ currentStep }: ConfiguratorStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress" className="overflow-x-auto pb-4">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`relative flex-shrink-0 ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
          >
            {index !== steps.length - 1 && (
              <div
                className="absolute right-0 top-1/2 -mt-px h-0.5 w-full bg-[var(--color-border-primary)]"
                aria-hidden="true"
              />
            )}

            <div className="group relative flex items-start">
              <span className="flex h-9 items-center" aria-hidden="true">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                    index < currentStepIndex
                      ? 'bg-[var(--color-accent)]'
                      : index === currentStepIndex
                      ? 'border-2 border-[var(--color-accent)] bg-primary'
                      : 'border-2 border-[var(--color-border-primary)] bg-primary'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={
                        index === currentStepIndex
                          ? 'h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]'
                          : 'h-2.5 w-2.5 rounded-full bg-transparent'
                      }
                    />
                  )}
                </span>
              </span>
              <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                <span
                  className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-[var(--color-accent)]' : 'text-secondary'
                  }`}
                >
                  {step.name}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}