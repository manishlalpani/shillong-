"use client";

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
  createdAt: number; // already converted to number
}

export default function DreamNumbersPage({ data }: { data: DreamEntry[] }) {
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
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    No dream entries available.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((entry) => (
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
