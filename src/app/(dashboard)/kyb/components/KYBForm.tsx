'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, MapPin, CreditCard, User, Globe, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import { IDENTITY_DOCUMENT_TYPES, MANDATORY_DOCUMENT_TYPES, OPTIONAL_DOCUMENT_TYPES } from './KYBDocumentUpload';

const BUSINESS_TYPES = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'PRIVATE_LTD', label: 'Private Limited Company' },
  { value: 'PUBLIC_LTD', label: 'Public Limited Company' },
  { value: 'LLC', label: 'Limited Liability Company (LLC)' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'CORPORATION', label: 'Corporation' },
  { value: 'COOPERATIVE', label: 'Cooperative' },
  { value: 'NGO', label: 'Non-Governmental Organization' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'SME', label: 'Small/Medium Enterprise' }
];

const STEPS = [
  { id: 1, name: 'Business Details', icon: Building2 },
  { id: 2, name: 'Registration', icon: Globe },
  { id: 3, name: 'Tax Info', icon: FileText },
  { id: 4, name: 'Addresses', icon: MapPin },
  { id: 5, name: 'Bank Details', icon: CreditCard },
  { id: 6, name: 'Contact', icon: User },
  { id: 7, name: 'Documents', icon: Upload }
];

interface CountryConfig {
  countryCode: string;
  countryName: string;
  taxIdType: string;
  taxIdExample: string;
  businessTypes: string[];
}

interface KYBFormProps {
  onSuccess?: () => void;
  existingData?: any;
}

