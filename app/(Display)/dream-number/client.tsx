"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DreamEntry {
  id: string;
  dream: string;
  direct: string;
  house: string;
  ending: string;
  createdAt?: Timestamp | null;
}

export default function DreamNumbersPage() {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const snapshot = await getDocs(collection(db, "dreams"));
        const tempEntries: DreamEntry[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          tempEntries.push({
            id: doc.id,
            dream: data.dream || "",
            direct: data.direct || "",
            house: data.house || "",
            ending: data.ending || "",
            createdAt: data.createdAt || null,
          });
        });

        const sorted = tempEntries.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setEntries(sorted);
      } catch (error) {
        console.error("Error fetching dream entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    No dream entries available.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
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
