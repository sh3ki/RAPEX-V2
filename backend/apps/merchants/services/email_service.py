from django.core.mail import send_mail
from django.conf import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service class for sending emails
    Handles all email-related functionality
    """
    
    @staticmethod
    def send_welcome_email(
        email: str, 
        business_name: str, 
        username: str, 
        password: str
    ) -> bool:
        """
        Send welcome email with auto-generated password to new merchant
        
        Args:
            email: Merchant's email address
            business_name: Business name
            username: Merchant's username
            password: Auto-generated password
            
        Returns:
            True if email sent successfully, False otherwise
        """
        subject = f"Welcome to RAPEX - Your Merchant Account is Ready!"
        
        message = f"""
Dear {business_name},

Welcome to RAPEX E-Commerce & Delivery Platform!

Your merchant account has been successfully created. Here are your login credentials:

Username: {username}
Password: {password}

IMPORTANT SECURITY NOTICE:
For your security, please change this auto-generated password immediately after your first login.

You can now log in to your merchant dashboard at:
{settings.FRONTEND_URL}/merchant/login

Getting Started:
1. Log in with the credentials above
2. Change your password in Account Settings
3. Complete your business profile
4. Start adding your products
5. Begin accepting orders!

Your account is currently under review. You will be notified once your account is verified and approved.

If you have any questions or need assistance, please contact our support team.

Best regards,
RAPEX Team

---
This is an automated message. Please do not reply to this email.
        """
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .credentials {{
            background: white;
            padding: 20px;
            border-left: 4px solid #f97316;
            margin: 20px 0;
        }}
        .warning {{
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .button {{
            display: inline-block;
            background: #f97316;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .steps {{
            background: white;
            padding: 20px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to RAPEX!</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{business_name}</strong>,</p>
            
            <p>Congratulations! Your merchant account has been successfully created on the RAPEX E-Commerce & Delivery Platform.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Password:</strong> <code>{password}</code></p>
            </div>
            
            <div class="warning">
                <strong>⚠️ IMPORTANT SECURITY NOTICE:</strong><br>
                For your security, please change this auto-generated password immediately after your first login.
            </div>
            
            <div style="text-align: center;">
                <a href="{settings.FRONTEND_URL}/merchant/login" class="button">
                    Log In to Your Dashboard
                </a>
            </div>
            
            <div class="steps">
                <h3>Getting Started:</h3>
                <ol>
                    <li>Log in with the credentials above</li>
                    <li>Change your password in Account Settings</li>
                    <li>Complete your business profile</li>
                    <li>Start adding your products</li>
                    <li>Begin accepting orders!</li>
                </ol>
            </div>
            
            <p><em>Your account is currently under review. You will be notified once your account is verified and approved.</em></p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br><strong>RAPEX Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2026 RAPEX. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Welcome email sent successfully to {email}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_otp_email(email: str, business_name: str, otp: str) -> bool:
        """
        Send OTP email for password reset.

        Args:
            email: Merchant's email address
            business_name: Business name (used for greeting)
            otp: 6-digit OTP string

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "RAPEX - Your Password Reset OTP"

        message = f"""
Dear {business_name},

You have requested to reset your RAPEX merchant account password.

Your One-Time Password (OTP) is:

{otp}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you did not request a password reset, please ignore this email. Your account remains secure.

Best regards,
RAPEX Team

---
This is an automated message. Please do not reply to this email.
        """

        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .otp-box {{
            background: white;
            border: 2px dashed #f97316;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }}
        .otp-code {{
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #f97316;
            font-family: 'Courier New', monospace;
        }}
        .warning {{
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset OTP</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{business_name}</strong>,</p>
            <p>You have requested to reset your <strong>RAPEX</strong> merchant account password.</p>
            <p>Use the OTP below to verify your identity:</p>

            <div class="otp-box">
                <p style="margin: 0 0 8px; color: #555; font-size: 14px;">Your One-Time Password</p>
                <div class="otp-code">{otp}</div>
                <p style="margin: 8px 0 0; color: #888; font-size: 13px;">Valid for <strong>10 minutes</strong></p>
            </div>

            <div class="warning">
                <strong>⚠️ SECURITY NOTICE:</strong><br>
                Never share this OTP with anyone. RAPEX staff will never ask for your OTP.
                If you did not request this, please ignore this email.
            </div>

            <p>Best regards,<br><strong>RAPEX Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2026 RAPEX. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"OTP email sent successfully to {email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {str(e)}")
            return False

    @staticmethod
    def send_verification_status_email(
        email: str,
        business_name: str,
        status: str,
        notes: Optional[str] = None
    ) -> bool:
        """
        Send email notification about account verification status
        
        Args:
            email: Merchant's email address
            business_name: Business name
            status: Verification status (APPROVED, REJECTED)
            notes: Optional notes from admin
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if status == 'APPROVED':
            subject = "🎉 Your RAPEX Merchant Account has been Approved!"
            message_text = f"""
Dear {business_name},

Great news! Your merchant account has been approved.

You can now:
- Add products to your store
- Accept and manage orders
- Track your sales and analytics
- Communicate with customers

Log in to your dashboard to get started:
{settings.FRONTEND_URL}/merchant/login

Best regards,
RAPEX Team
            """
        else:  # REJECTED
            subject = "RAPEX Merchant Account Verification Update"
            message_text = f"""
Dear {business_name},

Thank you for your interest in joining RAPEX as a merchant.

Unfortunately, we were unable to approve your account at this time.

{f"Reason: {notes}" if notes else ""}

If you believe this was an error or would like to reapply, please contact our support team.

Best regards,
RAPEX Team
            """
        
        try:
            send_mail(
                subject=subject,
                message=message_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info(f"Verification status email sent to {email}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {str(e)}")
            return False
