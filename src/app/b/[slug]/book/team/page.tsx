import { notFound } from "next/navigation";
import TeamSelectionPageClient from "./TeamSelectionPageClient";
import prisma from "@/lib/prisma";

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
    where: { slug: slug },
    include: {
      teamMembers: {
        orderBy: { name: "asc" }
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

  return <TeamSelectionPageClient business={business} serviceId={serviceId} selectedService={selectedService} slug={slug} />;
}