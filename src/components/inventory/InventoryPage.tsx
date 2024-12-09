import React from 'react'
import { InventoryForm } from './InventoryForm'
import { InventoryList } from './InventoryList'
import { useInventory } from '../../hooks/useInventory'
import { FileDown, FileUp } from 'lucide-react'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { RecentExports } from './RecentExports'
import type { InventoryExport, InventoryItem } from '../../types'

export function InventoryPage() {
  const { items, addItem, updateItem, deleteItem, isLoading } = useInventory()
  const [showExportDialog, setShowExportDialog] = React.useState(false)
  const [exportTitle, setExportTitle] = React.useState('')
  const [recentExports, setRecentExports] = React.useState<InventoryExport[]>(
    () => {
      const saved = localStorage.getItem('recentExports')
      return saved ? JSON.parse(saved) : []
    }
  )

  const handleAddItem = async (
    newItem: Omit<InventoryItem, 'id' | 'dateAdded'>
  ) => {
    await addItem(newItem)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

  const handleExport = () => {
    if (!exportTitle.trim()) return

    const data = JSON.stringify(items, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportTitle.trim()}-${
      new Date().toISOString().split('T')[0]
    }.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const newExport: InventoryExport = {
      id: Date.now().toString(),
      title: exportTitle.trim(),
      data: items,
      exportDate: new Date().toISOString(),
    }

    const updatedExports = [newExport, ...recentExports.slice(0, 4)]
    setRecentExports(updatedExports)
    localStorage.setItem('recentExports', JSON.stringify(updatedExports))
    setShowExportDialog(false)
    setExportTitle('')
  }

  const importInventory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedItems = JSON.parse(e.target?.result as string)
          // Handle imported items through the inventory hook
          importedItems.forEach((item: InventoryItem) => {
            addItem(item)
          })
        } catch (error) {
          console.error('Error importing inventory:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Inventory Management
        </h2>
        <div className='flex items-center gap-4'>
          {isLoading && (
            <div className='text-sm text-gray-500'>Loading inventory...</div>
          )}
          <RecentExports
            exports={recentExports}
            onSelect={(exp) => setItems(exp.data)}
          />
          <label className='cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
            <div className='flex items-center gap-2'>
              <FileUp size={20} />
              Import
            </div>
            <input
              type='file'
              accept='.json'
              onChange={importInventory}
              className='hidden'
            />
          </label>
          <button
            onClick={() => setShowExportDialog(true)}
            className='btn-primary'>
            <FileDown size={20} />
            Export
          </button>
        </div>
      </div>

      {showExportDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
            <h3 className='mb-4 text-lg font-medium'>Export Inventory</h3>
            <div className='mb-4'>
              <label
                htmlFor='exportTitle'
                className='block text-sm font-medium text-gray-700'>
                Export Title
              </label>
              <input
                type='text'
                id='exportTitle'
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm'
                placeholder='Enter a title for this export'
                autoFocus
              />
            </div>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowExportDialog(false)}
                className='btn-secondary'>
                Cancel
              </button>
              <button
                onClick={handleExport}
                className='btn-primary'
                disabled={!exportTitle.trim()}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <ErrorBoundary>
          <h3 className='mb-4 text-lg font-medium text-gray-900'>
            Add New Item
          </h3>
          <InventoryForm onSubmit={handleAddItem} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <InventoryList
            items={items}
            onDelete={handleDeleteItem}
            onEdit={updateItem}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
