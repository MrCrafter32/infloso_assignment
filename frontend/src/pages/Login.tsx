import { motion, type Easing, type Variants } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../validators/login.schema'
import type { LoginFormValues } from '../validators/login.schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easeOut },
    },
  }
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      search: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    navigate('/')
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null)
      await login(values, rememberMe)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
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
          Login to MelodyVerse
        </h1>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Email/Username
                    </FormLabel>
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
                    <FormLabel className="text-gray-300">
                      Password
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
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
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
        <motion.div
          variants={itemVariants}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
        >
          <span>Remember me?</span>
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-gray-600 data-[state=checked]:bg-[#1DB954] data-[state=checked]:border-[#1DB954]"
          />
        </motion.div>

        <div className="mt-6 text-sm text-center text-gray-400">
          <Link to="/forgot-password" className="hover:text-[#1DB954]">
            Forgot your password?
          </Link>
        </div>

        <div className="mt-4 text-sm text-center text-gray-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-[#1DB954] hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
