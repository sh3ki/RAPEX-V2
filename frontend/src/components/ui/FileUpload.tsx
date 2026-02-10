'use client';

import React, { useRef, useState } from 'react';
import { Upload as UploadIcon, X, FileText, Camera } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  required?: boolean;
  error?: string;
  onChange: (file: File | null) => void;
  cameraOnly?: boolean;
  multiple?: boolean;
  value?: File | File[] | null;
}

export default function FileUpload({
  label,
  accept,
  required,
  error,
  onChange,
  cameraOnly = false,
  multiple = false,
  value
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      onChange(null);
      setPreview(null);
      return;
    }

    const file = files[0];
    onChange(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileName = () => {
    if (value instanceof File) {
      return value.name;
    }
    return null;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
        error ? 'border-red-500' : 'border-gray-300 hover:border-orange-500'
      }`}>
        {!value ? (
          <div className="space-y-3">
            {cameraOnly ? (
              <Camera className="w-12 h-12 mx-auto text-gray-400" />
            ) : (
              <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
            )}
            
            <div>
              <button
                type="button"
                onClick={handleCameraCapture}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {cameraOnly ? 'Take Photo' : 'Choose File'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {cameraOnly ? 'Camera only' : 'or drag and drop'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-orange-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{getFileName()}</p>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={cameraOnly ? 'image/*' : accept}
        capture={cameraOnly ? 'environment' : undefined}
        onChange={handleFileChange}
        multiple={multiple}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
