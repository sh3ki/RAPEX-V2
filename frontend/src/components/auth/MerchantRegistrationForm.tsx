'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Store } from 'lucide-react';
import { 
  HiShoppingCart, 
  HiCreditCard, 
  HiTruck, 
  HiShoppingBag, 
  HiCube, 
  HiChartBar, 
  HiCurrencyDollar, 
  HiTag, 
  HiLocationMarker,
  HiGift,
  HiReceiptTax,
  HiCash,
  HiLightningBolt,
  HiShieldCheck,
  HiUsers
} from 'react-icons/hi';
import { FaWallet, FaBoxOpen, FaMoneyBillWave } from 'react-icons/fa';
import Stepper from '../ui/Stepper';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import MultiSelect from '../ui/MultiSelect';
import FileUpload from '../ui/FileUpload';
import MapPicker from '../ui/MapPicker';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { merchantAPI } from '@/lib/api';
import {
  BUSINESS_CATEGORIES,
  BUSINESS_TYPES,
  BUSINESS_REGISTRATION_TYPES,
  REQUIRED_DOCUMENTS
} from '@/lib/constants';

const STEPS = [
  { number: 1, title: 'General Info', description: 'Business details' },
  { number: 2, title: 'Location', description: 'Address & coordinates' },
  { number: 3, title: 'Documents', description: 'Required files' }
];

