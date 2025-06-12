'use server'
import { revalidatePath } from 'next/cache';

// Revalidate the main display page
export async function revalidateTeerResultPage() {
  revalidatePath('/dream-number'); // Adjust path if needed
}

// If you have more pages to revalidate:
export async function revalidateAllPages() {
  revalidatePath('/teer-result-today');
  revalidatePath('/previous-result'); // Add more as needed
}