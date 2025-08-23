"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BusinessSetupPage() {
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: businessName,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        throw new Error("Failed to create business");
      }
    } catch (error) {
      console.error("Error creating business:", error);
      alert("Failed to create business. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Large Logo at Top */}
      <div className="pt-16 pb-8 text-center">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity cursor-pointer">
          <h1 className="text-6xl font-bold text-black leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Zeno</h1>
          <h2 className="text-2xl font-normal text-gray-600 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Scheduler</h2>
        </Link>
      </div>

      {/* Business Setup Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-black">
            Set up your business
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your business profile to get started with Zeno Scheduler
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg border border-gray-200 sm:rounded-xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-black"
                >
                  Business Name
                </label>
                <div className="mt-1">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !businessName.trim()}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Creating..." : "Create Business"}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need to add more business details? You can configure additional settings like business hours, contact information, and more in your dashboard settings after setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
