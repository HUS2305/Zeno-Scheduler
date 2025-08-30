import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/nextauth";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import HowItWorksMobile from "@/components/landing/HowItWorksMobile";
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CogIcon
} from "@heroicons/react/24/outline";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
                  <h1 className="text-4xl font-bold text-black leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Zeno</h1>
                  <h2 className="text-lg font-normal text-gray-600 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Scheduler</h2>
                </Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  How It Works
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Pricing
                </Link>
                <Link href="#testimonials" className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Testimonials
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <h1 className="text-2xl tracking-tight font-extrabold text-black sm:text-3xl md:text-4xl">
                <span className="block">Transform Your Business</span>
                <span className="block text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 mt-2">With Smart Scheduling</span>
              </h1>
              <p className="mt-6 max-w-lg text-base text-gray-600">
                Streamline appointments, manage your team, and impress customers with our powerful scheduling platform. 
                Built for modern businesses that value efficiency and growth.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                7-day free trial • Cancel anytime
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="flex items-center justify-end">
              <img 
                src="/images/landing/hero-calendar.png"
                alt="Zeno Scheduler Dashboard - Calendar View with Appointments"
                className="w-[600px] h-auto rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
              Everything you need to grow your business
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Powerful features designed to streamline your scheduling process and boost customer satisfaction
            </p>
          </div>

          {/* Mobile: Icons and Titles Only, 2 per row */}
          <div className="mt-12 lg:mt-20 grid grid-cols-2 gap-6 sm:hidden">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <CalendarDaysIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">Smart Scheduling</h3>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <UserGroupIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">Team Management</h3>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">Analytics & Insights</h3>
            </div>

            {/* Feature 4 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ClockIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">24/7 Booking</h3>
            </div>

            {/* Feature 5 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <DevicePhoneMobileIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">Mobile Optimized</h3>
            </div>

            {/* Feature 6 */}
            <div className="text-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ShieldCheckIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-black">Reliable Platform</h3>
            </div>
          </div>

          {/* Desktop: Full Features with Descriptions, 3 per row */}
          <div className="hidden sm:grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12 lg:mt-20">
            {/* Feature 1 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <CalendarDaysIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">Smart Scheduling</h3>
              <p className="mt-2 text-sm text-gray-600">
                Intuitive scheduling system that adapts to your business needs and makes appointment booking simple and efficient.
              </p>

            </div>

            {/* Feature 2 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <UserGroupIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">Team Management</h3>
              <p className="mt-2 text-sm text-gray-600">
                Manage multiple team members, assign services, and coordinate schedules. Coming soon with advanced collaboration features.
              </p>

            </div>

            {/* Feature 3 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">Analytics & Insights</h3>
              <p className="mt-2 text-sm text-gray-600">
                Track your business performance with detailed reports and insights. Advanced analytics features coming soon.
              </p>

            </div>

            {/* Feature 4 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ClockIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">24/7 Booking</h3>
              <p className="mt-2 text-sm text-gray-600">
                Let customers book appointments anytime, anywhere with your custom booking page.
              </p>

            </div>

            {/* Feature 5 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <DevicePhoneMobileIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">Mobile Optimized</h3>
              <p className="mt-2 text-sm text-gray-600">
                Fully responsive design that works perfectly on all devices and screen sizes.
              </p>

            </div>

            {/* Feature 6 */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto group-hover:bg-gray-200 transition-colors">
                <ShieldCheckIcon className="h-6 w-6 text-black" />
              </div>
              <h3 className="mt-4 text-base font-medium text-black">Reliable Platform</h3>
              <p className="mt-2 text-sm text-gray-600">
                Built on modern technology with regular updates and maintenance to keep your business running smoothly.
              </p>

            </div>
          </div>
        </div>
      </div>







      {/* CTA Section Before How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
              Ready to get started?
            </h2>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              7-day free trial • Cancel anytime • No credit card required
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
              How Zeno Scheduler Works
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Get up and running in minutes with our simple 3-step process
            </p>
          </div>

          <div className="mt-12 lg:mt-20">
            {/* Mobile: Horizontal Scrollable Steps */}
            <HowItWorksMobile />

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white text-xl font-bold mx-auto">
                  1
                </div>
                <h3 className="mt-4 text-base font-medium text-black">Set Up Your Business</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Create your business profile, add services, and set your availability in just a few clicks.
                </p>

              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-4 text-base font-medium text-black">Share Your Booking Page</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get a custom URL to share with customers. They can book appointments 24/7.
                </p>
                                              
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white text-xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-4 text-base font-medium text-black">Manage & Grow</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Handle bookings, manage your team, and analyze performance to grow your business.
                </p>

              </div>
            </div>
            
            {/* Image Gallery Below Steps */}
            <div className="mt-16 lg:mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column - Backend Interfaces */}
                <div className="space-y-8">
                  {/* Services Management */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Services Management</h3>
                    <p className="text-sm text-gray-600 mb-4">Organize your services and categories with ease</p>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src="/images/landing/services-management.png"
                        alt="Services Management Interface"
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Customer Management */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Customer Management</h3>
                    <p className="text-sm text-gray-600 mb-4">Keep track of your customers and their appointments</p>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src="/images/landing/customer-management.png"
                        alt="Customer Management Interface"
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Calendar Dashboard */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Calendar Dashboard</h3>
                    <p className="text-sm text-gray-600 mb-4">Visual overview of all your appointments</p>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src="/images/landing/hero-calendar.png"
                        alt="Calendar Dashboard View"
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Public Interfaces */}
                <div className="space-y-8">
                  {/* Public Booking */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Public Booking</h3>
                    <p className="text-sm text-gray-600 mb-4">Beautiful booking page for your customers</p>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src="/images/landing/public-booking.png"
                        alt="Public Booking Page"
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-2">Time Selection</h3>
                    <p className="text-sm text-gray-600 mb-4">Intuitive time slot selection for appointments</p>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src="/images/landing/time-selection.png"
                        alt="Time Selection Interface"
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Pricing & Benefits Section */}
      <div id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Benefits Column - Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 text-center">Why businesses choose Zeno Scheduler</h2>
              <p className="text-base text-gray-600 mb-6 text-center">Discover the real benefits that drive growth and customer satisfaction</p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Reduce No-Shows</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Automated reminders help reduce cancellations
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Save Time</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Eliminate manual scheduling tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Optimize Schedule</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Reduce gaps and maximize earnings
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Better Experience</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Seamless booking for customers
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Grow Business</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Scale from solo to multi-location
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-black text-white">
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-black">Track Progress</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Monitor performance with insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Column - Right */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 text-center">Simple, transparent pricing</h2>
              <p className="text-base text-gray-600 mb-6 text-center">Pay only for what you need. No hidden fees, no surprises.</p>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-2">Pay Per Team Member</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-black">$5</span>
                    <span className="text-base text-gray-600">/month per team member</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Start with one, scale as you grow</p>
                  
                  <div className="text-left mb-4">
                    <h4 className="text-sm font-semibold text-black mb-2">Includes:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Unlimited appointments</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Custom booking page</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Mobile interface</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Team management</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors w-full justify-center"
                  >
                    Start Free Trial
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
              Trusted by businesses worldwide
            </h2>
            <p className="mt-4 text-base text-gray-600">
              See what our customers have to say about Zeno Scheduler
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                "Zeno Scheduler has transformed how we handle appointments. Our booking process is now seamless and our customers love the convenience."
              </p>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-semibold">SM</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-black">Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">Beauty Salon Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                "The scheduling system is intuitive and easy to use. It's helped us streamline our appointment booking process significantly."
              </p>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-semibold">DJ</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-black">David Johnson</p>
                  <p className="text-xs text-gray-500">Fitness Center Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                "The platform is reliable and the booking interface is user-friendly. It's exactly what our small business needed to get organized."
              </p>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-semibold">LW</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-black">Lisa Wang</p>
                  <p className="text-xs text-gray-500">Consulting Firm Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Ready to transform your business?
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Start managing your appointments more efficiently with Zeno Scheduler.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-white hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className="flex items-center justify-center">
              <img 
                src="/images/landing/time-selection.png"
                alt="Appointment Booking Interface"
                className="w-full max-w-md rounded-lg shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-black text-lg font-semibold mb-4">Zeno Scheduler</h3>
              <p className="text-gray-600 text-sm">
                The smart way to manage appointments and grow your business.
              </p>
            </div>
            <div>
              <h4 className="text-black text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-black text-sm transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-600 hover:text-black text-sm transition-colors">How It Works</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-black text-sm transition-colors">Pricing</Link></li>
                <li><Link href="/public" className="text-gray-600 hover:text-black text-sm transition-colors">Demo</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-300 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Zeno Scheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
