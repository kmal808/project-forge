import React from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import type { PunchJobList } from '../types'

export function usePunchLists(crewId?: string) {
	const [lists, setLists] = React.useState<PunchJobList[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [error, setError] = React.useState<Error | null>(null)

	const fetchLists = React.useCallback(async () => {
		if (!crewId) {
			setLists([])
			setIsLoading(false)
			return
		}

		try {
			setIsLoading(true)
			const { data, error } = await (supabase as any)
				.from('punch_lists')
				.select('*')
				.eq('crew_id', crewId)
				.order('created_at', { ascending: false })

			if (error) throw error

			const mapped = (Array.isArray(data) ? data : []).map((row: any) => ({
				id: row.id,
				crewId: row.crew_id,
				jobName: row.job_name,
				jobNumber: row.job_number,
				userId: row.user_id,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}))

			setLists(mapped)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch punch lists'))
			toast.error('Failed to fetch punch lists')
		} finally {
			setIsLoading(false)
		}
	}, [crewId])

	React.useEffect(() => {
		fetchLists()
	}, [fetchLists])

	const addList = async (payload: { crewId: string; jobName: string; jobNumber: string }) => {
		try {
			const { data: userData, error: userError } = await supabase.auth.getUser()
			if (userError) throw userError

			const { data, error } = await (supabase as any)
				.from('punch_lists')
				.insert({
					crew_id: payload.crewId,
					job_name: payload.jobName,
					job_number: payload.jobNumber,
					user_id: userData.user.id,
				})
				.select('*')
				.single()

			if (error) throw error

			const created: PunchJobList = {
				id: data.id,
				crewId: data.crew_id,
				jobName: data.job_name,
				jobNumber: data.job_number,
				userId: data.user_id,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			}
			setLists((prev) => [created, ...prev])
			toast.success('Punch list created')
			return created
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to create punch list'
			if (message.toLowerCase().includes('duplicate') || message.includes('unique')) {
				toast.error('A punch list already exists for this crew and job number')
			} else {
				toast.error(message)
			}
			throw err
		}
	}

	const deleteList = async (id: string) => {
		try {
			const { error } = await (supabase as any).from('punch_lists').delete().eq('id', id)
			if (error) throw error
			setLists((prev) => prev.filter((list) => list.id !== id))
			toast.success('Punch list deleted')
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to delete punch list'
			toast.error(message)
			throw err
		}
	}

	return {
		lists,
		isLoading,
		error,
		addList,
		deleteList,
		refresh: fetchLists,
	}
}

