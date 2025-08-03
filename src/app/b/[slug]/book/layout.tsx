import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import React from "react"; // Added missing import for React

const prisma = new PrismaClient();

// Mock data for when database is unavailable
const mockBusiness = {
  id: "6887e529375836ca77827faf",
  name: "the crew",
  profilePic: null,
  services: [
    {
      id: "688a66a83f44145ebfb594a2",
      name: "Dameklip",
      duration: 60,
      price: 100,
      colorTheme: "black",
      category: { name: "Dameklip" },
      teamLinks: []
    }
  ],
  team: [
    {
      id: "6887e529375836ca77827faf",
      name: "Owner",
      email: "owner@example.com"
    }
  ],
  openingHours: []
};

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let business;
  let servicesByCategory = {};
  
  try {
    business = await prisma.business.findFirst({
      where: { id: slug },
      include: {
        services: {
          where: { isHidden: false },
          include: {
            categoryLinks: {
              include: {
                category: true,
              },
            },
            teamLinks: {
              include: {
                teamMember: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
        team: {
          orderBy: { name: "asc" },
        },
        openingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        categories: {
          include: {
            serviceLinks: {
              include: {
                service: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!business) {
      notFound();
    }

    // Group services by category
    servicesByCategory = business.categories.reduce((acc: Record<string, any[]>, category: any) => {
      acc[category.name] = category.serviceLinks.map((link: any) => link.service);
      return acc;
    }, {} as Record<string, any[]>);

    // Add uncategorized services under "Others" category
    const uncategorizedServices = business.services.filter((service: any) => 
      service.categoryLinks.length === 0
    );
    if (uncategorizedServices.length > 0) {
      (servicesByCategory as Record<string, any[]>)["Others"] = uncategorizedServices;
    }

  } catch (error) {
    console.error("Database connection error, using mock data:", error);
    // Use mock data when database is unavailable
    business = mockBusiness;
    servicesByCategory = {
      "Dameklip": [mockBusiness.services[0]]
    };
  }

  return (
    <div>
      {React.cloneElement(children as React.ReactElement<any>, {
        business,
        servicesByCategory,
      })}
    </div>
  );
} 