export default function MerchantRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<number | null>(null);

  // Step 1: General Info
  const [step1Data, setStep1Data] = useState({
    business_name: '',
    owner_name: '',
    username: '',
    phone_number: '+63',
    email: '',
    business_categories: [] as string[],
    business_types: [] as string[],
    business_registration: 'UNREGISTERED'
  });

  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2: Location
  const [step2Data, setStep2Data] = useState({
    zip_code: '',
    province: '',
    city: '',
    barangay: '',
    street_name: '',
    house_number: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3: Documents
  const [step3Data, setStep3Data] = useState({
    selfie_with_id: null as File | null,
    valid_id: null as File | null,
    barangay_permit: null as File | null,
    dti_sec_certificate: null as File | null,
    bir_certificate: null as File | null,
    mayors_permit: null as File | null,
    other_documents: [] as File[]
  });

  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!step1Data.business_name.trim()) errors.business_name = 'Business name is required';
    if (!step1Data.owner_name.trim()) errors.owner_name = 'Owner name is required';
    if (!step1Data.username.trim()) errors.username = 'Username is required';
    if (step1Data.phone_number === '+63' || step1Data.phone_number.replace(/\s/g, '').length < 13) {
      errors.phone_number = 'Valid phone number is required';
    }
    if (!step1Data.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(step1Data.email)) errors.email = 'Valid email is required';
    if (!step1Data.business_registration) errors.business_registration = 'Business registration type is required';

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!step2Data.zip_code.trim()) errors.zip_code = 'Zip code is required';
    if (!step2Data.province.trim()) errors.province = 'Province is required';
    if (!step2Data.city.trim()) errors.city = 'City/Municipality is required';
    if (!step2Data.barangay.trim()) errors.barangay = 'Barangay is required';
    if (!step2Data.street_name.trim()) errors.street_name = 'Street name is required';
    if (!step2Data.house_number.trim()) errors.house_number = 'House number is required';

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    const regType = step1Data.business_registration;

    if (!step3Data.selfie_with_id) errors.selfie_with_id = 'Selfie with ID is required';
    if (!step3Data.valid_id) errors.valid_id = 'Valid ID is required';

    if (regType === 'REGISTERED_NON_VAT' || regType === 'REGISTERED_VAT') {
      if (!step3Data.barangay_permit) errors.barangay_permit = 'Barangay permit is required';
      if (!step3Data.dti_sec_certificate) errors.dti_sec_certificate = 'DTI/SEC certificate is required';
    }

    if (regType === 'REGISTERED_VAT') {
      if (!step3Data.bir_certificate) errors.bir_certificate = 'BIR certificate is required';
      if (!step3Data.mayors_permit) errors.mayors_permit = "Mayor's permit is required";
    }

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...step1Data,
        merchant_id: merchantId
      };

      const response = await merchantAPI.submitStep1(payload);

      if (response.success) {
        setMerchantId(response.data.merchant_id);
        setCurrentStep(2);
      } else {
        setError(response.message || 'Failed to save step 1');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      if (err.response?.data?.errors) {
        setStep1Errors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...step2Data,
        merchant_id: merchantId
      };

      const response = await merchantAPI.submitStep2(payload);

      if (response.success) {
        setCurrentStep(3);
      } else {
        setError(response.message || 'Failed to save step 2');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      if (err.response?.data?.errors) {
        setStep2Errors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('merchant_id', merchantId?.toString() || '');

      // Append files
      if (step3Data.selfie_with_id) formData.append('selfie_with_id', step3Data.selfie_with_id);
      if (step3Data.valid_id) formData.append('valid_id', step3Data.valid_id);
      if (step3Data.barangay_permit) formData.append('barangay_permit', step3Data.barangay_permit);
      if (step3Data.dti_sec_certificate) formData.append('dti_sec_certificate', step3Data.dti_sec_certificate);
      if (step3Data.bir_certificate) formData.append('bir_certificate', step3Data.bir_certificate);
      if (step3Data.mayors_permit) formData.append('mayors_permit', step3Data.mayors_permit);

      // Append multiple other documents
      step3Data.other_documents.forEach((file) => {
        formData.append('other_documents', file);
      });

      const response = await merchantAPI.submitStep3(formData);

      if (response.success) {
        // Show success and redirect to login
        alert('Registration completed! Check your email for login credentials.');
        router.push('/merchant/login');
      } else {
        setError(response.message || 'Failed to complete registration');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      if (err.response?.data?.errors) {
        setStep3Errors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) handleStep1Submit();
    else if (currentStep === 2) handleStep2Submit();
    else if (currentStep === 3) handleStep3Submit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const getRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS[step1Data.business_registration as keyof typeof REQUIRED_DOCUMENTS] || [];
  };

  const backgroundIconWrapperClass =
    'absolute flex items-center justify-center pointer-events-none select-none w-[60px] h-[60px] md:w-[84px] md:h-[84px]'
  const backgroundIconClass = 'w-5 h-5 md:w-7 md:h-7'

  const backgroundIcons: Array<{
    key: string
    IconComponent: React.ComponentType<{ className?: string }>
    top: string
    left: string
    color: string
    opacity: number
    rotate?: number
  }> = [
    // Row 1 (top)
    { key: 'r1-1', IconComponent: HiShoppingCart, top: '0%', left: '0%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
    { key: 'r1-2', IconComponent: HiTruck, top: '0%', left: '8%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r1-3', IconComponent: HiCreditCard, top: '0%', left: '16%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
    { key: 'r1-4', IconComponent: HiShoppingBag, top: '0%', left: '24%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
    { key: 'r1-5', IconComponent: FaWallet, top: '0%', left: '32%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
    { key: 'r1-6', IconComponent: HiCube, top: '0%', left: '40%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
    { key: 'r1-7', IconComponent: FaMoneyBillWave, top: '0%', left: '48%', color: 'text-gray-700', opacity: 0.22, rotate: -6 },
    { key: 'r1-8', IconComponent: HiCash, top: '0%', left: '56%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
    { key: 'r1-9', IconComponent: FaBoxOpen, top: '0%', left: '64%', color: 'text-gray-800', opacity: 0.22, rotate: -14 },
    { key: 'r1-10', IconComponent: HiTag, top: '0%', left: '72%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
    { key: 'r1-11', IconComponent: HiGift, top: '0%', left: '80%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
    { key: 'r1-12', IconComponent: HiReceiptTax, top: '0%', left: '88%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r1-13', IconComponent: HiCurrencyDollar, top: '0%', left: '96%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

    // Row 2
    { key: 'r2-1', IconComponent: HiCube, top: '8%', left: '4%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
    { key: 'r2-2', IconComponent: HiShoppingBag, top: '8%', left: '12%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },
    { key: 'r2-3', IconComponent: HiTruck, top: '8%', left: '20%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
    { key: 'r2-4', IconComponent: FaWallet, top: '8%', left: '28%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
    { key: 'r2-5', IconComponent: HiCash, top: '8%', left: '36%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
    { key: 'r2-6', IconComponent: HiShoppingCart, top: '8%', left: '44%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
    { key: 'r2-7', IconComponent: HiCreditCard, top: '8%', left: '52%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
    { key: 'r2-8', IconComponent: FaBoxOpen, top: '8%', left: '60%', color: 'text-gray-800', opacity: 0.22, rotate: -14 },
    { key: 'r2-9', IconComponent: HiTag, top: '8%', left: '68%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
    { key: 'r2-10', IconComponent: FaMoneyBillWave, top: '8%', left: '76%', color: 'text-gray-600', opacity: 0.22, rotate: -6 },
    { key: 'r2-11', IconComponent: HiCurrencyDollar, top: '8%', left: '84%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
    { key: 'r2-12', IconComponent: HiGift, top: '8%', left: '92%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

    // Row 3
    { key: 'r3-1', IconComponent: HiTag, top: '16%', left: '0%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
    { key: 'r3-2', IconComponent: HiCreditCard, top: '16%', left: '8%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
    { key: 'r3-3', IconComponent: HiCash, top: '16%', left: '16%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
    { key: 'r3-4', IconComponent: HiCube, top: '16%', left: '24%', color: 'text-gray-800', opacity: 0.20, rotate: -14 },
    { key: 'r3-5', IconComponent: HiShoppingCart, top: '16%', left: '32%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
    { key: 'r3-6', IconComponent: FaWallet, top: '16%', left: '40%', color: 'text-gray-600', opacity: 0.20, rotate: -10 },
    { key: 'r3-7', IconComponent: HiTruck, top: '16%', left: '48%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },
    { key: 'r3-8', IconComponent: HiShoppingBag, top: '16%', left: '56%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
    { key: 'r3-9', IconComponent: FaMoneyBillWave, top: '16%', left: '64%', color: 'text-gray-600', opacity: 0.22, rotate: 14 },
    { key: 'r3-10', IconComponent: HiReceiptTax, top: '16%', left: '72%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
    { key: 'r3-11', IconComponent: FaBoxOpen, top: '16%', left: '80%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
    { key: 'r3-12', IconComponent: HiCurrencyDollar, top: '16%', left: '88%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
    { key: 'r3-13', IconComponent: HiGift, top: '16%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },

    // Rows 4-13 (continuing the pattern)
    { key: 'r4-1', IconComponent: HiShoppingBag, top: '24%', left: '4%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
    { key: 'r4-2', IconComponent: HiCube, top: '24%', left: '12%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
    { key: 'r4-3', IconComponent: FaWallet, top: '24%', left: '20%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r4-4', IconComponent: HiTruck, top: '24%', left: '28%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
    { key: 'r4-5', IconComponent: HiTag, top: '24%', left: '36%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r4-6', IconComponent: HiCash, top: '24%', left: '44%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
    { key: 'r4-7', IconComponent: HiCreditCard, top: '24%', left: '52%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
    { key: 'r4-8', IconComponent: FaMoneyBillWave, top: '24%', left: '60%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
    { key: 'r4-9', IconComponent: HiShoppingCart, top: '24%', left: '68%', color: 'text-gray-800', opacity: 0.20, rotate: 14 },
    { key: 'r4-10', IconComponent: HiGift, top: '24%', left: '76%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
    { key: 'r4-11', IconComponent: FaBoxOpen, top: '24%', left: '84%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
    { key: 'r4-12', IconComponent: HiReceiptTax, top: '24%', left: '92%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },

    // More rows to fill the background
    { key: 'r5-1', IconComponent: HiCash, top: '32%', left: '0%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
    { key: 'r5-2', IconComponent: HiShoppingCart, top: '32%', left: '8%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
    { key: 'r5-3', IconComponent: HiTruck, top: '32%', left: '16%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
    { key: 'r5-4', IconComponent: FaBoxOpen, top: '32%', left: '24%', color: 'text-gray-600', opacity: 0.20, rotate: -14 },
    { key: 'r5-5', IconComponent: HiCreditCard, top: '32%', left: '32%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
    { key: 'r5-6', IconComponent: HiCube, top: '32%', left: '40%', color: 'text-gray-700', opacity: 0.20, rotate: -10 },
    { key: 'r5-7', IconComponent: FaWallet, top: '32%', left: '48%', color: 'text-gray-600', opacity: 0.22, rotate: 8 },
    { key: 'r5-8', IconComponent: HiTag, top: '32%', left: '56%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
    { key: 'r5-9', IconComponent: HiShoppingBag, top: '32%', left: '64%', color: 'text-gray-700', opacity: 0.22, rotate: 14 },
    { key: 'r5-10', IconComponent: HiCurrencyDollar, top: '32%', left: '72%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
    { key: 'r5-11', IconComponent: FaMoneyBillWave, top: '32%', left: '80%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
    { key: 'r5-12', IconComponent: HiGift, top: '32%', left: '88%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
    { key: 'r5-13', IconComponent: HiReceiptTax, top: '32%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },

    // Additional rows for more coverage
    { key: 'r6-1', IconComponent: HiCube, top: '40%', left: '4%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
    { key: 'r6-2', IconComponent: FaWallet, top: '40%', left: '12%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },
    { key: 'r6-3', IconComponent: HiShoppingBag, top: '40%', left: '20%', color: 'text-gray-600', opacity: 0.20, rotate: 14 },
    { key: 'r6-4', IconComponent: HiTag, top: '40%', left: '28%', color: 'text-gray-800', opacity: 0.22, rotate: -12 },
    { key: 'r6-5', IconComponent: HiCash, top: '40%', left: '36%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
    { key: 'r6-6', IconComponent: HiTruck, top: '40%', left: '44%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
    { key: 'r6-7', IconComponent: HiShoppingCart, top: '40%', left: '52%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r6-8', IconComponent: HiReceiptTax, top: '40%', left: '60%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
    { key: 'r6-9', IconComponent: HiCreditCard, top: '40%', left: '68%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r6-10', IconComponent: FaBoxOpen, top: '40%', left: '76%', color: 'text-gray-800', opacity: 0.22, rotate: -6 },
    { key: 'r6-11', IconComponent: FaMoneyBillWave, top: '40%', left: '84%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
    { key: 'r6-12', IconComponent: HiCurrencyDollar, top: '40%', left: '92%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },

    // Continue pattern to bottom
    { key: 'r7-1', IconComponent: HiTruck, top: '48%', left: '0%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
    { key: 'r7-2', IconComponent: HiShoppingCart, top: '48%', left: '8%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
    { key: 'r7-3', IconComponent: FaMoneyBillWave, top: '48%', left: '16%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
    { key: 'r7-4', IconComponent: HiCreditCard, top: '48%', left: '24%', color: 'text-gray-700', opacity: 0.20, rotate: -14 },
    { key: 'r7-5', IconComponent: HiCube, top: '48%', left: '32%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
    { key: 'r7-6', IconComponent: HiShoppingBag, top: '48%', left: '40%', color: 'text-gray-800', opacity: 0.20, rotate: -10 },
    { key: 'r7-7', IconComponent: HiCash, top: '48%', left: '48%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },
    { key: 'r7-8', IconComponent: FaWallet, top: '48%', left: '56%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
    { key: 'r7-9', IconComponent: HiTag, top: '48%', left: '64%', color: 'text-gray-800', opacity: 0.22, rotate: 14 },
    { key: 'r7-10', IconComponent: HiGift, top: '48%', left: '72%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
    { key: 'r7-11', IconComponent: FaBoxOpen, top: '48%', left: '80%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
    { key: 'r7-12', IconComponent: HiReceiptTax, top: '48%', left: '88%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
    { key: 'r7-13', IconComponent: HiCurrencyDollar, top: '48%', left: '96%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },

    // Bottom rows
    { key: 'r8-1', IconComponent: HiShoppingBag, top: '56%', left: '4%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r8-2', IconComponent: HiCube, top: '56%', left: '12%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
    { key: 'r8-3', IconComponent: HiCash, top: '56%', left: '20%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
    { key: 'r8-4', IconComponent: FaWallet, top: '56%', left: '28%', color: 'text-gray-600', opacity: 0.22, rotate: -14 },
    { key: 'r8-5', IconComponent: HiTruck, top: '56%', left: '36%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
    { key: 'r8-6', IconComponent: HiTag, top: '56%', left: '44%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
    { key: 'r8-7', IconComponent: HiCreditCard, top: '56%', left: '52%', color: 'text-gray-600', opacity: 0.20, rotate: 12 },
    { key: 'r8-8', IconComponent: HiShoppingCart, top: '56%', left: '60%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },
    { key: 'r8-9', IconComponent: FaMoneyBillWave, top: '56%', left: '68%', color: 'text-gray-700', opacity: 0.20, rotate: 14 },
    { key: 'r8-10', IconComponent: HiCurrencyDollar, top: '56%', left: '76%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
    { key: 'r8-11', IconComponent: HiReceiptTax, top: '56%', left: '84%', color: 'text-gray-800', opacity: 0.20, rotate: 8 },
    { key: 'r8-12', IconComponent: FaBoxOpen, top: '56%', left: '92%', color: 'text-gray-700', opacity: 0.22, rotate: -10 },

    // More bottom coverage
    { key: 'r9-1', IconComponent: HiCreditCard, top: '64%', left: '0%', color: 'text-gray-800', opacity: 0.22, rotate: 12 },
    { key: 'r9-2', IconComponent: HiTag, top: '64%', left: '8%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
    { key: 'r9-3', IconComponent: HiCube, top: '64%', left: '16%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
    { key: 'r9-4', IconComponent: HiShoppingCart, top: '64%', left: '24%', color: 'text-gray-800', opacity: 0.20, rotate: -14 },
    { key: 'r9-5', IconComponent: FaWallet, top: '64%', left: '32%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
    { key: 'r9-6', IconComponent: HiCash, top: '64%', left: '40%', color: 'text-gray-600', opacity: 0.20, rotate: -10 },
    { key: 'r9-7', IconComponent: HiTruck, top: '64%', left: '48%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },
    { key: 'r9-8', IconComponent: HiShoppingBag, top: '64%', left: '56%', color: 'text-gray-700', opacity: 0.20, rotate: -12 },
    { key: 'r9-9', IconComponent: HiGift, top: '64%', left: '64%', color: 'text-gray-600', opacity: 0.22, rotate: 14 },
    { key: 'r9-10', IconComponent: FaBoxOpen, top: '64%', left: '72%', color: 'text-gray-800', opacity: 0.20, rotate: -8 },
    { key: 'r9-11', IconComponent: FaMoneyBillWave, top: '64%', left: '80%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
    { key: 'r9-12', IconComponent: HiReceiptTax, top: '64%', left: '88%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
    { key: 'r9-13', IconComponent: HiCurrencyDollar, top: '64%', left: '96%', color: 'text-gray-800', opacity: 0.22, rotate: 8 },

    // Bottom section
    { key: 'r10-1', IconComponent: FaBoxOpen, top: '72%', left: '4%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
    { key: 'r10-2', IconComponent: HiShoppingBag, top: '72%', left: '12%', color: 'text-gray-600', opacity: 0.22, rotate: -8 },
    { key: 'r10-3', IconComponent: HiTruck, top: '72%', left: '20%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r10-4', IconComponent: HiCash, top: '72%', left: '28%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
    { key: 'r10-5', IconComponent: HiCreditCard, top: '72%', left: '36%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r10-6', IconComponent: HiCube, top: '72%', left: '44%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
    { key: 'r10-7', IconComponent: FaWallet, top: '72%', left: '52%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
    { key: 'r10-8', IconComponent: HiTag, top: '72%', left: '60%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
    { key: 'r10-9', IconComponent: HiShoppingCart, top: '72%', left: '68%', color: 'text-gray-800', opacity: 0.20, rotate: 14 },
    { key: 'r10-10', IconComponent: FaMoneyBillWave, top: '72%', left: '76%', color: 'text-gray-700', opacity: 0.22, rotate: -12 },
    { key: 'r10-11', IconComponent: HiCurrencyDollar, top: '72%', left: '84%', color: 'text-gray-600', opacity: 0.20, rotate: 8 },
    { key: 'r10-12', IconComponent: HiGift, top: '72%', left: '92%', color: 'text-gray-800', opacity: 0.22, rotate: -10 },

    // Final rows extending to bottom
    { key: 'r11-1', IconComponent: HiShoppingCart, top: '80%', left: '0%', color: 'text-gray-700', opacity: 0.22, rotate: 12 },
    { key: 'r11-2', IconComponent: HiCube, top: '80%', left: '8%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
    { key: 'r11-3', IconComponent: HiTruck, top: '80%', left: '16%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
    { key: 'r11-4', IconComponent: FaWallet, top: '80%', left: '24%', color: 'text-gray-700', opacity: 0.20, rotate: -14 },
    { key: 'r11-5', IconComponent: HiShoppingBag, top: '80%', left: '32%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
    { key: 'r11-6', IconComponent: HiCash, top: '80%', left: '40%', color: 'text-gray-800', opacity: 0.20, rotate: -10 },
    { key: 'r11-7', IconComponent: HiTag, top: '80%', left: '48%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },
    { key: 'r11-8', IconComponent: HiCreditCard, top: '80%', left: '56%', color: 'text-gray-600', opacity: 0.20, rotate: -12 },
    { key: 'r11-9', IconComponent: FaBoxOpen, top: '80%', left: '64%', color: 'text-gray-800', opacity: 0.22, rotate: 14 },
    { key: 'r11-10', IconComponent: HiReceiptTax, top: '80%', left: '72%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
    { key: 'r11-11', IconComponent: FaMoneyBillWave, top: '80%', left: '80%', color: 'text-gray-600', opacity: 0.22, rotate: 10 },
    { key: 'r11-12', IconComponent: HiCurrencyDollar, top: '80%', left: '88%', color: 'text-gray-800', opacity: 0.20, rotate: -12 },
    { key: 'r11-13', IconComponent: HiGift, top: '80%', left: '96%', color: 'text-gray-700', opacity: 0.22, rotate: 8 },

    // Very bottom
    { key: 'r12-1', IconComponent: HiCash, top: '88%', left: '4%', color: 'text-gray-800', opacity: 0.22, rotate: 10 },
    { key: 'r12-2', IconComponent: HiCube, top: '88%', left: '12%', color: 'text-gray-700', opacity: 0.20, rotate: -8 },
    { key: 'r12-3', IconComponent: HiTruck, top: '88%', left: '20%', color: 'text-gray-600', opacity: 0.22, rotate: 12 },
    { key: 'r12-4', IconComponent: HiShoppingBag, top: '88%', left: '28%', color: 'text-gray-800', opacity: 0.20, rotate: -14 },
    { key: 'r12-5', IconComponent: FaWallet, top: '88%', left: '36%', color: 'text-gray-700', opacity: 0.22, rotate: 10 },
    { key: 'r12-6', IconComponent: HiCreditCard, top: '88%', left: '44%', color: 'text-gray-600', opacity: 0.20, rotate: -8 },
    { key: 'r12-7', IconComponent: FaWallet, top: '88%', left: '52%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r12-8', IconComponent: HiShoppingCart, top: '88%', left: '60%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
    { key: 'r12-9', IconComponent: HiTag, top: '88%', left: '68%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r12-10', IconComponent: HiGift, top: '88%', left: '76%', color: 'text-gray-800', opacity: 0.22, rotate: -6 },
    { key: 'r12-11', IconComponent: FaMoneyBillWave, top: '88%', left: '84%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
    { key: 'r12-12', IconComponent: HiReceiptTax, top: '88%', left: '92%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },

    // Absolute bottom extending beyond
    { key: 'r13-1', IconComponent: HiCurrencyDollar, top: '96%', left: '0%', color: 'text-gray-700', opacity: 0.20, rotate: 12 },
    { key: 'r13-2', IconComponent: HiCube, top: '96%', left: '8%', color: 'text-gray-800', opacity: 0.22, rotate: -8 },
    { key: 'r13-3', IconComponent: HiShoppingCart, top: '96%', left: '16%', color: 'text-gray-600', opacity: 0.20, rotate: 10 },
    { key: 'r13-4', IconComponent: FaWallet, top: '96%', left: '24%', color: 'text-gray-700', opacity: 0.22, rotate: -14 },
    { key: 'r13-5', IconComponent: HiTruck, top: '96%', left: '32%', color: 'text-gray-800', opacity: 0.20, rotate: 12 },
    { key: 'r13-6', IconComponent: HiTag, top: '96%', left: '40%', color: 'text-gray-600', opacity: 0.22, rotate: -10 },
    { key: 'r13-7', IconComponent: HiShoppingBag, top: '96%', left: '48%', color: 'text-gray-700', opacity: 0.20, rotate: 8 },
    { key: 'r13-8', IconComponent: HiCreditCard, top: '96%', left: '56%', color: 'text-gray-800', opacity: 0.22, rotate: -12 },
    { key: 'r13-9', IconComponent: FaBoxOpen, top: '96%', left: '64%', color: 'text-gray-600', opacity: 0.20, rotate: 14 },
    { key: 'r13-10', IconComponent: HiCash, top: '96%', left: '72%', color: 'text-gray-700', opacity: 0.22, rotate: -8 },
    { key: 'r13-11', IconComponent: HiReceiptTax, top: '96%', left: '80%', color: 'text-gray-800', opacity: 0.20, rotate: 10 },
    { key: 'r13-12', IconComponent: FaMoneyBillWave, top: '96%', left: '88%', color: 'text-gray-600', opacity: 0.22, rotate: -12 },
    { key: 'r13-13', IconComponent: HiGift, top: '96%', left: '96%', color: 'text-gray-700', opacity: 0.20, rotate: 10 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Loading Overlay */}
      {loading && <LoadingSpinner fullScreen />}
      
      {/* Abstract Background Pattern - Same as login */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large geometric shapes scattered everywhere */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-3xl transform -rotate-45 -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-3xl transform rotate-45 translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/8 rounded-3xl transform rotate-12"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white/8 rounded-3xl transform -rotate-12"></div>
        <div className="absolute top-10 -left-32 w-72 h-72 bg-white/9 rounded-3xl transform rotate-25"></div>
        <div className="absolute bottom-10 -right-32 w-72 h-72 bg-white/9 rounded-3xl transform -rotate-25"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/7 rounded-3xl transform rotate-60"></div>
        <div className="absolute bottom-1/3 right-1/4 w-68 h-68 bg-white/8 rounded-3xl transform -rotate-50"></div>
        
        {/* Medium rectangles scattered throughout */}
        <div className="absolute top-20 left-5 w-40 h-40 bg-white/8 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-32 right-5 w-40 h-40 bg-white/8 rounded-xl transform -rotate-45"></div>
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-white/7 rounded-2xl transform rotate-30"></div>
        <div className="absolute bottom-1/3 -right-16 w-52 h-52 bg-white/7 rounded-2xl transform -rotate-30"></div>
        <div className="absolute top-10 right-10 w-44 h-44 bg-white/7 rounded-2xl transform rotate-15"></div>
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-white/7 rounded-2xl transform -rotate-25"></div>
        
        {/* Small rectangles everywhere */}
        <div className="absolute top-1/2 left-5 w-24 h-24 bg-white/8 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-1/3 right-5 w-24 h-24 bg-white/8 rounded-lg transform -rotate-12"></div>
        <div className="absolute top-1/3 -left-10 w-28 h-28 bg-white/7 rounded-xl transform rotate-45"></div>
        <div className="absolute bottom-1/4 left-8 w-32 h-32 bg-white/7 rounded-xl transform -rotate-20"></div>
        <div className="absolute top-3/4 right-8 w-36 h-36 bg-white/8 rounded-xl transform rotate-35"></div>
        <div className="absolute bottom-2/3 left-16 w-20 h-20 bg-white/8 rounded-lg transform -rotate-15"></div>
        <div className="absolute top-1/4 right-12 w-32 h-32 bg-white/7 rounded-xl transform rotate-20"></div>
        <div className="absolute bottom-1/2 left-12 w-28 h-28 bg-white/8 rounded-lg transform -rotate-40"></div>
        
        {/* E-commerce Icons - densely scattered with gray colors covering all areas */}
        {backgroundIcons.map(({ key, IconComponent, top, left, color, opacity, rotate }) => (
          <div
            key={key}
            className={backgroundIconWrapperClass}
            style={{
              top,
              left,
            }}
          >
            <IconComponent
              className={`${backgroundIconClass} ${color}`}
              style={{
                opacity,
                transform: rotate ? `rotate(${rotate}deg)` : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-orange-500 to-purple-600 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-8 h-8" />
            <h1 className="text-xl sm:text-2xl font-bold">Merchant Registration</h1>
          </div>
          <p className="text-purple-100">Join RAPEX and start selling today</p>
        </div>

        {/* Stepper */}
        <div className="px-6 sm:px-8">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="px-6 sm:px-8 pb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: General Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Business Name"
                  value={step1Data.business_name}
                  onChange={(e) => setStep1Data({ ...step1Data, business_name: e.target.value })}
                  error={step1Errors.business_name}
                  required
                />

                <Input
                  label="Owner Name"
                  value={step1Data.owner_name}
                  onChange={(e) => setStep1Data({ ...step1Data, owner_name: e.target.value })}
                  error={step1Errors.owner_name}
                  required
                />

                <Input
                  label="Username"
                  value={step1Data.username}
                  onChange={(e) => setStep1Data({ ...step1Data, username: e.target.value })}
                  error={step1Errors.username}
                  required
                />

                <PhoneInput
                  label="Phone Number"
                  value={step1Data.phone_number}
                  onChange={(value) => setStep1Data({ ...step1Data, phone_number: value })}
                  error={step1Errors.phone_number}
                  required
                />

                <div className="md:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={step1Data.email}
                    onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                    error={step1Errors.email}
                    required
                  />
                </div>

                <MultiSelect
                  label="Business Category"
                  options={BUSINESS_CATEGORIES}
                  selected={step1Data.business_categories}
                  onChange={(selected) => setStep1Data({ ...step1Data, business_categories: selected })}
                />

                <MultiSelect
                  label="Business Type"
                  options={BUSINESS_TYPES}
                  selected={step1Data.business_types}
                  onChange={(selected) => setStep1Data({ ...step1Data, business_types: selected })}
                />

                <div className="md:col-span-2">
                  <Dropdown
                    label="Business Registration"
                    options={BUSINESS_REGISTRATION_TYPES}
                    value={step1Data.business_registration}
                    onChange={(value) => setStep1Data({ ...step1Data, business_registration: value })}
                    error={step1Errors.business_registration}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Zip Code"
                  value={step2Data.zip_code}
                  onChange={(e) => setStep2Data({ ...step2Data, zip_code: e.target.value })}
                  error={step2Errors.zip_code}
                  required
                />

                <Input
                  label="Province"
                  value={step2Data.province}
                  onChange={(e) => setStep2Data({ ...step2Data, province: e.target.value })}
                  error={step2Errors.province}
                  required
                />

                <Input
                  label="City/Municipality"
                  value={step2Data.city}
                  onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                  error={step2Errors.city}
                  required
                />

                <Input
                  label="Barangay"
                  value={step2Data.barangay}
                  onChange={(e) => setStep2Data({ ...step2Data, barangay: e.target.value })}
                  error={step2Errors.barangay}
                  required
                />

                <Input
                  label="Street Name"
                  value={step2Data.street_name}
                  onChange={(e) => setStep2Data({ ...step2Data, street_name: e.target.value })}
                  error={step2Errors.street_name}
                  required
                />

                <Input
                  label="House Number"
                  value={step2Data.house_number}
                  onChange={(e) => setStep2Data({ ...step2Data, house_number: e.target.value })}
                  error={step2Errors.house_number}
                  required
                />

                <div className="md:col-span-2">
                  <MapPicker
                    latitude={step2Data.latitude}
                    longitude={step2Data.longitude}
                    onChange={(lat, lng) => setStep2Data({ ...step2Data, latitude: lat, longitude: lng })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
              <p className="text-sm text-gray-600">
                Registration type: <strong>{BUSINESS_REGISTRATION_TYPES.find(t => t.value === step1Data.business_registration)?.label}</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getRequiredDocuments().map((doc) => (
                  <div key={doc.key} className={doc.key === 'other_documents' ? 'md:col-span-2' : ''}>
                    <FileUpload
                      label={doc.label}
                      required={doc.required}
                      accept={doc.key.includes('id') || doc.key === 'selfie_with_id' ? 'image/*' : undefined}
                      cameraOnly={doc.key === 'selfie_with_id' || doc.key === 'valid_id'}
                      multiple={doc.key === 'other_documents'}
                      value={step3Data[doc.key as keyof typeof step3Data] as File | File[] | null}
                      onChange={(file) => {
                        if (doc.key === 'other_documents' && file) {
                          setStep3Data({ ...step3Data, other_documents: [...step3Data.other_documents, file] });
                        } else {
                          setStep3Data({ ...step3Data, [doc.key]: file });
                        }
                      }}
                      error={step3Errors[doc.key]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="secondary"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}

            {currentStep === 1 && (
              <div className="flex items-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/merchant/login" className="ml-1 text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                  Login here
                </a>
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={loading}
              className="ml-auto"
            >
              {currentStep === 3 ? 'Complete Registration' : 'Next'}
              {currentStep < 3 && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-6 text-center text-white/80 text-sm">
        © 2025 RAPEX. All rights reserved.
      </div>
    </div>
  );
}
