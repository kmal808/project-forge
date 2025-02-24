import React from 'react';
import { useContainers } from '../../hooks/useContainers';
import { Package2, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ContainerListProps {
  collapsed?: boolean;
}

export function ContainerList({ collapsed = false }: ContainerListProps) {
  const { containerId } = useParams();
  const { containers, isLoading, addContainer } = useContainers();
  const [showNewContainer, setShowNewContainer] = React.useState(false);
  const [containerNumber, setContainerNumber] = React.useState('');

  const containerNumberRegex = /^[A-Z]{4}-\d{5}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNumberRegex.test(containerNumber)) {
      toast.error('Invalid container number format (e.g., ABCD-12345)');
      return;
    }
    try {
      await addContainer(containerNumber);
      setContainerNumber('');
      setShowNewContainer(false);
    } catch (error) {
      console.error('Failed to add container:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showNewContainer ? (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-md bg-gray-50 p-2">
          <input
            type="text"
            value={containerNumber}
            onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            placeholder="ABCD-12345"
            pattern="[A-Z]{4}-\d{5}"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewContainer(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs text-brand-orange hover:text-brand-orange/80"
              disabled={!containerNumberRegex.test(containerNumber)}
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowNewContainer(true)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Container</span>
        </button>
      )}

      {containers.map((container) => (
        <Link
          key={container.id}
          to={`/inventory/${container.id}`}
          className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
            containerId === container.id
              ? 'bg-brand-orange text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>{container.containerNumber}</span>
          </div>
          {container.itemCount > 0 && (
            <span className={`text-xs ${
              containerId === container.id ? 'text-white/80' : 'text-gray-400'
            }`}>
              {container.itemCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}