import secrets
import string
from typing import Dict, Any, Optional
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.merchants.models import Merchant


class MerchantRegistrationService:
    """
    Service class for handling merchant registration logic
    Implements OOP principles with clean separation of concerns
    """
    
    @staticmethod
    def generate_password(length: int = 12) -> str:
        """
        Generate a secure random password
        
        Args:
            length: Length of the password (default 12)
            
        Returns:
            Generated password string
        """
        characters = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(characters) for _ in range(length))
        return password
    
    @staticmethod
    def validate_step_data(step: int, data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate data for a specific registration step
        
        Args:
            step: Step number (1, 2, or 3)
            data: Data to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if step == 1:
            required_fields = [
                'business_name', 'owner_name', 'username', 
                'phone_number', 'email', 'business_registration'
            ]
            for field in required_fields:
                if not data.get(field):
                    return False, f"Field '{field}' is required"
            
            # Check uniqueness
            if Merchant.objects.filter(username=data['username']).exists():
                return False, "Username already exists"
            
            if Merchant.objects.filter(email=data['email']).exists():
                return False, "Email already exists"
            
            if Merchant.objects.filter(phone_number=data['phone_number']).exists():
                return False, "Phone number already exists"
            
            return True, None
        
        elif step == 2:
            required_fields = [
                'zip_code', 'province', 'city', 'barangay', 
                'street_name', 'house_number'
            ]
            for field in required_fields:
                if not data.get(field):
                    return False, f"Field '{field}' is required"
            
            return True, None
        
        elif step == 3:
            # Document validation will be done in serializer
            return True, None
        
        return False, "Invalid step number"
    
    @classmethod
    @transaction.atomic
    def save_step_data(
        cls, 
        merchant_id: Optional[int], 
        step: int, 
        data: Dict[str, Any]
    ) -> Merchant:
        """
        Save data for a specific registration step
        Uses temporary storage for multi-step process
        
        Args:
            merchant_id: Existing merchant ID (None for new registration)
            step: Step number (1, 2, or 3)
            data: Data to save
            
        Returns:
            Merchant instance
        """
        if merchant_id:
            # Update existing merchant
            merchant = Merchant.objects.get(id=merchant_id)
        else:
            # Create new merchant on step 1
            if step != 1:
                raise ValidationError("Cannot start from step other than 1")
            
            merchant = Merchant.objects.create(
                username=data['username'],
                email=data['email'],
                is_active=False,  # Inactive until registration is complete
                registration_step=0
            )
        
        # Update temp data
        temp_data = merchant.temp_registration_data or {}
        temp_data[f'step_{step}'] = data
        merchant.temp_registration_data = temp_data
        merchant.registration_step = step
        
        # Save actual fields for completed steps
        if step == 1:
            merchant.business_name = data.get('business_name')
            merchant.owner_name = data.get('owner_name')
            merchant.username = data.get('username')
            merchant.phone_number = data.get('phone_number')
            merchant.email = data.get('email')
            merchant.business_categories = data.get('business_categories', [])
            merchant.business_types = data.get('business_types', [])
            merchant.business_registration = data.get('business_registration')
        
        elif step == 2:
            merchant.zip_code = data.get('zip_code')
            merchant.province = data.get('province')
            merchant.city = data.get('city')
            merchant.barangay = data.get('barangay')
            merchant.street_name = data.get('street_name')
            merchant.house_number = data.get('house_number')
            merchant.latitude = data.get('latitude')
            merchant.longitude = data.get('longitude')
        
        merchant.save()
        return merchant
    
    @classmethod
    @transaction.atomic
    def complete_registration(
        cls, 
        merchant_id: int, 
        documents: Dict[str, Any]
    ) -> tuple[Merchant, str]:
        """
        Complete the merchant registration process
        Generate password and activate account
        
        Args:
            merchant_id: Merchant ID
            documents: Uploaded documents
            
        Returns:
            Tuple of (merchant, generated_password)
        """
        merchant = Merchant.objects.get(id=merchant_id)
        
        # Validate documents based on registration type
        if not cls._validate_documents(merchant.business_registration, documents):
            raise ValidationError("Required documents are missing")
        
        # Save documents
        merchant.selfie_with_id = documents.get('selfie_with_id')
        merchant.valid_id = documents.get('valid_id')
        
        if merchant.business_registration in [
            Merchant.REGISTERED_NON_VAT, 
            Merchant.REGISTERED_VAT
        ]:
            merchant.barangay_permit = documents.get('barangay_permit')
            merchant.dti_sec_certificate = documents.get('dti_sec_certificate')
        
        if merchant.business_registration == Merchant.REGISTERED_VAT:
            merchant.bir_certificate = documents.get('bir_certificate')
            merchant.mayors_permit = documents.get('mayors_permit')
        
        # Handle optional documents
        other_docs = []
        for key, value in documents.items():
            if key.startswith('other_document_'):
                other_docs.append(value)
        merchant.other_documents = other_docs
        
        # Generate password
        password = cls.generate_password()
        merchant.set_password(password)
        
        # Activate account
        merchant.is_active = True
        merchant.is_new = True
        merchant.registration_step = 3
        merchant.status = Merchant.PENDING
        
        # Clear temp data
        merchant.temp_registration_data = {}
        
        merchant.save()
        
        return merchant, password
    
    @staticmethod
    def _validate_documents(registration_type: str, documents: Dict[str, Any]) -> bool:
        """
        Validate uploaded documents based on registration type
        
        Args:
            registration_type: Type of business registration
            documents: Dictionary of uploaded documents
            
        Returns:
            True if all required documents are present
        """
        # Required for all
        if not documents.get('selfie_with_id') or not documents.get('valid_id'):
            return False
        
        if registration_type == Merchant.UNREGISTERED:
            return True
        
        if registration_type == Merchant.REGISTERED_NON_VAT:
            return bool(
                documents.get('barangay_permit') and 
                documents.get('dti_sec_certificate')
            )
        
        if registration_type == Merchant.REGISTERED_VAT:
            return bool(
                documents.get('barangay_permit') and 
                documents.get('dti_sec_certificate') and 
                documents.get('bir_certificate') and 
                documents.get('mayors_permit')
            )
        
        return False
    
    @staticmethod
    def get_registration_progress(merchant_id: int) -> Dict[str, Any]:
        """
        Get the current registration progress for a merchant
        
        Args:
            merchant_id: Merchant ID
            
        Returns:
            Dictionary with progress information
        """
        try:
            merchant = Merchant.objects.get(id=merchant_id)
            return {
                'merchant_id': merchant.id,
                'current_step': merchant.registration_step,
                'is_complete': merchant.is_registration_complete,
                'temp_data': merchant.temp_registration_data,
                'business_registration': merchant.business_registration
            }
        except Merchant.DoesNotExist:
            return None
