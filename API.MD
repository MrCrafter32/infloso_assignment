// filepath: c:\Projects\infloso_assignment\API.MD

# ConnectVerse Auth API

Base URL: `http://localhost:3000/api/auth`

All endpoints respond with JSON. Errors use the shape:

```json
{ "error": "message" }
```

## Authentication

Protected routes require the header:

```
Authorization: Bearer <jwt>
```

## Rate limiting

Auth routes are rate limited to 10 requests per 15 minutes per IP.

## Endpoints

### POST /signup

Create a new user account and send a verification email.

**Request body**

```json
{
	"email": "user@example.com",
	"username": "user123",
	"firstName": "User",
	"lastName": "Example",
	"password": "secret123"
}
```

**Success (201)**

```json
{
	"success": true,
	"message": "Token sent to email for verification"
}
```

**Possible errors**
- 400 User already exists / Username already taken
- 500 An error occurred during signup

---

### POST /login

Login with username or email and password.

**Request body**

```json
{
	"search": "user@example.com",
	"password": "secret123"
}
```

**Success (200)**

```json
{
	"message": "Login successful",
	"user": {
		"id": "...",
		"email": "user@example.com",
		"username": "user123",
		"firstName": "User",
		"lastName": "Example",
		"isVerified": true,
		"createdAt": "2026-01-18T00:00:00.000Z"
	},
	"token": "<jwt>"
}
```

**Possible errors**
- 401 Email not verified / Invalid password
- 404 User not found or Invalid Password
- 500 An error occurred during login

---

### POST /forgot-password

Send a password reset email.

**Request body**

```json
{
	"email": "user@example.com"
}
```

**Success (200)**

```json
{
	"success": true,
	"message": "Token sent to email for verification"
}
```

**Possible errors**
- 404 User not found
- 400 A reset token has already been sent. Please check your email.
- 500 An error occurred during password reset

---

### POST /verify-email

Verify user email with a token.

**Request body**

```json
{
	"token": "<token>"
}
```

**Success (200)**

```json
{
	"message": "Email verified successfully"
}
```

**Possible errors**
- 400 Token is required / Invalid or expired token / Invalid token

---

### POST /reset-password?token=...

Reset the user password with the reset token.

**Request body**

```json
{
	"newPassword": "new-secret"
}
```

**Success (200)**

```json
{
	"message": "Password reset successfully"
}
```

**Possible errors**
- 400 Token and new password are required / Invalid or expired token / Invalid token

---

### POST /resend-verification-email

Resend email verification or reset password token.

**Request body**

```json
{
	"email": "user@example.com",
	"type": "verify-email"
}
```

**Success (200)**

```json
{
	"success": true,
	"message": "Token sent to email for verification"
}
```

**Possible errors**
- 404 User not found
- 500 An error occurred during resending verification email

---

### GET /me

Get the current authenticated user.

**Headers**

```
Authorization: Bearer <jwt>
```

**Success (200)**

```json
{
	"user": {
		"id": "...",
		"email": "user@example.com",
		"username": "user123",
		"firstName": "User",
		"lastName": "Example",
		"isVerified": true,
		"createdAt": "2026-01-18T00:00:00.000Z"
	}
}
```

**Possible errors**
- 401 Unauthorized: No token provided / Invalid token / User not found
- 500 An error occurred while fetching user details

---

### GET /logout

Stateless logout (client should discard the token).

**Headers**

```
Authorization: Bearer <jwt>
```

**Success (200)**

```json
{
	"message": "Logout successful"
}
```
