import { motion, type Easing, type Variants } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../validators/reset-password.schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resetPassword } from '../services/auth.api'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

type PasswordStrength = 'weak' | 'medium' | 'strong'

const getPasswordStrength = (password: string): { strength: PasswordStrength; score: number } => {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { strength: 'weak', score }
  if (score <= 4) return { strength: 'medium', score }
  return { strength: 'strong', score }
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ strength: PasswordStrength; score: number } | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const easeOut: Easing = [0.16, 1, 0.3, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
        when: 'beforeChildren',
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  }

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Invalid or missing reset token',
        severity: 'error',
      })
      return
    }

    try {
      await resetPassword(token, values.password)
      setSnackbar({
        open: true,
        message: 'Password reset successful. Please log in.',
        severity: 'success',
      })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Password reset failed',
        severity: 'error',
      })
    }
  }

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-[#181818] p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Set a new password
        </h1>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter a new password for your account.
        </p>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">New password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          onChange={(e) => {
                            field.onChange(e)
                            const value = e.target.value
                            if (value) {
                              setPasswordStrength(getPasswordStrength(value))
                            } else {
                              setPasswordStrength(null)
                            }
                          }}
                          className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954] pr-10"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordStrength && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div
                              key={bar}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                bar <= passwordStrength.score
                                  ? passwordStrength.strength === 'weak'
                                    ? 'bg-red-500'
                                    : passwordStrength.strength === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            passwordStrength.strength === 'weak'
                              ? 'text-red-400'
                              : passwordStrength.strength === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          Password strength: {passwordStrength.strength}
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Confirm password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954] pr-10"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Resetting...' : 'Reset password'}
              </Button>
            </motion.div>
          </motion.form>
        </Form>

        <div className="mt-6 text-sm text-center text-gray-400">
          <Link to="/login" className="text-[#1DB954] hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
