import json
import secrets
import string
from typing import Dict, Any, Optional
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.files.storage import default_storage
from pathlib import Path
import uuid
from apps.merchants.models import Merchant


class MerchantRegistrationService:
    """
    Service class for handling merchant registration logic
    Implements OOP principles with clean separation of concerns
    """

    # ------------------------------------------------------------------
    # Coordinate utilities
    # ------------------------------------------------------------------

    @staticmethod
    def normalize_coordinate(value: Any) -> Any:
        """Normalize a latitude/longitude value to 6 decimal places."""
        if value in (None, ''):
            return value
        try:
            normalized = Decimal(str(value)).quantize(
                Decimal('0.000001'), rounding=ROUND_HALF_UP
            )
            return str(normalized)
        except (InvalidOperation, ValueError, TypeError):
            return value

    # ------------------------------------------------------------------
    # Uniqueness checks (DB access belongs in the service)
    # ------------------------------------------------------------------

    @staticmethod
    def check_field_uniqueness(field: str, value: str) -> bool:
        """
        Return True if a merchant already exists with this value for the field.
        Supported fields: username, email, phone_number.
        """
        if field == 'username':
            return Merchant.objects.filter(username=value).exists()
        if field == 'email':
            return Merchant.objects.filter(email=value).exists()
        if field == 'phone_number':
            return Merchant.objects.filter(phone_number=value).exists()
        raise ValueError(f"Unsupported uniqueness field: {field}")

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------

    @classmethod
    def authenticate_merchant(cls, identifier: str, password: str) -> 'Merchant':
        """
        Authenticate a merchant by email or username + password.
        Returns the Merchant on success.
        Raises ValueError with a descriptive message on failure.
        """
        identifier = identifier.strip()
        try:
            if '@' in identifier:
                merchant = Merchant.objects.get(email__iexact=identifier)
            else:
                merchant = Merchant.objects.get(username__iexact=identifier)
        except Merchant.DoesNotExist:
            raise ValueError('No merchant account found with those credentials.')

        if not merchant.is_active:
            raise ValueError('Your account is not yet active. Please complete registration or contact support.')

        if not merchant.check_password(password):
            raise ValueError('Incorrect password. Please try again.')

        return merchant

    # ------------------------------------------------------------------
    # Single-payload step resolver (used by Step3 when no merchant_id provided)
    # ------------------------------------------------------------------

    @classmethod
    @transaction.atomic
    def resolve_merchant_from_single_payload(
        cls,
        data: Dict[str, Any],
        files: Dict[str, Any],
        step1_serializer_class: Any,
        step2_serializer_class: Any,
    ) -> int:
        """
        When the frontend submits all three steps in one payload (no merchant_id),
        parse and save steps 1 and 2 from the raw payload and return the merchant_id.

        Args:
            data: request.data dict
            files: request.FILES dict
            step1_serializer_class: Step1Serializer class (injected to avoid import)
            step2_serializer_class: Step2Serializer class (injected to avoid import)

        Returns:
            merchant_id (int)

        Raises:
            ValidationError with serializer errors on invalid data.
        """
        # Parse JSON array fields
        raw_categories = data.get('business_categories', '[]')
        raw_types = data.get('business_types', '[]')

        business_categories = (
            json.loads(raw_categories) if isinstance(raw_categories, str) else raw_categories
        )
        business_types = (
            json.loads(raw_types) if isinstance(raw_types, str) else raw_types
        )

        step1_payload = {
            'business_name': data.get('business_name'),
            'owner_name': data.get('owner_name'),
            'username': data.get('username'),
            'phone_number': data.get('phone_number'),
            'email': data.get('email'),
            'business_categories': business_categories,
            'business_types': business_types,
            'business_registration': data.get('business_registration'),
        }

        step1_serializer = step1_serializer_class(data=step1_payload)
        if not step1_serializer.is_valid():
            raise ValidationError(step1_serializer.errors)

        merchant = cls.save_step_data(
            merchant_id=None,
            step=1,
            data=step1_serializer.validated_data,
        )

        step2_payload = {
            'zip_code': data.get('zip_code'),
            'province': data.get('province'),
            'city': data.get('city'),
            'barangay': data.get('barangay'),
            'street_name': data.get('street_name'),
            'house_number': data.get('house_number'),
            'latitude': cls.normalize_coordinate(data.get('latitude')),
            'longitude': cls.normalize_coordinate(data.get('longitude')),
        }

        step2_serializer = step2_serializer_class(data=step2_payload)
        if not step2_serializer.is_valid():
            raise ValidationError(step2_serializer.errors)

        merchant = cls.save_step_data(
            merchant_id=merchant.id,
            step=2,
            data=step2_serializer.validated_data,
        )

        return merchant.id

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
        temp_data[f'step_{step}'] = cls._normalize_for_json(data)
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

    @staticmethod
    def _normalize_for_json(value: Any) -> Any:
        """Convert non-JSON-native values (e.g., Decimal) into JSON-safe values."""
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, dict):
            return {key: MerchantRegistrationService._normalize_for_json(item) for key, item in value.items()}
        if isinstance(value, list):
            return [MerchantRegistrationService._normalize_for_json(item) for item in value]
        return value
    
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
        other_docs: list[str] = []
        for key, value in documents.items():
            if key.startswith('other_document_'):
                stored_path = cls._store_other_document(merchant_id, value)
                other_docs.append(stored_path)
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
    def _store_other_document(merchant_id: int, uploaded_file: Any) -> str:
        """Store optional document and return persisted relative file path."""
        extension = Path(uploaded_file.name or '').suffix.lower()
        unique_suffix = uuid.uuid4().hex
        storage_path = f"merchant/{merchant_id}/documents/other-document-{unique_suffix}{extension}"
        return default_storage.save(storage_path, uploaded_file)
    
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
