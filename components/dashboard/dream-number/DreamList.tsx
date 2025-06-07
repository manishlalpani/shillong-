"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import DreamForm from "./DreamForm";

interface DreamEntry {
  id: string;
  dream: string;
  direct: string;
  house: string;
  ending: string;
  createdAt?: any;
}

const CACHE_KEY = "dreams_cache";
const CACHE_EXPIRY_KEY = "dreams_cache_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function DreamList() {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [editEntry, setEditEntry] = useState<DreamEntry | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    const expiry = sessionStorage.getItem(CACHE_EXPIRY_KEY);
    const isExpired = !expiry || Date.now() > Number(expiry);

    if (cached && !isExpired) {
      setEntries(JSON.parse(cached));
    }

    const q = query(collection(db, "dreams"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DreamEntry[];

      setEntries(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "dreams", id));
      setMessage({ type: "success", text: "🗑️ Entry deleted successfully." });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "❌ Failed to delete entry." });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {editEntry && (
        <div className="p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Edit Entry</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="ml-2"
            >
              Close
            </Button>
          </div>
          <DreamForm entryToEdit={editEntry} onSuccess={() => setEditEntry(null)} />
        </div>
      )}

      {message && (
        <div
          className={`text-sm mb-2 font-medium ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Dream</th>
              <th className="border p-2 text-left">Direct</th>
              <th className="border p-2 text-left">House</th>
              <th className="border p-2 text-left">Ending</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border p-2">{entry.dream}</td>
                  <td className="border p-2">{entry.direct}</td>
                  <td className="border p-2">{entry.house}</td>
                  <td className="border p-2">{entry.ending}</td>
                  <td className="border p-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditEntry(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
