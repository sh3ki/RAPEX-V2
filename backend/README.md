# RAPEX Backend

Django REST API for the RAPEX E-Commerce & Delivery Platform.

## Structure

```
backend/
├── config/             # Django configuration
├── apps/               # Django apps
│   └── users/         # User management app
├── manage.py
└── requirements.txt
```

## Key Features

- Custom User model with role-based access (Admin, Merchant, Rider, User)
- JWT authentication with DRF
- Service-based architecture for business logic
- OOP-driven design following SOLID principles

## API Endpoints

- `POST /api/users/login/` - Login
- `POST /api/users/register/` - Register
- `GET /api/users/me/` - Get current user
- `POST /api/users/logout/` - Logout

## Running

```bash
python manage.py migrate
python manage.py runserver
```

Opens at `http://localhost:8000`
