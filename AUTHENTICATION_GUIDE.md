# Authentication Guide

## Admin Login Credentials

After running the seed script, you can login with:

**Email:** `admin@clickmychat.com`  
**Password:** `admin123`

⚠️ **Important:** Change the password after first login!

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- `jsonwebtoken` - For JWT token generation
- `bcryptjs` - For password hashing

### 2. Create Admin User

```bash
npm run seed:admin
```

This will create an admin user with:
- Email: `admin@clickmychat.com`
- Password: `admin123`
- Role: `admin`

### 3. Start the Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 4. Login

1. Navigate to `/login` in your frontend
2. Enter the admin credentials
3. You'll be redirected to the dashboard upon successful login

## Features

### Authentication System

✅ **User Registration** - Create new users via API  
✅ **User Login** - JWT-based authentication  
✅ **Protected Routes** - Frontend routes require authentication  
✅ **Token Storage** - JWT tokens stored in localStorage  
✅ **Password Hashing** - Passwords are hashed using bcrypt  
✅ **Role-Based Access** - Admin and user roles supported  

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

#### Request Format

**Login:**
```json
POST /api/auth/login
{
  "email": "admin@clickmychat.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@clickmychat.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Security Features

1. **Password Hashing** - All passwords are hashed using bcrypt before storage
2. **JWT Tokens** - Secure token-based authentication
3. **Token Expiration** - Tokens expire after 30 days
4. **Protected Routes** - API routes can be protected with auth middleware
5. **Role-Based Access** - Admin and user roles for different access levels

## Frontend Integration

### Login Flow

1. User enters email and password
2. Frontend calls `authAPI.login(email, password)`
3. Token and user data stored in localStorage
4. User redirected to dashboard
5. All subsequent API calls include the token in headers

### Logout

To logout, call:
```javascript
import { authAPI } from '../utils/api';
authAPI.logout();
```

This will:
- Remove token from localStorage
- Remove user data from localStorage
- Redirect to login page (if implemented)

### Protected Routes

All dashboard routes are protected by `ProtectedRoute` component:
- If user is not logged in, redirects to `/login`
- If user is logged in, shows the protected content

## Environment Variables

Make sure your `server/.env` file includes:

```
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

⚠️ **Change JWT_SECRET in production!**

## Creating Additional Users

### Via API

```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // or "admin"
}
```

### Via Database Seed

You can modify `server/scripts/seedAdmin.js` to create additional users.

## Troubleshooting

### "Invalid credentials" error
- Check that the admin user was created: `npm run seed:admin`
- Verify email and password are correct
- Check server logs for errors

### "Not authorized" error
- Token may have expired (30 days)
- Token may be missing from localStorage
- Try logging in again

### Token not being sent
- Check browser localStorage for 'token'
- Verify API calls include Authorization header
- Check browser console for errors

## Next Steps

1. **Add Password Reset** - Implement forgot password functionality
2. **Add Email Verification** - Verify user emails
3. **Add Session Management** - Track active sessions
4. **Add Rate Limiting** - Prevent brute force attacks
5. **Add 2FA** - Two-factor authentication
6. **Add Password Policy** - Enforce strong passwords
