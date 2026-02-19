from django.urls import path
from apps.merchants.views import (
    RegistrationStep1View,
    RegistrationStep2View,
    RegistrationStep3View,
    RegistrationProgressView,
    CheckUniquenessView,
    ForgotPasswordSendOTPView,
    ForgotPasswordVerifyOTPView,
    ForgotPasswordResetView,
)

app_name = 'merchants'

urlpatterns = [
    # Registration endpoints
    path('register/step1/', RegistrationStep1View.as_view(), name='register-step1'),
    path('register/step2/', RegistrationStep2View.as_view(), name='register-step2'),
    path('register/step3/', RegistrationStep3View.as_view(), name='register-step3'),

    # Progress and validation
    path('register/progress/<int:merchant_id>/', RegistrationProgressView.as_view(), name='registration-progress'),
    path('register/check-uniqueness/', CheckUniquenessView.as_view(), name='check-uniqueness'),

    # Forgot password flow
    path('forgot-password/send-otp/', ForgotPasswordSendOTPView.as_view(), name='forgot-password-send-otp'),
    path('forgot-password/verify-otp/', ForgotPasswordVerifyOTPView.as_view(), name='forgot-password-verify-otp'),
    path('forgot-password/reset/', ForgotPasswordResetView.as_view(), name='forgot-password-reset'),
]
