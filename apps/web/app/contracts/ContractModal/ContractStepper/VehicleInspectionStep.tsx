import React from 'react';
import { useFormikContext } from 'formik';

interface Inspector {
  id: string;
  name: string;
}

export default function VehicleInspectionStep() {
  const formik = useFormikContext<any>();

  // Mock inspectors data
  const inspectors: Inspector[] = [
    { id: '1', name: 'Omar Al-Farsi' },
    { id: '2', name: 'Layla Al-Mansoori' },
    { id: '3', name: 'Zayd Al-Hakim' },
    { id: '4', name: 'Amina Al-Jabari' },
    { id: '5', name: 'Khalid Al-Sabah' },
    { id: '6', name: 'Fatima Al-Qadi' },
    { id: '7', name: 'Rami Al-Nasser' },
    { id: '8', name: 'Sara Al-Mahdi' },
    { id: '9', name: 'Yasmin Al-Rashid' },
    { id: '10', name: 'Hassan Al-Badri' },
    { id: '11', name: 'Nadia Al-Khalil' },
    { id: '12', name: 'Samir Al-Fahim' },
    { id: '13', name: 'Maya Al-Hassan' },
    { id: '14', name: 'Tariq Al-Muhtadi' }
  ];

  const handleInspectorChange = (inspectorId: string) => {
    const inspector = inspectors.find(i => i.id === inspectorId);
    formik.setFieldValue('selectedInspector', inspectorId);
    formik.setFieldValue('inspectorName', inspector?.name || '');

    // Trigger validation to enable the next button
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Vehicle Inspection
      </h2>
      <p className="text-primary/70 mb-8">
        Assign an inspector to complete the inspection of the vehicle before passing the vehicle to the customer
      </p>

      {/* Inspector Name Section */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-primary mb-6">Inspector Name</h3>

        <div className="space-y-4">
          {inspectors.map((inspector) => (
            <div key={inspector.id} className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer w-full group">
                <input
                  type="radio"
                  name="selectedInspector"
                  value={inspector.id}
                  checked={formik.values.selectedInspector === inspector.id}
                  onChange={(e) => handleInspectorChange(e.target.value)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-primary group-hover:text-primary/80 transition-colors">
                  {inspector.name}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Validation error display */}
      {formik.touched.selectedInspector && formik.errors.selectedInspector && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{String(formik.errors.selectedInspector)}</p>
        </div>
      )}
    </>
  );
}
