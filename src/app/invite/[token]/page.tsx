import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import InvitationAcceptanceForm from './InvitationAcceptanceForm';

interface InvitationPageProps {
  params: {
    token: string;
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params;

  // Get invitation details
  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: {
      business: true,
    },
  });

  if (!invitation) {
    redirect('/invite/invalid');
  }

  // Check if invitation has expired
  if (invitation.expiresAt < new Date()) {
    redirect('/invite/expired');
  }

  // Check if invitation has already been accepted
  if (invitation.acceptedAt) {
    redirect('/invite/already-accepted');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join the Team</h1>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited to join {invitation.business.name}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <InvitationAcceptanceForm invitation={invitation} />
        </div>
      </div>
    </div>
  );
}



