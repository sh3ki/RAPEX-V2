from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from django.db import transaction
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
            
            # Save step data
            merchant = MerchantRegistrationService.save_step_data(
                merchant_id=merchant_id,
                step=2,
                data=serializer.validated_data
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
    API endpoint for Step 3: Documents
    Handles document uploads and completes registration
    """
    permission_classes = [AllowAny]  # Allow public access
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Save Step 3 data and complete registration"""
        merchant_id = request.data.get('merchant_id')
        
        if not merchant_id:
            return Response({
                'success': False,
                'message': 'Merchant ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = Step3Serializer(
            data=request.data,
            context={'merchant_id': merchant_id}
        )
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Prepare documents dictionary
            documents = {
                'selfie_with_id': request.FILES.get('selfie_with_id'),
                'valid_id': request.FILES.get('valid_id'),
                'barangay_permit': request.FILES.get('barangay_permit'),
                'dti_sec_certificate': request.FILES.get('dti_sec_certificate'),
                'bir_certificate': request.FILES.get('bir_certificate'),
                'mayors_permit': request.FILES.get('mayors_permit'),
            }
            
            # Handle multiple other documents
            other_docs = request.FILES.getlist('other_documents')
            if other_docs:
                for idx, doc in enumerate(other_docs):
                    documents[f'other_document_{idx}'] = doc
            
            # Complete registration
            merchant, password = MerchantRegistrationService.complete_registration(
                merchant_id=merchant_id,
                documents=documents
            )
            
            # Send welcome email with password
            email_sent = EmailService.send_welcome_email(
                email=merchant.email,
                business_name=merchant.business_name,
                username=merchant.username,
                password=password
            )
            
            return Response({
                'success': True,
                'message': 'Registration completed successfully! Check your email for login credentials.',
                'data': {
                    'merchant_id': merchant.id,
                    'email_sent': email_sent,
                    'business_name': merchant.business_name,
                    'status': merchant.status
                }
            }, status=status.HTTP_201_CREATED)
        
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
            if field == 'username':
                exists = Merchant.objects.filter(username=value).exists()
            elif field == 'email':
                exists = Merchant.objects.filter(email=value).exists()
            elif field == 'phone_number':
                exists = Merchant.objects.filter(phone_number=value).exists()
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid field'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'exists': exists,
                'message': f'{field.capitalize()} already exists' if exists else f'{field.capitalize()} is available'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
