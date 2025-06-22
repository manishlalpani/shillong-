// app/create/page.tsx
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import TeerForm from '@/app/dashboard/common-number/client';

export default async function CreatePage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const startTimestamp = Timestamp.fromDate(startOfDay);
  const endTimestamp = Timestamp.fromDate(endOfDay);

  const q = query(
    collection(db, 'teer_results'),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<', endTimestamp)
  );

  const querySnapshot = await getDocs(q);

  let initialData = null;
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    initialData = {
      row1: data.row1 || [0, 0, 0],
      row2: data.row2 || [0, 0, 0],
      docId: docSnap.id, 
    };
  }

  return (
    <div className="container mx-auto py-8">
      
      <TeerForm initialData={initialData} />
    </div>
  );
}

export const revalidate = 86400; // Revalidate once per day