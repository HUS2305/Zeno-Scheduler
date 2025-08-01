import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">No Business Found</h1>
        <p className="text-gray-600 mb-8">
          No business has been set up yet. Please create a business first.
        </p>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Login to Setup Business
        </Link>
      </div>
    </div>
  );
} 