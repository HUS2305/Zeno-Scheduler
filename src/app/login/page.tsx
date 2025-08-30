"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to sign in with:", { email });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
      } else if (result?.ok) {
        console.log("Login successful, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        setError("Login failed - no response");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
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

      {/* Sign In Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-black">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-black hover:text-gray-700 underline"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg border border-gray-200 sm:rounded-xl sm:px-10">
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
              
              <div className="text-center">
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
} 