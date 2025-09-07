import React, { useState, useEffect } from 'react';
import CustomButton from '../../../reusableComponents/CustomButton';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { Car, Settings, Fuel } from 'lucide-react';

interface Vehicle {
  id: string;
  plate_number: string;
  serial_number: string;
  make: string;
  model: string;
  year: string;
  color: string;
  mileage: number;
  status: string;
  branch: string;
}

export default function VehicleSelectionStep() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Mock vehicles data
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      plate_number: 'Z27846',
      serial_number: '343525315',
      make: 'Hyundai',
      model: 'Accent',
      year: '2022',
      color: 'Black',
      mileage: 28914,
      status: 'Available',
      branch: 'Riyadh'
    },
    {
      id: '2',
      plate_number: 'B67890',
      serial_number: '343525316',
      make: 'Toyota',
      model: 'Camry',
      year: '2023',
      color: 'White',
      mileage: 15000,
      status: 'Available',
      branch: 'Jeddah'
    },
    {
      id: '3',
      plate_number: 'C23456',
      serial_number: '343525317',
      make: 'Honda',
      model: 'Civic',
      year: '2022',
      color: 'Silver',
      mileage: 22000,
      status: 'Rented',
      branch: 'Riyadh'
    },
    {
      id: '4',
      plate_number: 'D78901',
      serial_number: '343525318',
      make: 'Nissan',
      model: 'Altima',
      year: '2021',
      color: 'Blue',
      mileage: 35000,
      status: 'Available',
      branch: 'Dammam'
    }
  ];

  useEffect(() => {
    setVehicles(mockVehicles);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.status === 'Available' && (
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.serial_number.includes(searchTerm)
    )
  );

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-[#0065F2] mb-8">
        Vehicle Selection
      </h2>
      <p className="text-[#0065F2]/70 mb-8">
        Search and select an available vehicle for this contract.
      </p>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by plate number, make, model, or serial number"
          width="w-full"
          variant="white-bg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0065F2] mb-4">Available Vehicles</h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-8 text-[#A0B6D9]">
                <Car className="w-12 h-12 mx-auto mb-4 text-[#A0B6D9]" />
                <p>No available vehicles found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-[#0065F2] bg-[#F6F9FF]'
                      : 'border-[#CDE2FF] bg-white hover:border-[#0065F2]/50'
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#0065F2]">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-sm text-[#0065F2]/70 mt-1">
                        Plate: {vehicle.plate_number} | Year: {vehicle.year}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[#0065F2]/70">
                        <div className="flex items-center gap-1">
                          <Settings className="w-3 h-3" />
                          {vehicle.serial_number}
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" />
                          {vehicle.mileage.toLocaleString()} km
                        </div>
                      </div>
                      <p className="text-sm text-[#0065F2]/70 mt-1">
                        Color: {vehicle.color} | Branch: {vehicle.branch}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {vehicle.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Vehicle Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0065F2] mb-4">Selected Vehicle</h3>
          {selectedVehicle ? (
            <div className="border-2 border-[#0065F2] bg-[#F6F9FF] rounded-lg p-6">
              <h4 className="text-xl font-bold text-[#0065F2] mb-4">
                {selectedVehicle.make} {selectedVehicle.model}
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#0065F2]">Plate Number</label>
                    <p className="text-[#0065F2]/80">{selectedVehicle.plate_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0065F2]">Year</label>
                    <p className="text-[#0065F2]/80">{selectedVehicle.year}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#0065F2]">Color</label>
                    <p className="text-[#0065F2]/80">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0065F2]">Mileage</label>
                    <p className="text-[#0065F2]/80">{selectedVehicle.mileage.toLocaleString()} km</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Serial Number</label>
                  <p className="text-[#0065F2]/80">{selectedVehicle.serial_number}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Branch</label>
                  <p className="text-[#0065F2]/80">{selectedVehicle.branch}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Status</label>
                  <p className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {selectedVehicle.status}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVehicle(null)}
                >
                  Change Vehicle
                </CustomButton>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#CDE2FF] bg-gray-50 rounded-lg p-6 text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-[#A0B6D9]" />
              <h4 className="text-lg font-medium text-[#0065F2] mb-2">No Vehicle Selected</h4>
              <p className="text-[#0065F2]/70">Select a vehicle from the list to continue</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden input to store selected vehicle ID for form validation */}
      <input
        type="hidden"
        name="vehicleId"
        value={selectedVehicle?.id || ''}
      />

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-[#0065F2] mb-2">Vehicle Selection</h4>
        <ul className="text-xs text-[#0065F2]/70 space-y-1">
          <li>• Only available vehicles are shown in the list</li>
          <li>• Vehicle status will be updated to "Rented" when contract is created</li>
          <li>• You can search by plate number, make, model, or serial number</li>
        </ul>
      </div>
    </>
  );
}
