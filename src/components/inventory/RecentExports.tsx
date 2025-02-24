import React from 'react';
import { Clock, Download } from 'lucide-react';
import type { InventoryExport } from '../../types';

interface RecentExportsProps {
  exports: InventoryExport[];
  onSelect: (exp: InventoryExport) => void;
}

export function RecentExports({ exports, onSelect }: RecentExportsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (exports.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2"
      >
        <Clock className="h-5 w-5" />
        <span>Recent Exports</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {exports.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => {
                    onSelect(exp);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-900">{exp.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(exp.exportDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}