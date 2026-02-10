from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.contrib.postgres.fields import ArrayField


class MerchantManager(BaseUserManager):
    """Custom manager for Merchant model"""
    
    def create_merchant(self, email, username, password=None, **extra_fields):
        """Create and save a merchant with the given email and password"""
        if not email:
            raise ValueError('Merchants must have an email address')
        if not username:
            raise ValueError('Merchants must have a username')
        
        email = self.normalize_email(email)
        merchant = self.model(email=email, username=username, **extra_fields)
        merchant.set_password(password)
        merchant.save(using=self._db)
        return merchant
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and save a superuser merchant"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        
        return self.create_merchant(email, username, password, **extra_fields)


class Merchant(AbstractBaseUser, PermissionsMixin):
    """
    Merchant model for business owners/sellers
    Includes authentication and complete business information
    """
    
    # Registration type choices
    UNREGISTERED = 'UNREGISTERED'
    REGISTERED_NON_VAT = 'REGISTERED_NON_VAT'
    REGISTERED_VAT = 'REGISTERED_VAT'
    
    REGISTRATION_TYPES = [
        (UNREGISTERED, 'Unregistered'),
        (REGISTERED_NON_VAT, 'Registered (NON-VAT)'),
        (REGISTERED_VAT, 'Registered (VAT Included)'),
    ]
    
    # Status choices
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    SUSPENDED = 'SUSPENDED'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending Verification'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
        (SUSPENDED, 'Suspended'),
    ]
    
    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+63\s\d{3}\s\d{3}\s\d{4}$',
        message="Phone number must be in format: '+63 912 123 1234'"
    )
    
    # ============ AUTHENTICATION FIELDS ============
    username = models.CharField(max_length=150, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=128)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)  # Flag for new users who need to change password
    
    # Override groups and user_permissions with related_name to avoid clash
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this merchant belongs to.',
        related_name='merchant_set',
        related_query_name='merchant'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this merchant.',
        related_name='merchant_set',
        related_query_name='merchant'
    )
    
    # ============ STEP 1: GENERAL INFO ============
    business_name = models.CharField(max_length=255, db_index=True)
    owner_name = models.CharField(max_length=255)
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        unique=True,
        db_index=True
    )
    
    # Business categories - stored as array
    business_categories = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )
    
    # Business types - stored as array
    business_types = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )
    
    business_registration = models.CharField(
        max_length=20,
        choices=REGISTRATION_TYPES,
        default=UNREGISTERED
    )
    
    # ============ STEP 2: LOCATION ============
    zip_code = models.CharField(max_length=10)
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    barangay = models.CharField(max_length=100)
    street_name = models.CharField(max_length=255)
    house_number = models.CharField(max_length=50)
    
    # Coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # ============ STEP 3: DOCUMENTS ============
    # Required for all
    selfie_with_id = models.FileField(upload_to='merchants/documents/selfies/', null=True, blank=True)
    valid_id = models.FileField(upload_to='merchants/documents/ids/', null=True, blank=True)
    
    # For registered businesses
    barangay_permit = models.FileField(upload_to='merchants/documents/permits/', null=True, blank=True)
    dti_sec_certificate = models.FileField(upload_to='merchants/documents/certificates/', null=True, blank=True)
    bir_certificate = models.FileField(upload_to='merchants/documents/bir/', null=True, blank=True)
    mayors_permit = models.FileField(upload_to='merchants/documents/mayors/', null=True, blank=True)
    
    # Optional additional documents
    other_documents = models.JSONField(default=list, blank=True)  # Array of file URLs
    
    # ============ VERIFICATION & STATUS ============
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    
    verification_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_merchants'
    )
    
    # ============ TEMPORARY REGISTRATION DATA ============
    temp_registration_data = models.JSONField(default=dict, blank=True)  # For multi-step form
    registration_step = models.IntegerField(default=0)  # Current step (0, 1, 2, 3)
    
    # ============ TIMESTAMPS ============
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # ============ BUSINESS METRICS ============
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_orders = models.IntegerField(default=0)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    objects = MerchantManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'merchants'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['business_name']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.business_name} (@{self.username})"
    
    @property
    def full_address(self):
        """Return formatted full address"""
        return (
            f"{self.house_number} {self.street_name}, "
            f"{self.barangay}, {self.city}, "
            f"{self.province} {self.zip_code}"
        )
    
    @property
    def is_registration_complete(self):
        """Check if all registration steps are completed"""
        return self.registration_step >= 3
    
    @property
    def required_documents_uploaded(self):
        """Check if all required documents are uploaded based on registration type"""
        if not self.selfie_with_id or not self.valid_id:
            return False
        
        if self.business_registration == self.UNREGISTERED:
            return True
        
        if self.business_registration == self.REGISTERED_NON_VAT:
            return bool(self.barangay_permit and self.dti_sec_certificate)
        
        if self.business_registration == self.REGISTERED_VAT:
            return bool(
                self.barangay_permit and 
                self.dti_sec_certificate and 
                self.bir_certificate and 
                self.mayors_permit
            )
        
        return False
