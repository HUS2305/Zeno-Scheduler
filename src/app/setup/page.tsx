import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SetupClient from './SetupClient';

export default async function SetupPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  return <SetupClient />;
}
