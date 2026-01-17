import { motion, type Easing, type Variants } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '../validators/signup.schema'
import type { SignupFormValues } from '../validators/signup.schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { signup } from '../services/auth.api'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
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

export default function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ strength: PasswordStrength; score: number } | null>(null)

  const easeOut: Easing = [0.16, 1, 0.3, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
        when: 'beforeChildren',
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: easeOut },
    },
  }

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const onSubmit = async (values: SignupFormValues) => {
    try {
      if (!values.terms) {
        setError('You must accept the terms')
        return
      }
      setError(null)
      setSuccess(null)

      const { confirmPassword, terms, ...payload } = values
      await signup(payload)

      setSuccess('Account created. Please verify your email.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-[#181818] p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-6">
          Create your MelodyVerse account
        </h1>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            variants={itemVariants}
            className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400 text-center"
          >
            {success}
          </motion.div>
        )}

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={itemVariants} className="flex gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-gray-300">First name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-gray-300">Last name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </motion.div>

            <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </motion.div>

            <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...field}
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...field}
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
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='border-gray-600 data-[state=checked]:bg-[#1DB954] data-[state=checked]:border-[#1DB954]'
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-400">
                    I agree to the terms and conditions
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
              </Button>
            </motion.div>
          </motion.form>
        </Form>

        <div className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1DB954] hover:underline">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
