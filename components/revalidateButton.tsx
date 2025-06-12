

import { useTransition, useState } from 'react';
import { revalidateTeerResultPage } from '@/app/actions/revalidate';

export default function RevalidateButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState('');

  const handleClick = () => {
    startTransition(async () => {
      await revalidateTeerResultPage();
      setStatus('✅ Revalidated!');
      setTimeout(() => setStatus(''), 2000);
    });
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        disabled={isPending}
      >
        {isPending ? 'Revalidating...' : 'Revalidate Page'}
      </button>
      {status && <p className="text-sm text-green-500 mt-2">{status}</p>}
    </div>
  );
}
