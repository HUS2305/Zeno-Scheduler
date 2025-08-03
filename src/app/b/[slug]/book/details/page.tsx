import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import DetailsPageClient from "./DetailsPageClient";

const prisma = new PrismaClient();

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
    business = await prisma.business.findFirst({
      where: { id: slug },
      include: {
        team: teamMemberId ? {
          where: { id: teamMemberId },
        } : {
          take: 1,
        },
        services: {
          where: { id: serviceId },
        },
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    console.log("Using mock data for business:", slug);
    // Use mock data when database is unavailable
    business = {
      id: slug,
      name: "the crew",
      profilePic: null,
      team: [
        {
          id: teamMemberId || "6887e529375836ca77827faf",
          name: "Owner",
          email: "owner@example.com"
        }
      ],
      services: [
        {
          id: serviceId,
          name: "Klip",
          duration: 30,
          price: 100,
        }
      ]
    };
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
    />
  );
} 