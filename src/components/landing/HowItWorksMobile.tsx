"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function HowItWorksMobile() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: 1,
      title: "Set Up Your Business",
      description: "Create your business profile, add services, and set your availability in just a few clicks."
    },
    {
      number: 2,
      title: "Share Your Booking Page",
      description: "Get a custom URL to share with customers. They can book appointments 24/7."
    },
    {
      number: 3,
      title: "Manage & Grow",
      description: "Handle bookings, manage your team, and analyze performance to grow your business."
    }
  ];

  const goToPrevious = () => {
    setCurrentStep(prev => prev === 0 ? steps.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentStep(prev => prev === steps.length - 1 ? 0 : prev + 1);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="lg:hidden relative">
      {/* Mobile Navigation Arrows - Positioned at edges */}
      <button 
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
      >
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      </button>

      {/* Centered Content Container */}
      <div className="flex justify-center px-16">
        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white text-xl font-bold mx-auto">
            {currentStepData.number}
          </div>
          <h3 className="mt-4 text-base font-medium text-black">{currentStepData.title}</h3>
          <p className="mt-2 text-sm text-gray-600">
            {currentStepData.description}
          </p>
        </div>
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
