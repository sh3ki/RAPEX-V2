# RAPEX MVP - Local Development with Docker

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### 1. Start the Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Django backend on port 8000
- Next.js frontend on port 3000

### 2. Create a Superuser (Optional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## Testing Login

### Test Accounts

Create accounts by registering through the UI or using the API:

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }'
```

Available roles: `admin`, `merchant`, `rider`, `user`

### Login Flow

1. Go to http://localhost:3000
2. Click on your role's login button
3. Enter credentials
4. You'll be redirected to the role-specific dashboard

## Project Structure

```
rapex-v2/
├── backend/
│   ├── apps/users/        # User management app
│   ├── config/            # Django settings
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages by role
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Key Features Implemented

✅ Role-based authentication (Admin, Merchant, Rider, User)
✅ JWT token-based authentication
✅ Role-specific login pages
✅ Role-specific dashboards
✅ Service-based business logic (OOP-driven)
✅ Component-driven frontend
✅ Docker Compose setup
✅ PostgreSQL database

## API Endpoints

### Authentication
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login and get JWT tokens
- `GET /api/users/me/` - Get current user
- `POST /api/users/logout/` - Logout

## Development Notes

- Backend uses Django REST Framework with JWT authentication
- Frontend uses Next.js with TypeScript
- All business logic is in services, not views
- Database indexes on frequently queried fields
- CORS configured for local development

## Troubleshooting

### Port already in use
```bash
# Kill process on port
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

### Database connection issues
```bash
docker-compose down
docker volume rm rapex-v2_postgres_data
docker-compose up -d
```

### Clear Docker cache
```bash
docker-compose down --volumes
docker system prune -a
docker-compose up -d
```

## Next Steps

After login system works:
1. Create merchants app
2. Create products app
3. Create orders app
4. Add payment processing
5. Add real-time updates with WebSockets
