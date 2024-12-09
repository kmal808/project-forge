import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { toast } from 'sonner'
import { handleError } from '../utils/error'
import { optimisticUpdate } from '../utils/optimistic'
import type { InventoryItem } from '../types'

export function useInventory() {
  const items = useLiveQuery(() => db.inventory.toArray())
  const [optimisticItems, setOptimisticItems] = React.useState<InventoryItem[]>(
    []
  )

  React.useEffect(() => {
    if (items) {
      setOptimisticItems(items)
    }
  }, [items])

  const addItem = async (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    const newItem = {
      ...item,
      id: `temp-${Date.now()}`,
      dateAdded: new Date().toISOString(),
    }

    setOptimisticItems((prev) => [...prev, newItem])

    try {
      await optimisticUpdate('inventory', 'add', newItem)
      toast.success('Item added successfully')
    } catch (error) {
      setOptimisticItems((prev) => prev.filter((i) => i.id !== newItem.id))
      const message = handleError(error)
      toast.error(`Failed to add item: ${message}`)
      throw error
    }
  }

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const originalItems = [...optimisticItems]
    setOptimisticItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )

    try {
      await optimisticUpdate('inventory', 'update', { id, ...updates })
      toast.success('Item updated successfully')
    } catch (error) {
      setOptimisticItems(originalItems)
      const message = handleError(error)
      toast.error(`Failed to update item: ${message}`)
      throw error
    }
  }

  const deleteItem = async (id: string) => {
    const originalItems = [...optimisticItems]
    setOptimisticItems((prev) => prev.filter((item) => item.id !== id))

    try {
      await optimisticUpdate('inventory', 'delete', { id })
      toast.success('Item deleted successfully')
    } catch (error) {
      setOptimisticItems(originalItems)
      const message = handleError(error)
      toast.error(`Failed to delete item: ${message}`)
      throw error
    }
  }

  return {
    items: optimisticItems,
    addItem,
    updateItem,
    deleteItem,
    isLoading: items === undefined,
  }
}
