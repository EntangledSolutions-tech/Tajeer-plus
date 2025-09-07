import React, { useState } from 'react';
import Steps from 'rc-steps';
import 'rc-steps/assets/index.css';
import './CustomStepper.css';

export interface StepperStep {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

interface CustomStepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: (data: any) => void;
  className?: string;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  vertical?: boolean;
  navigationButtons?: React.ReactNode;
}



export default function CustomStepper({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className = '',
  showProgress = true,
  showStepNumbers = true,
  vertical = true,
  navigationButtons
}: CustomStepperProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleStepComplete = (stepData: any) => {
    setFormData(prev => ({ ...prev, [currentStep]: stepData }));

    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      // All steps completed
      onComplete?.(formData);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  if (!CurrentStepComponent) {
    return <div>Step not found</div>;
  }

  return (
    <div className={`flex ${vertical ? 'flex-row' : 'flex-col'} h-full ${className}`}>
        {/* Stepper Sidebar */}
        <div className={`${vertical ? 'w-1/4' : 'w-full'} bg-[#0472ac] flex flex-col items-center py-8 px-4 flex-shrink-0`}>
          <div className="w-full">
            {showProgress && (
              <>
                <div className="text-xs text-white/70 mb-2">
                  Completed {currentStep}/{steps.length}
                </div>
                <div className="stepper-progress">
                  <div
                    className="stepper-progress-bar bg-white"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
              </>
            )}

            <Steps
              direction={vertical ? "vertical" : "horizontal"}
              current={currentStep}
              items={steps.map((step, index) => ({
                title: showStepNumbers ? `${index + 1}. ${step.name}` : step.name,
              }))}
              className="custom-rc-steps"
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 bg-card flex flex-col">
          <div className="flex-1 px-12 py-10 overflow-y-auto min-h-0">
            <CurrentStepComponent />
            {navigationButtons && (
              <div className="mt-8">
                {navigationButtons}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
