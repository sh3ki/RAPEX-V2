import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

// Merchant Registration API functions
export const merchantAPI = {
  // Step 1: General Info
  submitStep1: async (data: any) => {
    const response = await apiClient.post('/merchants/register/step1/', data);
    return response.data;
  },

  // Step 2: Location
  submitStep2: async (data: any) => {
    const response = await apiClient.post('/merchants/register/step2/', data);
    return response.data;
  },

  // Step 3: Documents
  submitStep3: async (formData: FormData) => {
    const response = await apiClient.post('/merchants/register/step3/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Check uniqueness
  checkUniqueness: async (field: string, value: string) => {
    const response = await apiClient.post('/merchants/register/check-uniqueness/', {
      field,
      value,
    });
    return response.data;
  },

  // Get registration progress
  getProgress: async (merchantId: number) => {
    const response = await apiClient.get(`/merchants/register/progress/${merchantId}/`);
    return response.data;
  },

  // Forgot password flow
  forgotPasswordSendOTP: async (email: string) => {
    const response = await apiClient.post('/merchants/forgot-password/send-otp/', { email });
    return response.data;
  },

  forgotPasswordVerifyOTP: async (email: string, otp: string) => {
    const response = await apiClient.post('/merchants/forgot-password/verify-otp/', { email, otp });
    return response.data;
  },

  forgotPasswordReset: async (email: string, new_password: string, confirm_password: string) => {
    const response = await apiClient.post('/merchants/forgot-password/reset/', {
      email,
      new_password,
      confirm_password,
    });
    return response.data;
  },
};
