import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import TimeSelectionPageClient from "./TimeSelectionPageClient";

const prisma = new PrismaClient();

export default async function TimeSelectionPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string; teamMemberId?: string }>;
}) {
  const { slug } = await params;
  const { serviceId, teamMemberId } = await searchParams;

  if (!serviceId) {
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
          take: 1, // Get the first team member if no specific one is selected
        },
        services: {
          where: { id: serviceId },
        },
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // Use mock data when database is unavailable
    business = {
      id: slug,
      name: "the crew",
      profilePic: null,
      team: teamMemberId ? [{
        id: teamMemberId,
        name: "Owner",
        email: "owner@example.com"
      }] : [{
        id: "6887e529375836ca77827faf",
        name: "Owner", 
        email: "owner@example.com"
      }],
      services: [{
        id: serviceId || "688a66a83f44145ebfb594a2",
        name: "Dameklip",
        duration: 60,
        price: 100
      }]
    };
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
    />
  );
}