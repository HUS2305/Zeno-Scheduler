import type { Metadata } from "next";
import { Poppins, Racing_Sans_One } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const racingSansOne = Racing_Sans_One({
  variable: "--font-racing-sans-one",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Zeno Scheduler - Appointment Booking Made Simple",
  description: "Streamline your business with our powerful appointment scheduling platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
                <ClerkProvider>
              <html lang="en" suppressHydrationWarning>
                <body
                  className={`${poppins.variable} ${racingSansOne.variable} antialiased`}
                  suppressHydrationWarning
                >
                  {children}
                </body>
              </html>
            </ClerkProvider>
  );
}
