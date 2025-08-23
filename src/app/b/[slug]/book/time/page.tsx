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
    // Get the business by slug
    business = await prisma.business.findFirst({
      where: { slug: slug },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: "asc" }
        },
        teamMembers: {
          orderBy: { name: "asc" }
        },
        services: {
          where: { id: serviceId }
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

  const selectedTeamMember = business.teamMembers[0];
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
      slug={slug}
    />
  );
}