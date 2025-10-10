# Testing /api/v1/auth/me Endpoint

## Purpose
This endpoint validates JWT tokens and returns user information for RBAC.

## Test Steps

### 1. Start Django Backend
```bash
cd apps/api
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py runserver
```

### 2. Test Without Token (Should Fail)
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Content-Type: application/json"
```

**Expected Response:** 401 Unauthorized

### 3. Test With Valid Token

First, login to get a token:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@talentbase.com",
    "password": "your_password"
  }'
```

Then use the token:
```bash
TOKEN="<token_from_login>"

curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "admin@talentbase.com",
  "role": "admin",
  "name": "Admin",
  "is_active": true
}
```

### 4. Test Frontend Integration

Start the Remix dev server:
```bash
cd packages/web
npm run dev
```

Try to access `/admin` without login:
- Should redirect to `/auth/login`

Login with admin credentials:
- Should successfully access `/admin`

Try to access `/admin` with a candidate token:
- Should get 403 Forbidden

## Security Checklist

- ✅ Endpoint requires authentication
- ✅ Invalid tokens are rejected
- ✅ Returns minimal user info (no sensitive data)
- ✅ Frontend validates role before rendering admin pages
- ✅ Unauthorized access redirects to login

## Notes

- The endpoint uses `JWTAuthentication` from DRF SimpleJWT
- Token must be in `Authorization: Bearer <token>` header
- Frontend stores token in httpOnly cookie `auth_token`