export function KYBForm({ onSuccess, existingData }: KYBFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [selectedCountryConfig, setSelectedCountryConfig] = useState<CountryConfig | null>(null);

  const [formData, setFormData] = useState({
    // Business Details
    businessName: existingData?.businessName || '',
    businessType: existingData?.businessType || '',
    businessDescription: existingData?.businessDescription || '',
    businessEstablishedYear: existingData?.businessEstablishedYear || new Date().getFullYear(),
    businessWebsite: existingData?.businessWebsite || '',
    businessPhone: existingData?.businessPhone || '',
    // Registration
    registrationCountry: existingData?.registrationCountry || '',
    registrationRegion: existingData?.registrationRegion || '',
    registrationNumber: existingData?.registrationNumber || '',
    registrationType: existingData?.registrationType || '',
    // Tax
    taxIdType: existingData?.taxIdType || '',
    taxIdNumber: existingData?.taxIdNumber || '',
    taxIdCountry: existingData?.taxIdCountry || '',
    businessLicenseNumber: existingData?.businessLicenseNumber || '',
    industryRegistration: existingData?.industryRegistration || '',
    // Registered Address
    registeredAddress: existingData?.registeredAddress || '',
    registeredCity: existingData?.registeredCity || '',
    registeredRegion: existingData?.registeredRegion || '',
    registeredCountry: existingData?.registeredCountry || '',
    registeredPostalCode: existingData?.registeredPostalCode || '',
    // Operating Address
    operatingAddress: existingData?.operatingAddress || '',
    operatingCity: existingData?.operatingCity || '',
    operatingRegion: existingData?.operatingRegion || '',
    operatingCountry: existingData?.operatingCountry || '',
    operatingPostalCode: existingData?.operatingPostalCode || '',
    // Bank Details
    bankAccountNumber: '',
    bankRoutingCode: existingData?.bankRoutingCode || '',
    bankAccountHolderName: existingData?.bankAccountHolderName || '',
    bankName: existingData?.bankName || '',
    bankCountry: existingData?.bankCountry || '',
    // Contact
    primaryContactName: existingData?.primaryContactName || '',
    primaryContactPhone: existingData?.primaryContactPhone || '',
    primaryContactEmail: existingData?.primaryContactEmail || '',
    secondaryContactName: existingData?.secondaryContactName || '',
    secondaryContactPhone: existingData?.secondaryContactPhone || '',
    secondaryContactEmail: existingData?.secondaryContactEmail || '',
    // Language
    languagePreference: existingData?.languagePreference || 'en'
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.registrationCountry) {
      fetchCountryConfig(formData.registrationCountry);
    }
  }, [formData.registrationCountry]);

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/kyb/countries/config');
      const data = await res.json();
      setCountries(data.countries || []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchCountryConfig = async (countryCode: string) => {
    try {
      const res = await fetch(`/api/kyb/countries/config?country=${countryCode}`);
      const data = await res.json();
      setSelectedCountryConfig(data);
      if (data.taxIdType) {
        setFormData(prev => ({ ...prev, taxIdType: data.taxIdType, taxIdCountry: countryCode }));
      }
    } catch (err) {
      console.error('Failed to fetch country config:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.businessName || !formData.businessType || !formData.businessDescription) {
          setError('Please fill in all required business details');
          return false;
        }
        break;
      case 2:
        if (!formData.registrationCountry) {
          setError('Please select registration country');
          return false;
        }
        break;
      case 3:
        // Tax info is optional but recommended
        break;
      case 4:
        if (!formData.registeredAddress || !formData.registeredCity || 
            !formData.registeredRegion || !formData.registeredPostalCode) {
          setError('Please fill in all required address fields');
          return false;
        }
        break;
      case 5:
        if (!formData.bankAccountNumber || !formData.bankRoutingCode || !formData.bankName) {
          setError('Please fill in all required bank details');
          return false;
        }
        break;
      case 6:
        if (!formData.primaryContactName || !formData.primaryContactPhone || !formData.primaryContactEmail) {
          setError('Please fill in all required contact details');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 6));
      setError('');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/kyb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit KYB');
      }

      if (onSuccess) onSuccess();
      router.push('/kyb/status');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${step >= s.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block
                ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {s.name}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-1 mx-2 rounded ${step > s.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Business Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
              <select name="businessType" value={formData.businessType} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
              <textarea name="businessDescription" value={formData.businessDescription} onChange={handleChange}
                rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Established *</label>
                <input type="number" name="businessEstablishedYear" value={formData.businessEstablishedYear}
                  onChange={handleChange} min="1800" max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
              <input type="url" name="businessWebsite" value={formData.businessWebsite} onChange={handleChange}
                placeholder="https://example.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}

        {/* Step 2: Registration */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Business Registration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Country *</label>
              <select name="registrationCountry" value={formData.registrationCountry} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select country</option>
                {countries.map((c: any) => (
                  <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
              <input type="text" name="registrationRegion" value={formData.registrationRegion} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration Number</label>
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
                placeholder="Enter your business registration number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type/Authority</label>
              <input type="text" name="registrationType" value={formData.registrationType} onChange={handleChange}
                placeholder="e.g., Companies House, Secretary of State" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}

        {/* Step 3: Tax Information */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
            {selectedCountryConfig && (
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>{selectedCountryConfig.countryName}</strong> uses <strong>{selectedCountryConfig.taxIdType}</strong> for tax identification.
                  Example format: {selectedCountryConfig.taxIdExample}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Type</label>
                <input type="text" name="taxIdType" value={formData.taxIdType} onChange={handleChange}
                  placeholder="e.g., VAT, GST, EIN, ABN" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Country</label>
                <select name="taxIdCountry" value={formData.taxIdCountry} onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select country</option>
                  {countries.map((c: any) => (
                    <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Number</label>
              <input type="text" name="taxIdNumber" value={formData.taxIdNumber} onChange={handleChange}
                placeholder={selectedCountryConfig?.taxIdExample || 'Enter your tax ID number'}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business License Number</label>
              <input type="text" name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Registration</label>
              <input type="text" name="industryRegistration" value={formData.industryRegistration} onChange={handleChange}
                placeholder="Industry-specific registration if applicable" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}

        {/* Step 4: Addresses */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Business Addresses</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">Registered Address *</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <textarea name="registeredAddress" value={formData.registeredAddress} onChange={handleChange}
                    rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="registeredCity" value={formData.registeredCity} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Region *</label>
                    <input type="text" name="registeredRegion" value={formData.registeredRegion} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select name="registeredCountry" value={formData.registeredCountry || formData.registrationCountry} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select country</option>
                      {countries.map((c: any) => (
                        <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input type="text" name="registeredPostalCode" value={formData.registeredPostalCode} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">Operating Address (if different)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <textarea name="operatingAddress" value={formData.operatingAddress} onChange={handleChange}
                    rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" name="operatingCity" value={formData.operatingCity} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                    <input type="text" name="operatingRegion" value={formData.operatingRegion} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select name="operatingCountry" value={formData.operatingCountry} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select country</option>
                      {countries.map((c: any) => (
                        <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" name="operatingPostalCode" value={formData.operatingPostalCode} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Bank Details */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Bank Account Details</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                Your bank details are encrypted and stored securely. They will only be used for verified business transactions.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Country *</label>
              <select name="bankCountry" value={formData.bankCountry} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select country</option>
                {countries.map((c: any) => (
                  <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
              <input type="text" name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Routing/SWIFT/BIC Code *</label>
              <input type="text" name="bankRoutingCode" value={formData.bankRoutingCode} onChange={handleChange}
                placeholder="SWIFT, IBAN, Routing Number, etc." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
        )}

        {/* Step 6: Contact Information */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">Primary Contact *</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" name="primaryContactPhone" value={formData.primaryContactPhone} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="primaryContactEmail" value={formData.primaryContactEmail} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">Secondary Contact (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="secondaryContactName" value={formData.secondaryContactName} onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="secondaryContactPhone" value={formData.secondaryContactPhone} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="secondaryContactEmail" value={formData.secondaryContactEmail} onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select name="languagePreference" value={formData.languagePreference} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="pt">Portuguese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 7: Documents */}
        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Document Requirements:</strong><br />
                • Upload at least <strong>1-2 identity documents</strong> from the list below<br />
                • Upload <strong>all mandatory documents</strong>
              </p>
            </div>

            {/* Identity Documents */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Identity Documents <span className="text-sm text-gray-500">(Required: at least 1-2)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">Upload any of the following:</p>
              <ul className="space-y-2">
                {IDENTITY_DOCUMENT_TYPES.map(doc => (
                  <li key={doc.value} className="flex items-start gap-3 p-3 bg-white rounded border">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{doc.label}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Documents */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Mandatory Documents <span className="text-sm text-red-500">(All required)</span>
              </h3>
              <ul className="space-y-2">
                {MANDATORY_DOCUMENT_TYPES.map(doc => (
                  <li key={doc.value} className="flex items-start gap-3 p-3 bg-white rounded border">
                    <div className="w-5 h-5 rounded-full border-2 border-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{doc.label}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You can upload documents after submitting this form. 
                Documents will be reviewed by our compliance team. You&rsquo;ll be notified if additional documents are required.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <button type="button" onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
          ) : <div />}
          
          {step < 7 ? (
            <button type="button" onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Submitting...' : 'Submit KYB Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default KYBForm;
