from django.contrib.auth import authenticate
from .models import User


class AuthService:
    """
    Service for authentication logic.
    Handles user login, registration, and token generation.
    Business logic lives here, not in views.
    """

    @staticmethod
    def authenticate_user(email: str, password: str) -> User:
        """
        Authenticate user with email and password.
        Raises exception if credentials are invalid.
        """
        user = authenticate(username=email, password=password)
        
        if not user:
            raise ValueError('Invalid credentials.')
        
        if not user.is_active:
            raise ValueError('User account is inactive.')
        
        return user

    @staticmethod
    def register_user(email: str, password: str, role: str, **kwargs) -> User:
        """
        Register a new user with the given role.
        """
        if User.objects.filter(email=email).exists():
            raise ValueError('Email already registered.')
        
        if role not in User.Role.values:
            raise ValueError('Invalid role.')
        
        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            role=role,
            first_name=kwargs.get('first_name', ''),
            last_name=kwargs.get('last_name', ''),
            phone=kwargs.get('phone', ''),
        )
        
        return user

    @staticmethod
    def get_user_by_email(email: str) -> User:
        """Get user by email."""
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValueError('User not found.')
