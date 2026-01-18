
# ConnectVerse Auth App

Full‑stack authentication project with email verification and password reset flows. The backend exposes REST endpoints built with Express and Prisma (MongoDB), and the frontend is a React + Vite app.

## Features

- User signup/login with JWT
- Email verification flow
- Forgot/reset password flow
- Protected routes in the UI
- Basic rate limiting on auth endpoints

## Implemented Features Checklist

### Backend Setup
- Node.js project initialized with npm
- Express server structure and routing
- Environment variables configured
- Database connection via Prisma (MongoDB)
- Required dependencies installed (Express, JWT, bcrypt, Prisma)

### Database Design
- User schema with username, email, password
- Optional fields (`name`, `profilePicture`)
- Unique constraints for username and email

### API Development - POST /signup
- Signup route handler
- Input validation (username/email format, password strength)
- Unique username/email checks
- Password hashing (bcrypt)
- Store user data in DB
- Generate JWT for email verification
- Informative success/error responses

### API Development - POST /login
- Login route handler
- Input validation (username/email + password)
- DB lookup by username/email
- Password comparison (bcrypt)
- JWT generation on success
- Error messages for failed authentication

### JWT Implementation
- JWT secret configured in env
- JWT generation with expiration
- JWT validation middleware for protected routes

### Security Measures
- Input sanitization (validator)
- CORS enabled
- Rate limiting to prevent brute-force

### Frontend Setup - React
- Vite + React + TypeScript initialized
- Tailwind CSS configured
- React Router setup
- React Hook Form + Zod validation
- API client configured

### Login Screen
- Username/email + password fields
- Validation + error display
- Remember me checkbox (storage)
- Password visibility toggle
- Forgot password link
- Login API call and token storage
- Redirect after login
- MelodyVerse styling

### Signup Screen
- Input fields and validation (including confirm password)
- Terms and conditions checkbox
- Error/success messages
- Signup API call
- Redirect after signup
- Password strength UI indicator
- MelodyVerse styling

### Responsive UI
- Responsive layout with Tailwind

### Bonus Features
- Password reset flow
- Email verification flow
- API unit tests
- Framer Motion animations
- Auth middleware for protected routes

### Documentation & Testing
- README setup instructions
- API documentation in [API.MD](API.MD)

## Tech Stack

**Backend:** Node.js, Express, Prisma, MongoDB, JWT, Nodemailer, Zod

**Frontend:** React, TypeScript, Vite, React Router, React Hook Form, Zod, Tailwind, MUI

## Project Structure

```
backend/               Express API, Prisma schema, auth logic
frontend/              React UI (Vite + TS)
```

## Prerequisites

- Node.js (18+ recommended)
- npm
- MongoDB connection string
- Gmail account + App Password for SMTP (or equivalent SMTP credentials)

## Environment Variables

### Backend

Create [backend/.env](backend/.env) with:

```
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
JWT_SECRET="your_jwt_secret"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
FRONTEND_URL="http://localhost:5173"
```

Notes:
- `EMAIL_PASS` should be a Gmail App Password if you use Gmail SMTP.
- `FRONTEND_URL` is used to build verification/reset links.

### Frontend

Create [frontend/.env](frontend/.env) with:

```
VITE_BASE_API_URL="http://localhost:3000"
```

## Setup & Run (Local)

### 1) Install dependencies

Backend:

```
cd backend
npm install
```

Frontend:

```
cd frontend
npm install
```

### 2) Prisma (MongoDB)

Generate Prisma client and sync the schema:

```
cd backend
npx prisma generate
npx prisma db push
```

### 3) Start the servers

Backend (API runs on http://localhost:3000):

```
cd backend
npm run dev
```

Frontend (UI runs on http://localhost:5173):

```
cd frontend
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api/auth`

Full API documentation: [API.MD](API.MD)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/signup` | Create account and send verification email |
| POST | `/login` | Login with username/email + password |
| POST | `/forgot-password` | Send password reset email |
| POST | `/verify-email` | Verify email with token |
| POST | `/reset-password?token=...` | Reset password with token |
| POST | `/resend-verification-email` | Resend verification email |
| GET | `/me` | Get current user (requires `Authorization: Bearer <token>`) |
| GET | `/logout` | Logout (stateless) |

Rate limiting is enabled on auth routes (10 requests per 15 minutes per IP).

## Frontend Routes

- `/signup`
- `/login`
- `/verify-email` (expects `?token=...`)
- `/forgot-password`
- `/reset-password` (expects `?token=...`)
- `/` (protected)

## Testing (Backend)

```
cd backend
npm test
```

## Notes

- Default API port is `3000` (see [backend/server.js](backend/server.js)).
- If you change the API port, update `VITE_BASE_API_URL` accordingly.

