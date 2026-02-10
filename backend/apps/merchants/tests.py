from django.test import TestCase
from apps.merchants.models import Merchant
from apps.merchants.services.registration_service import MerchantRegistrationService


class MerchantModelTests(TestCase):
    """Test cases for Merchant model"""
    
    def setUp(self):
        """Set up test data"""
        self.merchant_data = {
            'username': 'testmerchant',
            'email': 'test@merchant.com',
            'business_name': 'Test Business',
            'owner_name': 'Test Owner',
            'phone_number': '+63 912 123 1234',
            'business_registration': Merchant.UNREGISTERED
        }
    
    def test_create_merchant(self):
        """Test merchant creation"""
        merchant = Merchant.objects.create_merchant(
            email=self.merchant_data['email'],
            username=self.merchant_data['username'],
            password='testpass123'
        )
        
        self.assertEqual(merchant.username, 'testmerchant')
        self.assertEqual(merchant.email, 'test@merchant.com')
        self.assertTrue(merchant.check_password('testpass123'))
    
    def test_phone_number_format(self):
        """Test phone number validation"""
        merchant = Merchant.objects.create(
            **self.merchant_data
        )
        
        self.assertEqual(merchant.phone_number, '+63 912 123 1234')


class RegistrationServiceTests(TestCase):
    """Test cases for MerchantRegistrationService"""
    
    def test_generate_password(self):
        """Test password generation"""
        password = MerchantRegistrationService.generate_password()
        
        self.assertEqual(len(password), 12)
        self.assertTrue(any(c.isalpha() for c in password))
        self.assertTrue(any(c.isdigit() for c in password))
    
    def test_validate_step_data(self):
        """Test step data validation"""
        step1_data = {
            'business_name': 'Test Business',
            'owner_name': 'Test Owner',
            'username': 'testuser',
            'phone_number': '+63 912 123 1234',
            'email': 'test@example.com',
            'business_registration': Merchant.UNREGISTERED
        }
        
        is_valid, error = MerchantRegistrationService.validate_step_data(1, step1_data)
        
        self.assertTrue(is_valid)
        self.assertIsNone(error)
