import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from apps.merchants.models import Merchant
from apps.merchants.serializers.merchant_serializers import (
    Step1Serializer,
    Step2Serializer,
    Step3Serializer,
    MerchantSerializer,
    RegistrationProgressSerializer
)
from apps.merchants.services.registration_service import MerchantRegistrationService
from apps.merchants.services.email_service import EmailService
from apps.merchants.services.password_reset_service import PasswordResetService


class RegistrationStep1View(APIView):
    """
    API endpoint for Step 1: General Info
    Handles business and owner information
    """
    permission_classes = [AllowAny]  # Allow public access
    
    def post(self, request):
        """Save Step 1 data"""
        serializer = Step1Serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get merchant_id if continuing registration
            merchant_id = request.data.get('merchant_id')
            
            # Save step data
            merchant = MerchantRegistrationService.save_step_data(
                merchant_id=merchant_id,
                step=1,
                data=serializer.validated_data
            )
            
            return Response({
                'success': True,
                'message': 'Step 1 completed successfully',
                'data': {
                    'merchant_id': merchant.id,
                    'current_step': merchant.registration_step,
                    'business_registration': merchant.business_registration
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistrationStep2View(APIView):
    """
    API endpoint for Step 2: Location
    Handles address and coordinates
    """
    permission_classes = [AllowAny]  # Allow public access
    
    def post(self, request):
        """Save Step 2 data"""
        serializer = Step2Serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            merchant_id = request.data.get('merchant_id')
            
            if not merchant_id:
                return Response({
                    'success': False,
                    'message': 'Merchant ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save step data — coordinate normalization handled by the service
            step2_data = {
                **serializer.validated_data,
                'latitude': MerchantRegistrationService.normalize_coordinate(
                    serializer.validated_data.get('latitude')
                ),
                'longitude': MerchantRegistrationService.normalize_coordinate(
                    serializer.validated_data.get('longitude')
                ),
            }

            merchant = MerchantRegistrationService.save_step_data(
                merchant_id=merchant_id,
                step=2,
                data=step2_data
            )
            
            return Response({
                'success': True,
                'message': 'Step 2 completed successfully',
                'data': {
                    'merchant_id': merchant.id,
                    'current_step': merchant.registration_step,
                    'full_address': merchant.full_address
                }
            }, status=status.HTTP_200_OK)
        
        except Merchant.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Merchant not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistrationStep3View(APIView):
    """
    Complete merchant registration atomically.
    All three steps' data arrives in one multipart payload.
    Nothing is written to the database unless all validation passes.
    POST /merchants/register/step3/
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # ── Parse step 1 fields from multipart payload ──
        raw_categories = request.data.get('business_categories', '[]')
        raw_types = request.data.get('business_types', '[]')
        step1_payload = {
            'business_name': request.data.get('business_name'),
            'owner_name': request.data.get('owner_name'),
            'username': request.data.get('username'),
            'phone_number': request.data.get('phone_number'),
            'email': request.data.get('email'),
            'business_categories': json.loads(raw_categories) if isinstance(raw_categories, str) else raw_categories,
            'business_types': json.loads(raw_types) if isinstance(raw_types, str) else raw_types,
            'business_registration': request.data.get('business_registration'),
        }
        step1_serializer = Step1Serializer(data=step1_payload)
        if not step1_serializer.is_valid():
            return Response({'success': False, 'errors': step1_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # ── Parse step 2 fields ──
        step2_payload = {
            'zip_code': request.data.get('zip_code'),
            'province': request.data.get('province'),
            'city': request.data.get('city'),
            'barangay': request.data.get('barangay'),
            'street_name': request.data.get('street_name'),
            'house_number': request.data.get('house_number'),
            'latitude': request.data.get('latitude'),
            'longitude': request.data.get('longitude'),
        }
        step2_serializer = Step2Serializer(data=step2_payload)
        if not step2_serializer.is_valid():
            return Response({'success': False, 'errors': step2_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # ── Validate documents (no DB lookup — uses business_registration from step1) ──
        step3_serializer = Step3Serializer(
            data=request.data,
            context={'business_registration': step1_serializer.validated_data['business_registration']}
        )
        if not step3_serializer.is_valid():
            return Response({'success': False, 'errors': step3_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # ── Build documents dict ──
        documents = {
            'selfie_with_id': request.FILES.get('selfie_with_id'),
            'valid_id': request.FILES.get('valid_id'),
            'barangay_permit': request.FILES.get('barangay_permit'),
            'dti_sec_certificate': request.FILES.get('dti_sec_certificate'),
            'bir_certificate': request.FILES.get('bir_certificate'),
            'mayors_permit': request.FILES.get('mayors_permit'),
        }
        for idx, doc in enumerate(request.FILES.getlist('other_documents')):
            documents[f'other_document_{idx}'] = doc

        # ── Atomic save — nothing committed unless this succeeds ──
        try:
            merchant, password = MerchantRegistrationService.register_merchant_atomic(
                step1_data=step1_serializer.validated_data,
                step2_data=step2_serializer.validated_data,
                documents=documents,
            )
        except ValidationError as ve:
            errors = ve.message_dict if hasattr(ve, 'message_dict') else {'detail': ve.messages}
            return Response({'success': False, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ── Send welcome email (after successful DB commit) ──
        email_sent = EmailService.send_welcome_email(
            email=merchant.email,
            business_name=merchant.business_name,
            username=merchant.username,
            password=password,
        )

        return Response({
            'success': True,
            'message': 'Registration completed successfully! Check your email for login credentials.',
            'data': {
                'merchant_id': merchant.id,
                'email_sent': email_sent,
                'business_name': merchant.business_name,
                'status': merchant.status,
            }
        }, status=status.HTTP_201_CREATED)


class MerchantLoginView(APIView):
    """
    Authenticate a merchant and return JWT access + refresh tokens.
    POST /merchants/login/
    Body: { "identifier": "email or username", "password": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '').strip()
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response(
                {'success': False, 'message': 'Identifier (email/username) and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            merchant = MerchantRegistrationService.authenticate_merchant(identifier, password)
        except ValueError as exc:
            return Response(
                {'success': False, 'message': str(exc)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(merchant)
        return Response({
            'success': True,
            'message': 'Login successful.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'merchant': {
                'id': merchant.id,
                'email': merchant.email,
                'username': merchant.username,
                'business_name': merchant.business_name,
                'status': merchant.status,
            }
        }, status=status.HTTP_200_OK)


class RegistrationProgressView(APIView):
    """
    API endpoint to get registration progress
    Allows continuing incomplete registrations
    """
    permission_classes = [AllowAny]  # Allow public access
    
    def get(self, request, merchant_id):
        """Get registration progress for a merchant"""
        try:
            progress = MerchantRegistrationService.get_registration_progress(merchant_id)
            
            if not progress:
                return Response({
                    'success': False,
                    'message': 'Merchant not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = RegistrationProgressSerializer(progress)
            
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckUniquenessView(APIView):
    """
    API endpoint to check uniqueness of username, email, phone
    Used for real-time validation in the form
    """
    permission_classes = [AllowAny]  # Allow public access
    
    def post(self, request):
        """Check if username, email, or phone is unique"""
        field = request.data.get('field')
        value = request.data.get('value')
        
        if not field or not value:
            return Response({
                'success': False,
                'message': 'Field and value are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            exists = MerchantRegistrationService.check_field_uniqueness(field, value)
            return Response({
                'success': True,
                'exists': exists,
                'message': f'{field.capitalize()} already exists' if exists else f'{field.capitalize()} is available'
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'success': False,
                'message': 'Invalid field'
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Forgot Password Views
# ---------------------------------------------------------------------------

class ForgotPasswordSendOTPView(APIView):
    """
    Step 1 - Send a 6-digit OTP to the merchant's registered email.
    POST /merchants/forgot-password/send-otp/
    Body: { "email": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response(
                {'success': False, 'message': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp, merchant = PasswordResetService.generate_and_store_otp(email)

        if otp is None:
            return Response(
                {
                    'success': False,
                    'message': 'No active merchant account found with that email.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        email_sent = EmailService.send_otp_email(
            email=merchant.email,
            business_name=merchant.business_name,
            otp=otp
        )

        if not email_sent:
            return Response(
                {'success': False, 'message': 'Failed to send OTP email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {'success': True, 'message': 'OTP sent successfully. Please check your email.'},
            status=status.HTTP_200_OK
        )


class ForgotPasswordVerifyOTPView(APIView):
    """
    Step 2 - Verify the 6-digit OTP.
    POST /merchants/forgot-password/verify-otp/
    Body: { "email": "...", "otp": "123456" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response(
                {'success': False, 'message': 'Email and OTP are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        verified = PasswordResetService.verify_otp(email, otp)

        if not verified:
            return Response(
                {'success': False, 'message': 'Invalid or expired OTP. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'success': True, 'message': 'OTP verified successfully.'},
            status=status.HTTP_200_OK
        )


class ForgotPasswordResetView(APIView):
    """
    Step 3 - Reset the password after OTP verification.
    POST /merchants/forgot-password/reset/
    Body: { "email": "...", "new_password": "...", "confirm_password": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not email:
            return Response(
                {'success': False, 'message': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        validation_error = PasswordResetService.validate_password(new_password, confirm_password)
        if validation_error:
            return Response(
                {'success': False, 'message': validation_error},
                status=status.HTTP_400_BAD_REQUEST
            )

        success = PasswordResetService.reset_password(email, new_password)

        if not success:
            return Response(
                {
                    'success': False,
                    'message': 'Password reset failed. Your OTP session may have expired. Please start over.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'success': True, 'message': 'Password has been reset successfully.'},
            status=status.HTTP_200_OK
        )
