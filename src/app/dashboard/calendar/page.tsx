import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarWrapper from "../../../components/dashboard/CalendarWrapper";

export default async function CalendarPage() {
  const user = await currentUser();

  if (!user?.id) {
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