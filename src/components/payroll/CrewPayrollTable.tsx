import React from 'react';
import { PayrollEntry } from '../../types';
import { Edit2, Check, Plus, Save, Trash2, X } from 'lucide-react';

interface EmployeePayrollTableProps {
  employeeId: string;
  employeeName?: string;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  entries: PayrollEntry[];
  onEntryChange: (index: number, entry: PayrollEntry) => void;
  onAddEntry: (entry: PayrollEntry) => void;
  onRemoveEntry: (index: number) => void;
  onSubmitEntries: (entries: PayrollEntry[]) => void;
}

export function EmployeePayrollTable({
  employeeId,
  employeeName = '',
  onNameChange,
  onDelete,
  entries,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onSubmitEntries,
}: EmployeePayrollTableProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekTotal = entries.reduce((sum, entry) => 
    sum + entry.amounts.reduce((daySum, amount) => daySum + amount, 0), 0
  );
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(employeeName);
  const [showEntryForm, setShowEntryForm] = React.useState(false);
  const [newEntry, setNewEntry] = React.useState<PayrollEntry>({
    jobName: '',
    jobNumber: '',
    amounts: Array(7).fill(0),
    date: new Date().toISOString().split('T')[0],
  });

  // Update tempName when employeeName prop changes
  React.useEffect(() => {
    setTempName(employeeName);
  }, [employeeName]);

  const handleNameSave = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleAddEntry = () => {
    onAddEntry(newEntry);
    setShowEntryForm(false);
    setNewEntry({
      jobName: '',
      jobNumber: '',
      amounts: Array(7).fill(0),
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="rounded-md border-gray-300 text-lg font-medium min-w-[200px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSave();
                  }
                }}
              />
              <button
                onClick={handleNameSave}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                disabled={!tempName.trim()}
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{employeeName}</h3>
              <button
                onClick={() => setIsEditingName(true)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => onSubmitEntries(entries)}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            Submit Entries
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 min-w-[200px]">Job</th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 min-w-[120px]">#</th>
              {days.map((day) => (
                <th key={day} className="px-3 py-2 text-center text-sm font-semibold text-gray-900 min-w-[100px]">
                  {day}
                </th>
              ))}
              <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-3 py-2">
                  <input
                    type="text"
                    value={entry.jobName}
                    onChange={(e) =>
                      onEntryChange(index, { ...entry, jobName: e.target.value })
                    }
                    className="w-full rounded border-gray-300 text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <input
                    type="text"
                    value={entry.jobNumber}
                    onChange={(e) =>
                      onEntryChange(index, { ...entry, jobNumber: e.target.value })
                    }
                    className="w-full rounded border-gray-300 text-sm"
                  />
                </td>
                {days.map((day, dayIndex) => (
                  <td key={day} className="whitespace-nowrap px-3 py-2">
                    <input
                      type="number"
                      value={entry.amounts[dayIndex] || ''}
                      onChange={(e) => {
                        const newAmounts = [...entry.amounts];
                        newAmounts[dayIndex] = parseFloat(e.target.value) || 0;
                        onEntryChange(index, { ...entry, amounts: newAmounts });
                      }}
                      className="w-full rounded border-gray-300 text-right text-sm"
                    />
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-2 text-center">
                  <button
                    onClick={() => onRemoveEntry(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          {showEntryForm && (
            <tr className="bg-secondary/5">
              <td className="whitespace-nowrap px-3 py-2">
                <input
                  type="text"
                  value={newEntry.jobName}
                  onChange={(e) => setNewEntry({ ...newEntry, jobName: e.target.value })}
                  className="w-full rounded border-gray-300 text-sm"
                  placeholder="Job Name"
                  autoFocus
                />
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <input
                  type="text"
                  value={newEntry.jobNumber}
                  onChange={(e) => setNewEntry({ ...newEntry, jobNumber: e.target.value })}
                  className="w-full rounded border-gray-300 text-sm"
                  placeholder="Job #"
                />
              </td>
              {days.map((day, dayIndex) => (
                <td key={day} className="whitespace-nowrap px-3 py-2">
                  <input
                    type="number"
                    value={newEntry.amounts[dayIndex] || ''}
                    onChange={(e) => {
                      const amounts = [...newEntry.amounts];
                      amounts[dayIndex] = parseFloat(e.target.value) || 0;
                      setNewEntry({ ...newEntry, amounts });
                    }}
                    className="w-full rounded border-gray-300 text-right text-sm"
                    placeholder="0.00"
                  />
                </td>
              ))}
              <td className="whitespace-nowrap px-3 py-2 text-center">
                <button
                  onClick={handleAddEntry}
                  className="text-brand-orange hover:text-brand-orange/80"
                >
                  <Check className="h-4 w-4" />
                </button>
              </td>
            </tr>
          )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="px-3 py-2 text-right font-semibold">
                Week Total:
              </td>
              <td
                colSpan={7}
                className="px-3 py-2 text-left font-semibold text-gray-900"
              >
                ${weekTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={() => setShowEntryForm(true)}
        className="mt-4 btn-primary text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Entry
      </button>
    </div>
  );
}