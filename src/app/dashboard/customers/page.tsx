import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/nextauth";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your customer relationships and view booking history.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Customer Management Coming Soon
          </h3>
          <p className="text-gray-500">
            View customer profiles, booking history, and manage relationships.
          </p>
        </div>
      </div>
    </div>
  );
} 