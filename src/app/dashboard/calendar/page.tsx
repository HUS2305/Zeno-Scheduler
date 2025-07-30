import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/nextauth";
import CalendarWrapper from "../../../components/dashboard/CalendarWrapper";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage your appointments with a beautiful calendar interface.</p>
      </div>

      <CalendarWrapper />
    </div>
  );
} 