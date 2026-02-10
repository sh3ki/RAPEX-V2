'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Title and Description */}
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 hidden md:block">{step.description}</p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: Show current step title below */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-gray-900">
          {steps.find(s => s.number === currentStep)?.title}
        </p>
        <p className="text-xs text-gray-500">
          {steps.find(s => s.number === currentStep)?.description}
        </p>
      </div>
    </div>
  );
}
