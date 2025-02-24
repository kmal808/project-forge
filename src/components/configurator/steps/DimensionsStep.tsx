import React from 'react';
import { Ruler } from 'lucide-react';

interface DimensionsStepProps {
  width?: number;
  height?: number;
  onComplete: (dimensions: { width: number; height: number }) => void;
}

export function DimensionsStep({ width = 24, height = 36, onComplete }: DimensionsStepProps) {
  const [dimensions, setDimensions] = React.useState({ width, height });
  const [errors, setErrors] = React.useState<{ width?: string; height?: string }>({});

  const validateDimensions = () => {
    const newErrors: { width?: string; height?: string } = {};
    
    if (dimensions.width < 12) {
      newErrors.width = 'Width must be at least 12 inches';
    }
    if (dimensions.width > 120) {
      newErrors.width = 'Width cannot exceed 120 inches';
    }
    if (dimensions.height < 24) {
      newErrors.height = 'Height must be at least 24 inches';
    }
    if (dimensions.height > 144) {
      newErrors.height = 'Height cannot exceed 144 inches';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDimensions()) {
      onComplete(dimensions);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Enter Dimensions</h2>
        <p className="mt-1 text-sm text-gray-500">
          Specify the width and height in inches
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative mx-auto max-w-md rounded-lg border-2 border-dashed border-gray-300 p-8">
          <Ruler className="mx-auto mb-6 h-12 w-12 text-gray-400" />
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-700">
                Width (inches)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="width"
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })
                  }
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.width
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.width && (
                  <p className="mt-1 text-sm text-red-600">{errors.width}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (inches)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="height"
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, height: parseInt(e.target.value) || 0 })
                  }
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.height
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="relative">
              <div
                className="border-2 border-indigo-600"
                style={{
                  width: `${Math.min(300, dimensions.width * 2)}px`,
                  height: `${Math.min(300, dimensions.height * 2)}px`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-gray-600">
                  {dimensions.width}"
                </div>
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-600">
                  {dimensions.height}"
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}