from rest_framework import serializers
from apps.merchants.models import Merchant
from django.core.validators import RegexValidator


class Step1Serializer(serializers.Serializer):
    """Serializer for Step 1: General Info"""
    
    business_name = serializers.CharField(max_length=255, required=True)
    owner_name = serializers.CharField(max_length=255, required=True)
    username = serializers.CharField(max_length=150, required=True)
    phone_number = serializers.CharField(
        max_length=17,
        required=True,
        validators=[
            RegexValidator(
                regex=r'^\+63\s\d{3}\s\d{3}\s\d{4}$',
                message="Phone number must be in format: '+63 912 123 1234'"
            )
        ]
    )
    email = serializers.EmailField(required=True)
    business_categories = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    business_types = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    business_registration = serializers.ChoiceField(
        choices=Merchant.REGISTRATION_TYPES,
        required=True
    )
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if Merchant.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if Merchant.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number uniqueness"""
        if Merchant.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value


class Step2Serializer(serializers.Serializer):
    """Serializer for Step 2: Location"""
    
    zip_code = serializers.CharField(max_length=10, required=True)
    province = serializers.CharField(max_length=100, required=True)
    city = serializers.CharField(max_length=100, required=True)
    barangay = serializers.CharField(max_length=100, required=True)
    street_name = serializers.CharField(max_length=255, required=True)
    house_number = serializers.CharField(max_length=50, required=True)
    latitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=False,
        allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=False,
        allow_null=True
    )


class Step3Serializer(serializers.Serializer):
    """Serializer for Step 3: Documents"""
    
    # Required for all
    selfie_with_id = serializers.FileField(required=True)
    valid_id = serializers.FileField(required=True)
    
    # For registered businesses
    barangay_permit = serializers.FileField(required=False, allow_null=True)
    dti_sec_certificate = serializers.FileField(required=False, allow_null=True)
    bir_certificate = serializers.FileField(required=False, allow_null=True)
    mayors_permit = serializers.FileField(required=False, allow_null=True)
    
    # Optional additional documents (can be multiple)
    other_documents = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True
    )
    
    def validate(self, data):
        """Validate documents based on business registration type"""
        # Get merchant_id from context
        merchant_id = self.context.get('merchant_id')
        if not merchant_id:
            raise serializers.ValidationError("Merchant ID is required")
        
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            raise serializers.ValidationError("Merchant not found")
        
        registration_type = merchant.business_registration
        
        # Validate based on registration type
        if registration_type == Merchant.REGISTERED_NON_VAT:
            if not data.get('barangay_permit'):
                raise serializers.ValidationError(
                    {"barangay_permit": "Barangay permit is required for registered businesses"}
                )
            if not data.get('dti_sec_certificate'):
                raise serializers.ValidationError(
                    {"dti_sec_certificate": "DTI/SEC certificate is required for registered businesses"}
                )
        
        elif registration_type == Merchant.REGISTERED_VAT:
            required_docs = {
                'barangay_permit': 'Barangay permit',
                'dti_sec_certificate': 'DTI/SEC certificate',
                'bir_certificate': 'BIR certificate',
                'mayors_permit': "Mayor's permit"
            }
            
            for field, label in required_docs.items():
                if not data.get(field):
                    raise serializers.ValidationError(
                        {field: f"{label} is required for VAT registered businesses"}
                    )
        
        return data


class MerchantSerializer(serializers.ModelSerializer):
    """Main serializer for Merchant model"""
    
    full_address = serializers.ReadOnlyField()
    is_registration_complete = serializers.ReadOnlyField()
    required_documents_uploaded = serializers.ReadOnlyField()
    
    class Meta:
        model = Merchant
        fields = [
            'id',
            'username',
            'email',
            'business_name',
            'owner_name',
            'phone_number',
            'business_categories',
            'business_types',
            'business_registration',
            'zip_code',
            'province',
            'city',
            'barangay',
            'street_name',
            'house_number',
            'latitude',
            'longitude',
            'full_address',
            'status',
            'is_verified',
            'is_new',
            'registration_step',
            'is_registration_complete',
            'required_documents_uploaded',
            'rating',
            'total_orders',
            'total_sales',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'status',
            'is_verified',
            'is_new',
            'registration_step',
            'rating',
            'total_orders',
            'total_sales',
            'created_at',
            'updated_at',
        ]


class RegistrationProgressSerializer(serializers.Serializer):
    """Serializer for registration progress"""
    
    merchant_id = serializers.IntegerField()
    current_step = serializers.IntegerField()
    is_complete = serializers.BooleanField()
    temp_data = serializers.JSONField()
    business_registration = serializers.CharField()
