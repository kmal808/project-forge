import React from 'react';
import { X, FileDown, Send } from 'lucide-react';
import type { ConfiguratorItem } from '../../types';

interface ConfiguratorCartProps {
  items: ConfiguratorItem[];
  open: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

export function ConfiguratorCart({
  items,
  open,
  onClose,
  onRemoveItem,
}: ConfiguratorCartProps) {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handleExport = () => {
    const data = {
      items,
      totalAmount,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Shopping Cart
                  </h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="flex py-6">
                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.productType}</h3>
                                <p className="ml-4">
                                  ${item.unitPrice * item.quantity}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.series} - {item.width}" x {item.height}"
                              </p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <p className="text-gray-500">Qty {item.quantity}</p>
                              <div className="flex">
                                <button
                                  type="button"
                                  className="font-medium text-indigo-600 hover:text-indigo-500"
                                  onClick={() => onRemoveItem(item.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${totalAmount}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleExport}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    <FileDown className="h-5 w-5" />
                    Export Quote
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
                  >
                    <Send className="h-5 w-5" />
                    Send to Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}