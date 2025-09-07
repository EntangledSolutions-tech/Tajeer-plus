'use client';
import React from 'react';
import VehicleDocuments from '../VehicleDetails/VehicleDocuments';

export default function TestVehicleDocuments() {
  const vehicleId = 'e9d224df-c429-422e-9794-4dcde4e308dd';

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Vehicle Documents</h1>
      <p className="mb-4">Vehicle ID: {vehicleId}</p>
      <VehicleDocuments vehicleId={vehicleId} />
    </div>
  );
}