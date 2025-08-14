import { notFound } from "next/navigation";
import TimeSelectionPageClient from "./TimeSelectionPageClient";
import prisma from "@/lib/prisma";

export default async function TimeSelectionPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string; teamMemberId?: string; selectedDate?: string; selectedTime?: string }>;
}) {
  const { slug } = await params;
  const { serviceId, teamMemberId, selectedDate, selectedTime } = await searchParams;

  if (!serviceId) {
    notFound();
  }

  let business;
  try {
    // The [slug] parameter is actually the business ID, so just use it directly
    business = await prisma.business.findFirst({
      where: { id: slug },
      select: {
        id: true,
        name: true,
        profilePic: true,
        theme: true,
        brandColor: true,
        team: {
          take: 1,
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          where: { id: serviceId },
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    notFound();
  }

  if (!business) {
    notFound();
  }

  const selectedTeamMember = business.team[0];
  const selectedService = business.services[0];

  if (!selectedService) {
    notFound();
  }

  return (
    <TimeSelectionPageClient 
      business={business} 
      selectedService={selectedService}
      selectedTeamMember={selectedTeamMember}
      serviceId={serviceId}
      teamMemberId={teamMemberId}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
    />
  );
}