// app/actions/revalidate.js
'use server'

import { revalidatePath } from 'next/cache'

export async function refreshData() {
  try {
    // Add ALL pages that need updating:
    revalidatePath('/dream-number')
    revalidatePath('/teer-result-today')
    revalidatePath('/previous-result')
    
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}