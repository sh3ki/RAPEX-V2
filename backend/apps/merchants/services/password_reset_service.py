import re
import random
import string
import logging
from django.core.cache import cache
from apps.merchants.models import Merchant

logger = logging.getLogger(__name__)

OTP_EXPIRY_SECONDS = 600  # 10 minutes
OTP_VERIFIED_EXPIRY_SECONDS = 600  # 10 minutes to reset after verification

PASSWORD_MIN_LENGTH = 8


class PasswordResetService:
    """
    Service for merchant password reset via OTP.
    Uses Redis (Django cache) to store OTPs with TTL.
    """

    # ---------- helpers ----------

    @staticmethod
    def _otp_cache_key(email: str) -> str:
        return f"merchant_otp:{email}"

    @staticmethod
    def _verified_cache_key(email: str) -> str:
        return f"merchant_otp_verified:{email}"

    # ---------- public API ----------

    @classmethod
    def get_active_merchant(cls, email: str) -> 'Merchant | None':
        """Return the active Merchant for this email, or None."""
        try:
            return Merchant.objects.get(email__iexact=email, is_active=True)
        except Merchant.DoesNotExist:
            return None

    @classmethod
    def generate_and_store_otp(cls, email: str) -> 'tuple[str, Merchant] | tuple[None, None]':
        """
        Generate a 6-digit OTP and save it to cache.
        Returns (otp, merchant) on success, or (None, None) if email is unknown.
        """
        merchant = cls.get_active_merchant(email)
        if merchant is None:
            logger.warning(f"Password reset attempted for unknown email: {email}")
            return None, None

        otp = "".join(random.choices(string.digits, k=6))
        cache.set(cls._otp_cache_key(email.lower()), otp, timeout=OTP_EXPIRY_SECONDS)
        # Clear any previous verified flag
        cache.delete(cls._verified_cache_key(email.lower()))
        logger.info(f"OTP generated for merchant: {email}")
        return otp, merchant

    @classmethod
    def verify_otp(cls, email: str, otp: str) -> bool:
        """
        Verify the 6-digit OTP for the given email.
        On success, marks the session as verified and removes the OTP.
        """
        stored_otp = cache.get(cls._otp_cache_key(email.lower()))
        if stored_otp and stored_otp == otp.strip():
            # Mark as verified
            cache.set(cls._verified_cache_key(email.lower()), True, timeout=OTP_VERIFIED_EXPIRY_SECONDS)
            cache.delete(cls._otp_cache_key(email.lower()))
            logger.info(f"OTP verified for merchant: {email}")
            return True
        logger.warning(f"OTP verification failed for merchant: {email}")
        return False

    @classmethod
    def is_verified(cls, email: str) -> bool:
        """Check whether this email has a valid verified OTP session."""
        return bool(cache.get(cls._verified_cache_key(email.lower())))

    @staticmethod
    def validate_password(password: str, confirm_password: str) -> 'str | None':
        """
        Validate password strength and confirmation.
        Returns an error message string on failure, or None on success.
        """
        if not password or not confirm_password:
            return 'New password and confirm password are required.'
        if password != confirm_password:
            return 'Passwords do not match.'
        if len(password) < PASSWORD_MIN_LENGTH:
            return f'Password must be at least {PASSWORD_MIN_LENGTH} characters long.'
        if not re.search(r'[A-Z]', password):
            return 'Password must contain at least one uppercase letter.'
        if not re.search(r'[a-z]', password):
            return 'Password must contain at least one lowercase letter.'
        if not re.search(r'\d', password):
            return 'Password must contain at least one number.'
        return None

    @classmethod
    def reset_password(cls, email: str, new_password: str) -> bool:
        """
        Reset the merchant's password.
        Requires a prior successful OTP verification.
        """
        if not cls.is_verified(email):
            logger.warning(f"Password reset attempted without OTP verification for: {email}")
            return False

        merchant = cls.get_active_merchant(email)
        if merchant is None:
            logger.error(f"Merchant not found during password reset: {email}")
            return False

        merchant.set_password(new_password)
        merchant.save(update_fields=["password"])
        cache.delete(cls._verified_cache_key(email.lower()))
        logger.info(f"Password reset successfully for merchant: {email}")
        return True
