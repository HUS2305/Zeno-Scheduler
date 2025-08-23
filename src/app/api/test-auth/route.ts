import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test NextAuth configuration
    const session = await getServerSession(authOptions);
    
    // Test user lookup
    let userInfo = null;
    if (session?.user?.id) {
      userInfo = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });
    }
    
    // Test business lookup
    let businessInfo = null;
    if (session?.user?.id) {
      businessInfo = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
        select: {
          id: true,
          name: true,
          slug: true
        }
      });
    }
    
    // Test team member lookup
    let teamMemberInfo = null;
    if (session?.user?.id) {
      teamMemberInfo = await prisma.teamMember.findFirst({
        where: { userId: session.user.id },
        select: {
          id: true,
          role: true,
          status: true,
          businessId: true
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "NextAuth test successful",
      data: {
        session: {
          exists: !!session,
          userId: session?.user?.id || null,
          userEmail: session?.user?.email || null
        },
        userInfo,
        businessInfo,
        teamMemberInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("NextAuth test failed:", error);
    return NextResponse.json({
      success: false,
      message: "NextAuth test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}





