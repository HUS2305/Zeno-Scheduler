import { currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import SettingsClientClerk from "./SettingsClientClerk";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsClientClerk />;
} 