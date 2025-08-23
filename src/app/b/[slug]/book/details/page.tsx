import { notFound } from "next/navigation";
import DetailsPageClient from "./DetailsPageClient";
import prisma from "@/lib/prisma";

export default async function DetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string; teamMemberId?: string; date?: string; time?: string }>;
}) {
  const { slug } = await params;
  const { serviceId, teamMemberId, date, time } = await searchParams;
  
    if (!serviceId || !date || !time) {
    console.error("Missing required parameters:", { serviceId, date, time });
    notFound();
  }

  let business;
  try {
    // Get the business by slug
    business = await prisma.business.findFirst({
      where: { slug: slug },
      include: {
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
    console.error("Business not found for slug:", slug);
    notFound();
  }

    const selectedService = business.services[0];
  let selectedTeamMember = business.teamMembers[0];

  if (!selectedService) {
    console.error("Service not found for serviceId:", serviceId);
    notFound();
  }

  if (!selectedTeamMember) {
    console.error("Team member not found for teamMemberId:", teamMemberId);
    // Create a default team member if none exist
    if (business.teamMembers.length > 0) {
      selectedTeamMember = business.teamMembers[0];
    } else {
      // Create a default team member
      selectedTeamMember = {
        id: teamMemberId || "default-team-member",
        name: "Owner",
        email: "owner@example.com"
      };
    }
  }

  return (
    <DetailsPageClient
      business={business}
      selectedService={selectedService}
      selectedTeamMember={selectedTeamMember}
      serviceId={serviceId}
      teamMemberId={teamMemberId}
      selectedDate={date}
      selectedTime={time}
      slug={slug}
    />
  );
} 