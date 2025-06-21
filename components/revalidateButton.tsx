// components/RefreshButton.tsx
'use client'

import { useTransition } from 'react'
import { refreshNow } from '@/app/actions/revalidate'

export default function RefreshButton() {
  const [isPending, startTransition] = useTransition()
  
  const handleClick = () => {
    startTransition(async () => {
      const result = await refreshNow()
      if (result.success) {
        window.location.reload() // Optional: force immediate refresh
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-4 py-2 rounded text-white ${
        isPending ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      {isPending ? 'Refreshing...' : 'Refresh Now'}
    </button>
  )
}