from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password


class User(AbstractUser):
    """
    Custom User model with role-based access.
    Roles: ADMIN, MERCHANT, RIDER, USER
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MERCHANT = 'merchant', 'Merchant'
        RIDER = 'rider', 'Rider'
        USER = 'user', 'User'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_user'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return self.role == role

    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    def is_merchant(self) -> bool:
        return self.role == self.Role.MERCHANT

    def is_rider(self) -> bool:
        return self.role == self.Role.RIDER

    def is_regular_user(self) -> bool:
        return self.role == self.Role.USER
