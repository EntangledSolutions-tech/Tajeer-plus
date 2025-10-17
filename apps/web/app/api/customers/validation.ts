import { z } from 'zod';

// Base customer schema with common fields
const baseCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  id_type: z.enum(['National ID', 'GCC Countries Citizens', 'Visitor', 'Resident ID'], {
    required_error: 'ID Type is required',
    invalid_type_error: 'Invalid ID Type',
  }),
  nationality: z.string().uuid('Invalid nationality ID'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format'),
  branch_id: z.string().uuid('Invalid branch ID'),
  documents: z.array(z.any()).optional(),
  documents_count: z.number().optional(),
});

// National ID specific fields schema
const nationalIdSchema = z.object({
  national_id_number: z.string().length(10, 'National ID must be 10 digits'),
  national_id_issue_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid National ID Issue Date',
  }),
  national_id_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid National ID Expiry Date',
  }),
  place_of_birth: z.string().min(2, 'Place of Birth must be at least 2 characters').max(100, 'Place of Birth must not exceed 100 characters'),
  father_name: z.string().min(2, 'Father Name must be at least 2 characters').max(100, 'Father Name must not exceed 100 characters'),
  mother_name: z.string().min(2, 'Mother Name must be at least 2 characters').max(100, 'Mother Name must not exceed 100 characters'),
});

// GCC Countries Citizens specific fields schema
const gccSchema = z.object({
  id_copy_number: z.string().min(1, 'ID Copy Number is required').max(50, 'ID Copy Number must not exceed 50 characters'),
  license_expiration_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid License Expiration Date',
  }),
  license_type: z.string().min(1, 'License Type is required'),
  place_of_id_issue: z.string().min(2, 'Place of ID Issue must be at least 2 characters').max(100, 'Place of ID Issue must not exceed 100 characters'),
});

// Visitor specific fields schema
const visitorSchema = z.object({
  border_number: z.string().min(1, 'Border Number is required').max(50, 'Border Number must not exceed 50 characters'),
  passport_number: z.string().min(1, 'Passport Number is required').max(50, 'Passport Number must not exceed 50 characters'),
  license_number: z.string().min(1, 'License Number is required').max(50, 'License Number must not exceed 50 characters'),
  id_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid ID Expiry Date',
  }),
  license_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid License Expiry Date',
  }),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must not exceed 500 characters'),
  rental_type: z.string().min(2, 'Rental Type must be at least 2 characters').max(100, 'Rental Type must not exceed 100 characters'),
  has_additional_driver: z.string().optional(),
});

// Dynamic validation function
export function validateCustomerData(data: any) {
  // First validate the base schema
  const baseValidation = baseCustomerSchema.safeParse(data);

  if (!baseValidation.success) {
    return {
      success: false,
      errors: baseValidation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Then validate based on ID type
  let specificValidation;
  
  switch (data.id_type) {
    case 'National ID':
      specificValidation = nationalIdSchema.safeParse(data);
      break;
    case 'GCC Countries Citizens':
      specificValidation = gccSchema.safeParse(data);
      break;
    case 'Visitor':
      specificValidation = visitorSchema.safeParse(data);
      break;
    case 'Resident ID':
      // Resident ID only requires base fields
      return { success: true, data: baseValidation.data };
    default:
      // If ID type is not recognized, just return base validation success
      return { success: true, data: baseValidation.data };
  }

  if (!specificValidation.success) {
    return {
      success: false,
      errors: specificValidation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Combine both validations
  return {
    success: true,
    data: {
      ...baseValidation.data,
      ...specificValidation.data,
    },
  };
}

// Export individual schemas for use in other parts of the application
export {
  baseCustomerSchema,
  nationalIdSchema,
  gccSchema,
  visitorSchema,
};

