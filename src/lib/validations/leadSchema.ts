import { z } from 'zod';

export const leadCaptureFormSchema = z.object({
  // Contact Information
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is required')
    .max(100, 'Email cannot exceed 100 characters'),
  
  fullName: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name cannot exceed 100 characters'),
  
  phoneNumber: z.string()
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Please enter a valid phone number'
    ),
  
  // Requirement Details
  category: z.enum([
    'Metals',
    'Chemicals',
    'Textiles',
    'Electronics',
    'Raw Materials',
    'Agriculture',
    'Plastics',
    'Other'
  ], {
    errorMap: () => ({ message: 'Please select a category' })
  }),
  
  productName: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  
  quantity: z.coerce
    .number()
    .positive('Quantity must be greater than 0')
    .int('Quantity must be a whole number'),
  
  unit: z.enum([
    'MT',
    'Kg',
    'Units',
    'Tons',
    'Barrels',
    'Liters',
    'Grams',
    'Pieces',
    'Boxes',
    'Pallets'
  ], {
    errorMap: () => ({ message: 'Please select a unit' })
  }),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location cannot exceed 100 characters'),
  
  timeline: z.enum([
    'ASAP (7 days)',
    '2-4 weeks',
    '1-3 months',
    '3-6 months',
    'Flexible'
  ], {
    errorMap: () => ({ message: 'Please select a timeline' })
  }),
  
  // Optional
  additionalReqs: z.string()
    .max(500, 'Additional requirements cannot exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

export type LeadCaptureFormData = z.infer<typeof leadCaptureFormSchema>;

export const CATEGORIES = [
  { value: 'Metals', label: 'Metals', icon: '🔩' },
  { value: 'Chemicals', label: 'Chemicals', icon: '🧪' },
  { value: 'Textiles', label: 'Textiles', icon: '🧵' },
  { value: 'Electronics', label: 'Electronics', icon: '💻' },
  { value: 'Raw Materials', label: 'Raw Materials', icon: '🪨' },
  { value: 'Agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'Plastics', label: 'Plastics', icon: '♻️' },
  { value: 'Other', label: 'Other', icon: '📦' },
];

export const UNITS = [
  { value: 'MT', label: 'Metric Tons (MT)' },
  { value: 'Kg', label: 'Kilograms (Kg)' },
  { value: 'Tons', label: 'Tons' },
  { value: 'Units', label: 'Units' },
  { value: 'Pieces', label: 'Pieces' },
  { value: 'Barrels', label: 'Barrels' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Grams', label: 'Grams' },
  { value: 'Boxes', label: 'Boxes' },
  { value: 'Pallets', label: 'Pallets' },
];

export const TIMELINES = [
  { value: 'ASAP (7 days)', label: 'ASAP (within 7 days)' },
  { value: '2-4 weeks', label: '2-4 weeks' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: 'Flexible', label: 'Flexible / No rush' },
];
