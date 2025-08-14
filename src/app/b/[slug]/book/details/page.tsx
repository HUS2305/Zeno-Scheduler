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
  
  console.log("Details page params:", { slug, serviceId, teamMemberId, date, time });

  if (!serviceId || !date || !time) {
    console.error("Missing required parameters:", { serviceId, date, time });
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
    console.error("Business not found for slug:", slug);
    notFound();
  }

  console.log("Business data:", {
    id: business.id,
    name: business.name,
    teamCount: business.team.length,
    servicesCount: business.services.length
  });

  const selectedService = business.services[0];
  let selectedTeamMember = business.team[0];

  if (!selectedService) {
    console.error("Service not found for serviceId:", serviceId);
    notFound();
  }

  if (!selectedTeamMember) {
    console.error("Team member not found for teamMemberId:", teamMemberId);
    // Create a default team member if none exist
    if (business.team.length > 0) {
      selectedTeamMember = business.team[0];
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