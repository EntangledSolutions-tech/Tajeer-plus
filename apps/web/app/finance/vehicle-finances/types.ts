// Shared interfaces for vehicle finance components
export interface Vehicle {
  id: string;
  plate_number: string;
  make: {
    name: string;
  } | string; // Support both object and string formats
  model: {
    name: string;
  } | string; // Support both object and string formats
  make_year?: number;
  year?: number;
  status: {
    name: string;
    color: string;
  };
  is_active?: boolean; // Optional for compatibility
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  id_number: string;
  status: string;
}
