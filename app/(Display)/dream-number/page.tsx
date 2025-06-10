import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Numbers Data - Shillong Teer",
  description:
    "Explore all dream number entries submitted by users. View direct, house, and ending numbers based on dream interpretations.",
};

interface DreamEntry {
  id: string;
  dream: string;
  direct: string;
  house: string;
  ending: string;
  createdAt?: Timestamp | null;
}

export default async function DreamNumbersPage() {
  const entries: DreamEntry[] = [];

  const snapshot = await getDocs(collection(db, "dreams"));

  snapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({
      id: doc.id,
      dream: data.dream || "",
      direct: data.direct || "",
      house: data.house || "",
      ending: data.ending || "",
      createdAt: data.createdAt || null,
    });
  });

  // Sort on client if createdAt is available
  const sortedEntries = entries.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dream Number Entries</h1>
      <p className="text-gray-600 mb-4">
        View dream interpretations with their associated Teer numbers.
      </p>

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
              {sortedEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    No dream entries available.
                  </TableCell>
                </TableRow>
              ) : (
                sortedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-pre-line max-w-sm break-words">
                      {entry.dream}
                    </TableCell>
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
