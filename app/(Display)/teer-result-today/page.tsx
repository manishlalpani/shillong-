// app/dashboard/teer-result-today/page.tsx
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TeerResultTodayClient from './client';


interface FirestoreTeerResult {
  firstRound?: number | number[];
  secondRound?: number | number[];
  date: Timestamp;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStartEndTimestamps(dateStr: string) {
  const date = new Date(dateStr);
  const start = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  const end = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  return { start, end };
}

export const revalidate = 86400; // Revalidate once per day

export default async function TeerResultTodayPage() {
  const todayISO = formatDateISO(new Date());
  const { start, end } = getStartEndTimestamps(todayISO);

  const resultsQuery = query(
    collection(db, 'teer_daily_results'),
    where('date', '>=', start),
    where('date', '<', end)
  );

  const snapshot = await getDocs(resultsQuery);
  
  let initialData = null;
  if (!snapshot.empty) {
    const docData = snapshot.docs[0].data() as FirestoreTeerResult;
    initialData = {
      firstRound: Array.isArray(docData.firstRound) 
        ? docData.firstRound 
        : docData.firstRound !== undefined 
          ? [Number(docData.firstRound)] 
          : [],
      secondRound: Array.isArray(docData.secondRound)
        ? docData.secondRound
        : docData.secondRound !== undefined
          ? [Number(docData.secondRound)]
          : [],
      date: todayISO
    };
  }

  return <TeerResultTodayClient initialData={initialData} />;
}