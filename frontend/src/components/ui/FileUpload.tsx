'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Upload as UploadIcon, X, FileText, Camera, Check, RotateCcw } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isCameraModalOpen || capturedPreview || !videoRef.current || !streamRef.current) {
      return;
    }

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [isCameraModalOpen, capturedPreview]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  const isPdfByName = (file: File) => file.name.toLowerCase().endsWith('.pdf');

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Maximum file size is 5MB';
    }

    if (cameraOnly) {
      if (!file.type.startsWith('image/')) {
        return 'Only image files are allowed for camera capture';
      }
      return null;
    }

    const isAcceptedType = ACCEPTED_TYPES.includes(file.type) || isPdfByName(file);
    if (!isAcceptedType) {
      return 'Only PDF and image files are allowed';
    }

    return null;
  };

  const setImagePreviewIfNeeded = (file: File) => {
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

  const processFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) {
      onChange(null);
      setPreview(null);
      return;
    }

    const invalid = list.find((file) => validateFile(file) !== null);
    if (invalid) {
      const reason = validateFile(invalid);
      setLocalError(reason);
      return;
    }

    setLocalError(null);

    if (multiple) {
      list.forEach((file) => onChange(file));
      const firstImage = list.find((file) => file.type.startsWith('image/'));
      if (firstImage) {
        setImagePreviewIfNeeded(firstImage);
      } else {
        setPreview(null);
      }
      return;
    }

    const file = list[0];
    onChange(file);
    setImagePreviewIfNeeded(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
  };

  const openFileChooser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setCapturedFile(null);
    setCapturedPreview(null);

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraModalOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError('Camera access denied or unavailable. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const closeCameraModal = () => {
    stopCamera();
    setIsCameraModalOpen(false);
    setCapturedFile(null);
    setCapturedPreview(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const reason = validateFile(file);
      if (reason) {
        setCameraError(reason);
        return;
      }
      setCapturedPreview(dataUrl);
      setCapturedFile(file);
      setCameraError(null);
    }, 'image/jpeg', 0.9);
  };

  const confirmCapturedPhoto = () => {
    if (!capturedFile) return;

    onChange(capturedFile);
    setPreview(capturedPreview);
    setLocalError(null);
    closeCameraModal();
  };

  const recapturePhoto = () => {
    setCapturedFile(null);
    setCapturedPreview(null);
    setCameraError(null);
  };

  const handleContainerClick = () => {
    if (cameraOnly) {
      startCamera();
      return;
    }
    openFileChooser();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (cameraOnly) return;
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (cameraOnly) return;
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (cameraOnly) return;
    event.preventDefault();
    setIsDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileName = () => {
    if (value instanceof File) {
      return value.name;
    }
    if (Array.isArray(value) && value.length > 0) {
      return `${value.length} file${value.length > 1 ? 's' : ''} selected`;
    }
    return null;
  };

  const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          error || localError
            ? 'border-red-500'
            : isDragActive
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-500'
        }`}
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleContainerClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {!hasValue || multiple ? (
          <div className="space-y-3">
            {cameraOnly ? (
              <Camera className="w-12 h-12 mx-auto text-gray-400" />
            ) : (
              <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
            )}
            
            <div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleContainerClick();
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {cameraOnly ? 'Take Photo' : 'Choose File'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {cameraOnly ? 'Tap anywhere to open camera' : 'Drag and drop or tap anywhere to choose file'}
              </p>
              {multiple && Array.isArray(value) && value.length > 0 && (
                <div className="mt-2 text-left bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {value.length} file{value.length > 1 ? 's' : ''} selected
                  </p>
                  <ul className="space-y-1 max-h-24 overflow-y-auto">
                    {value.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="text-xs text-gray-700 truncate">
                        • {file.name}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemove();
                    }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
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
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove();
                  }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemove();
                    }}
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
        accept={cameraOnly ? 'image/*' : (accept || 'image/*,.pdf,application/pdf')}
        onChange={handleFileChange}
        multiple={multiple}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {localError && <p className="mt-1 text-sm text-red-600">{localError}</p>}
      {!error && !localError && (
        <p className="mt-1 text-xs text-gray-500">Accepted: Images/PDF, max 5MB</p>
      )}

      {isCameraModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeCameraModal} />
          <div className="relative w-full max-w-2xl rounded-xl bg-white overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <button
                type="button"
                onClick={closeCameraModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close camera modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}

              <div className="w-full rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                {capturedPreview ? (
                  <img src={capturedPreview} alt="Captured preview" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {!capturedPreview && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                  <p className="text-xs text-gray-700 font-medium">Photo tips:</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Keep your face and ID clearly visible, use good lighting, avoid blur, and avoid dark shots.
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-2 justify-end">
              {!capturedPreview ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={recapturePhoto}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recapture
                  </button>
                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
