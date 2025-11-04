import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-12">
            <div className="text-center">
              <h1 className="text-7xl font-bold text-black leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Zeno</h1>
              <h2 className="text-3xl font-normal text-gray-600 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Scheduler</h2>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-black hover:bg-gray-800 text-white font-bold text-sm normal-case',
              card: 'shadow-lg',
            }
          }}
          routing="path"
          path="/register"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          oauthFlow="redirect"
          />
        </div>
      </div>
    </div>
  );
}