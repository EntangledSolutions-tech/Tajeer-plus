import { z } from 'zod';

// Base customer schema with common fields (no name or nationality required)
const baseCustomerSchema = z.object({
  id_type: z.enum(['National ID', 'GCC Countries Citizens', 'Visitor', 'Resident ID'], {
    required_error: 'ID Type is required',
    invalid_type_error: 'Invalid ID Type',
  }),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format'),
  branch_id: z.string().uuid('Invalid branch ID'),
  documents: z.array(z.any()).optional(),
  documents_count: z.number().optional(),
});

// Visitor base schema (doesn't require name and nationality)
const visitorBaseSchema = z.object({
  id_type: z.enum(['National ID', 'GCC Countries Citizens', 'Visitor', 'Resident ID'], {
    required_error: 'ID Type is required',
    invalid_type_error: 'Invalid ID Type',
  }),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format'),
  branch_id: z.string().uuid('Invalid branch ID'),
  documents: z.array(z.any()).optional(),
  documents_count: z.number().optional(),
});

// National ID and Resident ID shared fields schema
const nationalAndResidentIdSchema = z.object({
  nationalOrResidentIdNumber: z.string()
    .min(1, 'ID Number is required')
    .max(50, 'ID Number must not exceed 50 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'ID Number cannot be empty',
    }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid Birth Date',
  }),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .refine((val) => val.trim().length >= 10, {
      message: 'Address must be at least 10 characters after trimming whitespace',
    }),
  rentalType: z.string().min(1, 'Rental Type is required'),
});

// GCC Countries Citizens base schema (doesn't require name and nationality)
const gccBaseSchema = z.object({
  id_type: z.enum(['National ID', 'GCC Countries Citizens', 'Visitor', 'Resident ID'], {
    required_error: 'ID Type is required',
    invalid_type_error: 'Invalid ID Type',
  }),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format'),
  branch_id: z.string().uuid('Invalid branch ID'),
  documents: z.array(z.any()).optional(),
  documents_count: z.number().optional(),
});

// GCC Countries Citizens specific fields schema
const gccSchema = z.object({
  nationalOrGccIdNumber: z.string()
    .min(1, 'National/GCC ID Number is required')
    .max(50, 'National/GCC ID Number must not exceed 50 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'National/GCC ID Number cannot be empty',
    }),
  country: z.string().min(2, 'Country is required').max(100, 'Country must not exceed 100 characters'),
  idCopyNumber: z.coerce.number()
    .int('ID Copy Number must be an integer')
    .positive('ID Copy Number must be a positive number'),
  licenseNumber: z.string()
    .min(1, 'License Number is required')
    .max(50, 'License Number must not exceed 50 characters')
    .regex(/^[0-9\/]+$/, 'License Number must contain only digits and /'),
  idExpiryDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid ID Expiry Date',
    })
    .refine((val) => new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'ID Expiry Date must be today or in the future',
    }),
  licenseExpiryDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid License Expiry Date',
    })
    .refine((val) => new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'License Expiry Date must be today or in the future',
    }),
  licenseType: z.string().min(1, 'License Type is required'),
  placeOfIdIssue: z.string().min(2, 'Place of ID Issue is required').max(100, 'Place of ID Issue must not exceed 100 characters'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .refine((val) => val.trim().length >= 10, {
      message: 'Address must be at least 10 characters after trimming whitespace',
    }),
  rentalType: z.string().min(1, 'Rental Type is required'),
});

// Visitor specific fields schema (updated to match screenshot requirements)
const visitorSchema = z.object({
  border_number: z.string().min(1, 'Border Number is required').max(50, 'Border Number must not exceed 50 characters'),
  passport_number: z.string().min(1, 'Passport Number is required').max(50, 'Passport Number must not exceed 50 characters'),
  license_number: z.string().min(1, 'License Number is required').max(50, 'License Number must not exceed 50 characters'),
  id_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid ID Expiry Date',
  }),
  place_of_id_issue: z.string().min(2, 'Place of ID Issue must be at least 2 characters').max(100, 'Place of ID Issue must not exceed 100 characters'),
  license_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid License Expiry Date',
  }),
  license_type: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must not exceed 500 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country must not exceed 100 characters'),
  id_copy_number: z.string().min(1, 'ID Copy Number is required').max(50, 'ID Copy Number must not exceed 50 characters'),
});

// Dynamic validation function
export function validateCustomerData(data: any) {
  // All ID types use the same base schema (no name or nationality required)
  const baseSchema = baseCustomerSchema;

  // First validate the base schema
  const baseValidation = baseSchema.safeParse(data);

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
    case 'Resident ID':
      specificValidation = nationalAndResidentIdSchema.safeParse(data);
      break;
    case 'GCC Countries Citizens':
      specificValidation = gccSchema.safeParse(data);
      break;
    case 'Visitor':
      specificValidation = visitorSchema.safeParse(data);
      break;
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
  nationalAndResidentIdSchema,
  gccBaseSchema,
  gccSchema,
  visitorBaseSchema,
  visitorSchema,
};

