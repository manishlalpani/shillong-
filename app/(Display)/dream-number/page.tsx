
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Numbers Data - Shillong Teer",
  description: "Explore all dream number entries submitted by users. View direct, house, and ending numbers based on dream interpretations."
};

interface DreamEntry {
  id: string;
  dream: string;
  direct: string;
  house: string;
  ending: string;
}

export default async function DreamNumbersPage() {
  const entries: DreamEntry[] = [];

  const q = query(collection(db, "dreams"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({
      id: doc.id,
      dream: data.dream,
      direct: data.direct,
      house: data.house,
      ending: data.ending,
    });
  });

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dream Number Entries</h1>
      <p className="text-gray-600 mb-4">View dream interpretations with their associated Teer numbers.</p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Dream</TableHead>
                <TableHead>Direct</TableHead>
                <TableHead>House</TableHead>
                <TableHead>Ending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No dream entries available.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-pre-line max-w-sm break-words">{entry.dream}</TableCell>
                    <TableCell>{entry.direct}</TableCell>
                    <TableCell>{entry.house}</TableCell>
                    <TableCell>{entry.ending}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
