export type LoginCredentials = {
  search: string
  password: string
}

export type SignupData = {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}

export type User = {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  isVerified: boolean
  createdAt: string
}

export type AuthResponse = {
  success: boolean
  message: string
  token: string
  user: User
}

export type ApiResponse = {
  success: boolean
  message: string
}

export type ApiError = {
  success: false
  message: string
  errors?: {
    field: string
    message: string
  }[]
}
