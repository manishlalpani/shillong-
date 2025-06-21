// app/actions/revalidate.ts (add to existing file)
'use server'

import { revalidatePath } from 'next/cache'

// Instant revalidation for all pages
export async function refreshNow() {
  try {
    // Revalidate all important paths
    revalidatePath('/dream-number', 'layout')
    revalidatePath('/teer-result-today', 'layout')
    revalidatePath('/previous-result', 'layout')
     revalidatePath('/', 'layout')
    
    return { success: true, timestamp: Date.now() }
  } catch (error) {
    return { success: false, error: error.message }
  }
}