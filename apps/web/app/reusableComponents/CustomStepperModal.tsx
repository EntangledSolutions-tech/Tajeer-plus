import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@kit/ui/dialog';
import { Formik, Form } from 'formik';
import { toast } from '@kit/ui/sonner';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@kit/ui/alert-dialog';
import Steps from 'rc-steps';
import 'rc-steps/assets/index.css';
import './CustomStepper.css';
import CustomButton from './CustomButton';
import Image from 'next/image';

export interface StepperModalStep {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

interface CustomStepperModalProps {
  steps: StepperModalStep[];
  stepSchemas: any[];
  initialValues: any;
  triggerButton: React.ReactNode;
  title: string;
  onSubmit: (values: any, stepData: any) => Promise<void>;
  onComplete?: () => void;
  onDocumentsChange?: (documents: any[]) => void;
  initialDocuments?: { name: string; document_url: string }[];
  stepProps?: any;
  className?: string;
  maxWidth?: string;
  height?: string;
}

export default function CustomStepperModal({
  steps,
  stepSchemas,
  initialValues,
  triggerButton,
  title,
  onSubmit,
  onComplete,
  onDocumentsChange,
  initialDocuments,
  stepProps,
  className = '',
  maxWidth = 'max-w-5xl'
}: CustomStepperModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const formikRef = useRef<any>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formikRef.current && formikRef.current.dirty) {
      setShowCloseWarning(true);
      return;
    }
    setOpen(isOpen);
    if (!isOpen) {
      setStep(0);
      if (formikRef.current) {
        formikRef.current.resetForm();
      }
    }
  };

  const handleConfirmClose = () => {
    setShowCloseWarning(false);
    setOpen(false);
    setStep(0);
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
  };

  const handleCancelClose = () => {
    setShowCloseWarning(false);
  };

  const CurrentStepComponent = steps[step]?.component;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent
        className={`${maxWidth} w-full p-0 rounded-xl overflow-hidden border-0 ${className} custom-stepper-modal-content`}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Close Warning AlertDialog */}
        <AlertDialog open={showCloseWarning}>
          <AlertDialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close the modal? All data will be discarded.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel onClick={handleCancelClose}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClose} className="bg-red-600 hover:bg-red-700">
                Yes, Discard
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Modal content container */}
        <div className="flex flex-col bg-background custom-stepper-modal-content">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-4 bg-[#0472ac] relative flex-shrink-0">
            <div className="flex items-center min-w-[120px]">
              <Image
                src="/images/Logo/Tajeer Plus Logo [2x].png"
                alt="Tajeer Plus"
                width={120}
                height={40}
                className="h-12 w-auto"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
              <span className="text-2xl font-bold text-white">{title}</span>
            </div>
            <div className="flex items-center min-w-[120px] justify-end">
              <CustomButton
                isSecondary
                className="px-6 py-2 rounded-lg font-semibold cursor-pointer"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </CustomButton>
            </div>
          </div>

          {/* Content Area - flex layout for proper height */}
          <div className="flex flex-1 min-h-0">
            {/* Stepper Sidebar */}
            <div className="w-1/4 bg-[#0472ac] flex flex-col items-center py-8 px-4 flex-shrink-0">
              <div className="w-full">
                <div className="text-xs text-white/70 mb-2">
                  Completed {step}/{steps.length}
                </div>
                <div className="stepper-progress">
                  <div
                    className="stepper-progress-bar bg-white"
                    style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                <Steps
                  direction="vertical"
                  current={step}
                  items={steps.map((stepItem) => ({
                    title: stepItem.name,
                  }))}
                  className="custom-rc-steps"
                />
              </div>
            </div>

            {/* Form Content - scrollable area */}
            <div className="flex-1 bg-card flex flex-col">
              <div className="flex-1 px-12 py-10 custom-stepper-scrollable">
                <Formik
                  initialValues={initialValues}
                  validationSchema={stepSchemas[step]}
                  innerRef={formikRef}
                  enableReinitialize={true}
                  onSubmit={async (values, actions) => {
                    try {
                      if (step < stepSchemas.length - 1) {
                        // Check if current step is valid before proceeding
                        const currentSchema = stepSchemas[step];
                        if (currentSchema) {
                          try {
                            await currentSchema.validate(values, { abortEarly: false });
                            setStep(step + 1);
                          } catch (validationError: any) {
                            toast.error('Please fill in all required fields before proceeding.');
                            return;
                          }
                        } else {
                          setStep(step + 1);
                        }
                      } else {
                        // Final step - submit
                        setLoading(true);
                        try {
                          await onSubmit(values, { step, allSteps: steps });
                          setOpen(false);
                          onComplete?.();
                        } catch (e: any) {
                          toast.error('Error submitting: ' + (e?.message || 'Unknown error'));
                        } finally {
                          setLoading(false);
                        }
                      }
                    } catch (error: any) {
                      if (error.message === 'Validation failed') {
                        toast.error('Please fill in all required fields.');
                      } else {
                        toast.error('Error: ' + (error?.message || 'Unknown error'));
                      }
                    }
                  }}
                >
                  {formik => {
                    // Debug: Log form state (remove this after debugging)
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Form State:', {
                        isValid: formik.isValid,
                        isValidating: formik.isValidating,
                        errors: formik.errors,
                        touched: formik.touched,
                        values: formik.values
                      });
                    }

                    return (
                    <Form>
                      {CurrentStepComponent && <CurrentStepComponent
                        onDocumentsChange={onDocumentsChange}
                        initialDocuments={initialDocuments}
                        {...stepProps}
                      />}

                      {/* Navigation buttons - at the end of content */}
                      <div className="flex mt-8">
                        {step > 0 && (
                          <div className="flex-1">
                            <CustomButton
                              type="button"
                              variant="outline"
                              onClick={() => setStep(step - 1)}
                            >
                              Back
                            </CustomButton>
                          </div>
                        )}
                        <div className="flex-1 flex justify-end">
                          {step < stepSchemas.length - 1 && (
                            <CustomButton
                              type="submit"
                              variant="primary"
                              disabled={formik.isSubmitting || !formik.isValid}
                            >
                              Next
                            </CustomButton>
                          )}
                          {step === stepSchemas.length - 1 && (
                            <CustomButton
                              type="submit"
                              variant="primary"
                              loading={loading}
                              disabled={!formik.isValid || formik.isValidating || loading}
                            >
                              {title.includes('customer') ? 'Add Customer' : title.includes('contract') ? 'Create Contract' : 'Submit'}
                            </CustomButton>
                          )}
                        </div>
                      </div>
                    </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
