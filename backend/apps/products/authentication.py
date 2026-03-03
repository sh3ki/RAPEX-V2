"""
Merchant Authentication
=======================
Custom JWT authentication backend that resolves the authenticated Merchant
from a token issued by RefreshToken.for_user(merchant).

The Merchant model is a separate AbstractBaseUser, distinct from users.User
(the AUTH_USER_MODEL).  simplejwt's default JWTAuthentication resolves tokens
using AUTH_USER_MODEL, so we need our own backend that targets the Merchant table.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework import authentication, exceptions
from rest_framework_simplejwt.tokens import AccessToken
from apps.merchants.models import Merchant


class MerchantJWTAuthentication(authentication.BaseAuthentication):
    """
    Authenticate a request using a JWT token issued for a Merchant.
    Returns (merchant_instance, token) on success.
    """

    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith(f'{self.keyword} '):
            return None

        raw_token = auth_header.split(' ', 1)[1].strip()
        if not raw_token:
            return None

        try:
            token = AccessToken(raw_token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid or expired token.')

        merchant_id = token.get('user_id')
        if not merchant_id:
            raise exceptions.AuthenticationFailed('Token missing user_id claim.')

        try:
            merchant = Merchant.objects.get(pk=merchant_id, is_active=True)
        except Merchant.DoesNotExist:
            raise exceptions.AuthenticationFailed('Merchant not found or inactive.')

        return (merchant, token)


class IsMerchantAuthenticated:
    """
    DRF-compatible permission check.
    Works with MerchantJWTAuthentication.
    """

    def has_permission(self, request, view):
        return (
            request.user is not None
            and isinstance(request.user, Merchant)
        )
