import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const envVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set (length: ' + process.env.RESEND_API_KEY.length + ')' : 'Not set',
    FROM_EMAIL: process.env.FROM_EMAIL || 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set',
  };

  return NextResponse.json({
    success: true,
    environment: envVars,
    message: "Environment variables debug info",
  });
}




