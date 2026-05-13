import NoteDetailContent from "./NoteDetailContent";

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteDetailContent id={id} />;
}
