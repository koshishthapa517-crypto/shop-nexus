import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/products');
  } else {
    redirect('/login');
  }
}
