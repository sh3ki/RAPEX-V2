from django.contrib import admin
from apps.merchants.models import Merchant


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    """Admin interface for Merchant model"""
    
    list_display = [
        'id',
        'business_name',
        'username',
        'email',
        'phone_number',
        'business_registration',
        'status',
        'is_verified',
        'is_active',
        'registration_step',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'business_registration',
        'is_verified',
        'is_active',
        'is_new',
        'created_at'
    ]
    
    search_fields = [
        'business_name',
        'username',
        'email',
        'phone_number',
        'owner_name'
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'last_login',
        'full_address',
        'is_registration_complete',
        'required_documents_uploaded'
    ]
    
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'email', 'password', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Status', {
            'fields': ('status', 'is_verified', 'is_new', 'registration_step', 'verification_notes')
        }),
        ('Business Information', {
            'fields': (
                'business_name',
                'owner_name',
                'phone_number',
                'business_categories',
                'business_types',
                'business_registration'
            )
        }),
        ('Location', {
            'fields': (
                'zip_code',
                'province',
                'city',
                'barangay',
                'street_name',
                'house_number',
                'latitude',
                'longitude',
                'full_address'
            )
        }),
        ('Documents', {
            'fields': (
                'selfie_with_id',
                'valid_id',
                'barangay_permit',
                'dti_sec_certificate',
                'bir_certificate',
                'mayors_permit',
                'other_documents',
                'required_documents_uploaded'
            )
        }),
        ('Verification', {
            'fields': (
                'verified_at',
                'verified_by'
            )
        }),
        ('Business Metrics', {
            'fields': (
                'rating',
                'total_orders',
                'total_sales'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
        ('Registration Data', {
            'fields': ('temp_registration_data', 'is_registration_complete'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Save model with custom logic"""
        if change and obj.status == Merchant.APPROVED and not obj.is_verified:
            obj.is_verified = True
            obj.verified_by = request.user
            from django.utils import timezone
            obj.verified_at = timezone.now()
        
        super().save_model(request, obj, form, change)
