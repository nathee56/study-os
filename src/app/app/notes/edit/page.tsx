'use client';

import NoteDetailContent from "./NoteDetailContent";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NoteEditPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  if (!id) return <div className="p-8 text-center">ไม่พบไอดีโน้ต</div>;
  return <NoteDetailContent id={id} />;
}

export default function NoteEditPage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 400 }} />}>
      <NoteEditPageContent />
    </Suspense>
  );
}
