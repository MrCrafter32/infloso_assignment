import type {
  LoginCredentials,
  SignupData,
  AuthResponse,
  ApiResponse,
  User,
} from "../types/auth";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signup(data: SignupData): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<ApiResponse>(response);
}

export async function forgotPassword(email: string): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return handleResponse<ApiResponse>(response);
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/reset-password?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });

  return handleResponse<ApiResponse>(response);
}

export async function verifyEmail(token: string): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return handleResponse<ApiResponse>(response);
}

export async function logout(token: string): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<ApiResponse>(response);
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<User>(response);
}
