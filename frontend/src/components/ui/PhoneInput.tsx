'use client';

import React from 'react';

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
}

export default function PhoneInput({ label, value, onChange, onBlur, error, required }: PhoneInputProps) {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters except the input
    const digits = input.replace(/\D/g, '');
    
    // Take only the first 10 digits (after +63)
    const truncated = digits.slice(0, 10);
    
    // Format as: +63 ### ### ####
    let formatted = '+63';
    
    if (truncated.length > 0) {
      formatted += ' ' + truncated.slice(0, 3);
    }
    if (truncated.length > 3) {
      formatted += ' ' + truncated.slice(3, 6);
    }
    if (truncated.length > 6) {
      formatted += ' ' + truncated.slice(6, 10);
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only process if user is typing after +63
    if (inputValue.startsWith('+63')) {
      const digitsOnly = inputValue.slice(3).replace(/\D/g, '');
      const formatted = formatPhoneNumber(digitsOnly);
      onChange(formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent deleting the +63 prefix
    if ((e.key === 'Backspace' || e.key === 'Delete') && value === '+63') {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="tel"
        value={value || '+63'}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder="+63 912 123 1234"
        maxLength={17}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-orange-500'
        }`}
      />
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">Format: +63 ### ### ####</p>
    </div>
  );
}
