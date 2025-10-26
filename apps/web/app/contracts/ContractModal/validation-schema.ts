import * as Yup from 'yup';

// Step-specific validation schemas
export const customerDetailsSchema = Yup.object({
  selectedCustomerId: Yup.string().required('Please select a customer'),
});

export const vehicleDetailsSchema = Yup.object({
  selectedVehicleId: Yup.string().required('Please select a vehicle'),
  vehiclePlate: Yup.string().required('Vehicle plate number is required'),
  vehicleSerialNumber: Yup.string().required('Vehicle serial number is required'),
  vehiclePlateRegistrationType: Yup.string().required('Plate registration type is required'),
  vehicleMakeYear: Yup.string().required('Make year is required'),
  vehicleModel: Yup.string().required('Vehicle model is required'),
  vehicleMake: Yup.string().required('Vehicle make is required'),
  vehicleColor: Yup.string().required('Vehicle color is required'),
  vehicleMileage: Yup.number().min(0, 'Mileage must be positive').required('Mileage is required'),
  vehicleStatus: Yup.string().required('Vehicle status is required'),
  vehicleDailyRentRate: Yup.number().min(0, 'Daily rent rate must be positive').required('Daily rent rate is required'),
});

export const vehicleInspectionSchema = Yup.object({
  selectedInspector: Yup.string().required('Please select an inspector'),
  inspectorName: Yup.string().required('Inspector name is required'),
});

export const contractDetailsSchema = Yup.object({
  startDate: Yup.string()
    .required('Start date is required')
    .test('not-past', 'Start date cannot be in the past', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  endDate: Yup.string()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function(value) {
      const startDate = this.parent.startDate;
      if (!value || !startDate) return false;
      return new Date(value) > new Date(startDate);
    }),
  durationType: Yup.string().required('Duration type is required'),
  durationInDays: Yup.number().when('durationType', {
    is: 'duration',
    then: (schema) => schema.required('Duration in days is required').min(1, 'Duration must be at least 1 day'),
    otherwise: (schema) => schema.nullable().notRequired()
  }),
  totalFees: Yup.number().when('durationType', {
    is: 'fees',
    then: (schema) => schema.required('Total fees is required').min(0.01, 'Total fees must be greater than 0'),
    otherwise: (schema) => schema.nullable().notRequired()
  })
});

export const documentsSchema = Yup.object({
  documentsCount: Yup.number().min(0, 'Documents count must be non-negative'),
  documents: Yup.array().of(
    Yup.object({
      id: Yup.string().required(),
      name: Yup.string().required('Document name is required'),
      file: Yup.mixed().required('Document file is required'),
      uploaded: Yup.boolean().required()
    })
  ).min(0, 'At least one document is required'),
});

export const pricingTermsSchema = Yup.object({
  dailyRentalRate: Yup.string().required('Daily rental rate is required'),
  hourlyDelayRate: Yup.string().required('Hourly delay rate is required'),
  currentKm: Yup.string().required('Current km is required'),
  rentalDays: Yup.number()
    .min(1, 'Rental days must be at least 1')
    .integer('Rental days must be a whole number'),
  permittedDailyKm: Yup.string().required('Permitted daily km is required'),
  excessKmRate: Yup.string().required('Excess km rate is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
  totalAmount: Yup.number().min(0, 'Total amount must be positive').required('Total amount is required'),
  depositAmount: Yup.string()
    .required('Deposit is required')
    .test('is-number', 'Deposit must be a valid number', (value) => {
      if (!value) return false;
      const numValue = parseFloat(value.replace(/,/g, ''));
      return !isNaN(numValue);
    })
    .test('is-positive', 'Deposit must be zero or positive', (value) => {
      if (!value) return false;
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue >= 0;
    })
    .test('equals-total', 'Deposit amount must equal total amount', function(value) {
      const { totalAmount } = this.parent;
      if (!value || !totalAmount) return false;
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue === totalAmount;
    }),
});

// Comprehensive schema for final validation
export const contractValidationSchema = Yup.object({
  // Vehicle Inspection Step
  selectedInspector: Yup.string().required('Please select an inspector'),
  inspectorName: Yup.string().required('Inspector name is required'),

  // Customer Details Step
  customerType: Yup.string().oneOf(['existing', 'new']).required('Customer type is required'),
  selectedCustomerId: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Please select a customer'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerName: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Customer name is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerIdType: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('ID type is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerIdNumber: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('ID number is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerMobile: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Mobile number is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerAddress: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Address is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  customerStatus: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Customer status is required'),
    otherwise: (schema) => schema.notRequired()
  }),

  // Vehicle Details Step
  selectedVehicleId: Yup.string().required('Please select a vehicle'),
  vehiclePlate: Yup.string().required('Vehicle plate number is required'),
  vehicleSerialNumber: Yup.string().required('Vehicle serial number is required'),
  vehiclePlateRegistrationType: Yup.string().required('Plate registration type is required'),
  vehicleMakeYear: Yup.string().required('Make year is required'),
  vehicleModel: Yup.string().required('Vehicle model is required'),
  vehicleMake: Yup.string().required('Vehicle make is required'),
  vehicleColor: Yup.string().required('Vehicle color is required'),
  vehicleMileage: Yup.number().min(0, 'Mileage must be positive').required('Mileage is required'),
  vehicleStatus: Yup.string().required('Vehicle status is required'),
  vehicleDailyRentRate: Yup.number().min(0, 'Daily rent rate must be positive').required('Daily rent rate is required'),

  // Documents Step
  documentsCount: Yup.number().min(0, 'Documents count must be non-negative'),
  documents: Yup.array().of(
    Yup.object({
      id: Yup.string().required(),
      name: Yup.string().required('Document name is required'),
      file: Yup.mixed().required('Document file is required'),
      uploaded: Yup.boolean().required()
    })
  ).min(0, 'At least one document is required'),

  // Pricing Terms Step (if needed)
  contractStartDate: Yup.date().required('Contract start date is required'),
  contractEndDate: Yup.date()
    .required('Contract end date is required')
    .min(Yup.ref('contractStartDate'), 'End date must be after start date'),
  dailyRate: Yup.number().min(0, 'Daily rate must be positive').required('Daily rate is required'),
  totalAmount: Yup.number().min(0, 'Total amount must be positive').required('Total amount is required'),
});

