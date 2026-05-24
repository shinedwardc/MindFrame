import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function JournalPage() {
  const session = await auth()
  if (!session) redirect('/')

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Journal</h1>
      <p className="text-gray-500 mt-1">Write and analyze your entries here.</p>
    </main>
  )
}
