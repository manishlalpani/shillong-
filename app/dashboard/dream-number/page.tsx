// app/dream-data/page.tsx
import DreamForm from '@/components/dashboard/dream-number/DreamForm';
import DreamList from '@/components/dashboard/dream-number/DreamList';
export default function DreamNumberPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Dream Data Manager</h1>
      <DreamForm />
      <DreamList />
    </main>
  );
}
