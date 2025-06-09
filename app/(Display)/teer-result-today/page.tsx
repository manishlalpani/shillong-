// app/(Display)/teer-result-today/page.tsx
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TeerResultTodayClient from './client';

export const revalidate = 3600; // Revalidate every hour instead of daily for more up-to-date results

interface TeerResultData {
  firstRound: number[];
  secondRound: number[];
  date: string;
}

export default async function TeerResultTodayPage() {
  // Get today's date in ISO format (YYYY-MM-DD)
  const todayISO = new Date().toISOString().split('T')[0];
  
  // Fetch data server-side for initial render
  let initialData: TeerResultData | null = null;
  
  try {
    const docRef = doc(db, 'teer_daily_results', todayISO);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      initialData = {
        firstRound: Array.isArray(data.firstRound) 
          ? data.firstRound.map(Number) 
          : data.firstRound !== undefined 
            ? [Number(data.firstRound)] 
            : [],
        secondRound: Array.isArray(data.secondRound)
          ? data.secondRound.map(Number)
          : data.secondRound !== undefined
            ? [Number(data.secondRound)]
            : [],
        date: todayISO
      };
    }
  } catch (error) {
    console.error('Error fetching initial data:', error);
    // Continue with null initialData
  }

  return <TeerResultTodayClient initialData={initialData} />;
}
