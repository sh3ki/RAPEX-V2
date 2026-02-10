from django.urls import path
from apps.merchants.views import (
    RegistrationStep1View,
    RegistrationStep2View,
    RegistrationStep3View,
    RegistrationProgressView,
    CheckUniquenessView,
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
]
