import { z } from 'zod'

export const loginSchema = z.object({
  search: z.string().min(1, 'Email/Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
