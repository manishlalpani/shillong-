import React from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const revalidate = 60 // 24 hours in seconds

interface TeerItem {
  id: string
  row1: number[]
  row2: number[]
}

async function getTeerData(): Promise<TeerItem[]> {
  // Use the correct collection name ("teerResults" instead of "teer_results")
  const q = query(collection(db, 'teerResults'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  const data: TeerItem[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    row1: doc.data().row1 || [],
    row2: doc.data().row2 || [],
  }))
  return data
}

export default async function CommonNumberPage() {
  const results = await getTeerData()

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Common Numbers</h2>
      <table className="min-w-full table-auto border border-gray-300 text-left text-sm md:text-base text-gray-700 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-green-200 font-semibold">
          <tr>
            <th className="border px-4 py-2 md:px-6 md:py-4">Direct</th>
            <th className="border px-4 py-2 md:px-6 md:py-4">House</th>
            <th className="border px-4 py-2 md:px-6 md:py-4">Ending</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <React.Fragment key={item.id}>
              <tr className="bg-white hover:bg-green-50 transition">
                {item.row1.map((num, idx) => (
                  <td key={idx} className="border px-4 py-2 md:px-6 md:py-4">
                    {num}
                  </td>
                ))}
              </tr>
              <tr className="bg-white hover:bg-green-50 transition">
                {item.row2.map((num, idx) => (
                  <td key={idx} className="border px-4 py-2 md:px-6 md:py-4">
                    {num}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}