// Business category and type constants for merchant registration

export const BUSINESS_CATEGORIES = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Electronics',
  'Home & Living',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Automotive',
  'Services',
  'Grocery & Convenience',
  'Pharmacy & Healthcare',
  'Pet Supplies',
  'Jewelry & Accessories',
  'Arts & Crafts',
  'Office Supplies',
  'Baby & Kids',
  'Flowers & Gifts',
  'Others'
];

export const BUSINESS_TYPES = [
  'Retail Store',
  'Restaurant',
  'Cafe',
  'Food Cart',
  'Bakery',
  'Grocery Store',
  'Convenience Store',
  'Pharmacy',
  'Salon & Spa',
  'Fitness Center',
  'Boutique',
  'Hardware Store',
  'Repair Shop',
  'Service Provider',
  'Online Store',
  'Others'
];

export const BUSINESS_REGISTRATION_TYPES = [
  { value: 'UNREGISTERED', label: 'Unregistered' },
  { value: 'REGISTERED_NON_VAT', label: 'Registered (NON-VAT)' },
  { value: 'REGISTERED_VAT', label: 'Registered (VAT Included)' }
];

export const REQUIRED_DOCUMENTS = {
  UNREGISTERED: [
    { key: 'selfie_with_id', label: 'Selfie holding ID', required: true },
    { key: 'valid_id', label: 'Valid ID (from camera only)', required: true }
  ],
  REGISTERED_NON_VAT: [
    { key: 'selfie_with_id', label: 'Selfie holding ID', required: true },
    { key: 'valid_id', label: 'Valid ID (from camera only)', required: true },
    { key: 'barangay_permit', label: 'Barangay Permit', required: true },
    { key: 'dti_sec_certificate', label: 'DTI Certificate or SEC Certificate', required: true },
    { key: 'bir_certificate', label: 'BIR Certificate of Registration (Form 2303)', required: false },
    { key: 'mayors_permit', label: "Mayor's / Business Permit", required: false },
    { key: 'other_documents', label: 'Other Documents', required: false }
  ],
  REGISTERED_VAT: [
    { key: 'selfie_with_id', label: 'Selfie holding ID', required: true },
    { key: 'valid_id', label: 'Valid ID (from camera only)', required: true },
    { key: 'barangay_permit', label: 'Barangay Permit', required: true },
    { key: 'dti_sec_certificate', label: 'DTI Certificate or SEC Certificate', required: true },
    { key: 'bir_certificate', label: 'BIR Certificate of Registration (Form 2303)', required: true },
    { key: 'mayors_permit', label: "Mayor's / Business Permit", required: true },
    { key: 'other_documents', label: 'Other Documents', required: false }
  ]
};
