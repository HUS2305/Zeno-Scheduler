import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import TeamSelectionPageClient from "./TeamSelectionPageClient";

const prisma = new PrismaClient();

export default async function TeamSelectionPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { slug } = await params;
  const { serviceId } = await searchParams;

  if (!serviceId) {
    notFound();
  }

  const business = await prisma.business.findFirst({
    where: { id: slug },
    include: {
      team: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Fetch the selected service
  const selectedService = await prisma.service.findFirst({
    where: { id: serviceId },
  });

  if (!selectedService) {
    notFound();
  }

  return <TeamSelectionPageClient business={business} serviceId={serviceId} selectedService={selectedService} />;
}