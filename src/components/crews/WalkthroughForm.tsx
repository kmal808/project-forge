import React from 'react';
import { WalkthroughForm as WalkthroughFormType, FileUpload } from '../../types';
import { FileUploader } from './FileUploader';
import { Plus, Minus, AlertTriangle, Wrench, DollarSign } from 'lucide-react';

interface WalkthroughFormProps {
  onSubmit: (form: Omit<WalkthroughFormType, 'id'>) => void;
}

export function WalkthroughForm({ onSubmit }: WalkthroughFormProps) {
  const [formData, setFormData] = React.useState<Omit<WalkthroughFormType, 'id'>>({
    jobId: '',
    completionDate: new Date().toISOString().split('T')[0],
    clientName: '',
    installationIssues: [],
    manufacturingIssues: [],
    paymentStatus: 'pending',
    paymentAmount: 0,
    followUpNeeded: false,
    followUpNotes: '',
    photos: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addIssue = (type: 'installation' | 'manufacturing') => {
    const newIssue = {
      description: '',
      severity: 'minor' as const,
      resolution: '',
    };

    setFormData((prev) => ({
      ...prev,
      [type === 'installation' ? 'installationIssues' : 'manufacturingIssues']: [
        ...prev[type === 'installation' ? 'installationIssues' : 'manufacturingIssues'],
        newIssue,
      ],
    }));
  };

  const removeIssue = (type: 'installation' | 'manufacturing', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'installation' ? 'installationIssues' : 'manufacturingIssues']: prev[
        type === 'installation' ? 'installationIssues' : 'manufacturingIssues'
      ].filter((_, i) => i !== index),
    }));
  };

  const handleIssueChange = (
    type: 'installation' | 'manufacturing',
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'installation' ? 'installationIssues' : 'manufacturingIssues']: prev[
        type === 'installation' ? 'installationIssues' : 'manufacturingIssues'
      ].map((issue, i) =>
        i === index ? { ...issue, [field]: value } : issue
      ),
    }));
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
            Job ID
          </label>
          <input
            type="text"
            id="jobId"
            value={formData.jobId}
            onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Installation Issues</h3>
          <button
            type="button"
            onClick={() => addIssue('installation')}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Issue
          </button>
        </div>

        {formData.installationIssues.map((issue, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-grow space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={issue.description}
                      onChange={(e) =>
                        handleIssueChange('installation', index, 'description', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                      value={issue.severity}
                      onChange={(e) =>
                        handleIssueChange('installation', index, 'severity', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution</label>
                  <textarea
                    value={issue.resolution}
                    onChange={(e) =>
                      handleIssueChange('installation', index, 'resolution', e.target.value)
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeIssue('installation', index)}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Manufacturing Issues</h3>
          <button
            type="button"
            onClick={() => addIssue('manufacturing')}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Issue
          </button>
        </div>

        {formData.manufacturingIssues.map((issue, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-grow space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={issue.description}
                      onChange={(e) =>
                        handleIssueChange('manufacturing', index, 'description', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                      value={issue.severity}
                      onChange={(e) =>
                        handleIssueChange('manufacturing', index, 'severity', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution</label>
                  <textarea
                    value={issue.resolution}
                    onChange={(e) =>
                      handleIssueChange('manufacturing', index, 'resolution', e.target.value)
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeIssue('manufacturing', index)}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({ ...formData, paymentStatus: e.target.value as WalkthroughFormType['paymentStatus'] })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
              Payment Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="paymentAmount"
                value={formData.paymentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })
                }
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="followUpNeeded"
            checked={formData.followUpNeeded}
            onChange={(e) => setFormData({ ...formData, followUpNeeded: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="followUpNeeded" className="text-sm font-medium text-gray-700">
            Follow-up Needed
          </label>
        </div>

        {formData.followUpNeeded && (
          <div>
            <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-700">
              Follow-up Notes
            </label>
            <textarea
              id="followUpNotes"
              value={formData.followUpNotes}
              onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Photos</h3>
        <FileUploader
          onUpload={handleFileUpload}
          accept="image/*"
          multiple={true}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Submit Walkthrough
        </button>
      </div>
    </form>
  );
}